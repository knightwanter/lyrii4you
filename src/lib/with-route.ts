import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodTypeAny, z } from "zod";
import { getAuthUserId } from "@/lib/jwt";
import { rateLimit, RateLimitOptions } from "@/lib/rate-limit";

/**
 * Standard API response shape.
 *   success: { ok: true, data }
 *   failure: { ok: false, error: { code, message, details? } }
 *
 * Use `withRoute` to wrap handlers — it gives you:
 *   • optional zod body parsing (auto 400 on failure)
 *   • optional auth check  (auto 401 if missing)
 *   • optional rate limiting
 *   • try/catch with consistent error envelope
 *   • request log line in dev
 */

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiOk<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiErr> {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

interface RouteOptions<B extends ZodTypeAny | undefined> {
  body?: B;
  auth?: boolean;
  rateLimit?: RateLimitOptions;
}

interface RouteContext<B extends ZodTypeAny | undefined> {
  req: NextRequest;
  body: B extends ZodTypeAny ? z.infer<B> : undefined;
  userId: number | null;
  params: Record<string, string>;
}

type Handler<B extends ZodTypeAny | undefined, R> = (ctx: RouteContext<B>) => Promise<R> | R;

export function withRoute<B extends ZodTypeAny | undefined, R>(
  options: RouteOptions<B>,
  handler: Handler<B, R>
) {
  return async (
    req: NextRequest,
    ctx: { params?: Promise<Record<string, string>> } = {}
  ): Promise<NextResponse> => {
    try {
      if (options.rateLimit) {
        const limited = rateLimit(req, options.rateLimit);
        if (limited) return limited;
      }

      const userId = getAuthUserId(req);
      if (options.auth && !userId) {
        return fail(401, "UNAUTHORIZED", "Authentication required");
      }

      let body: unknown = undefined;
      if (options.body) {
        try {
          const json = await req.json();
          body = options.body.parse(json);
        } catch (err) {
          if (err instanceof ZodError) {
            return fail(400, "INVALID_INPUT", "Invalid request body", err.issues);
          }
          return fail(400, "INVALID_JSON", "Request body must be valid JSON");
        }
      }

      const params = ctx.params ? await ctx.params : {};

      const result = await handler({
        req,
        body: body as RouteContext<B>["body"],
        userId,
        params,
      });

      // Allow handlers to return either a NextResponse or raw data
      if (result instanceof NextResponse) return result;
      return ok(result);
    } catch (err) {
      console.error("[withRoute] unhandled error:", err);
      return fail(500, "SERVER_ERROR", "An unexpected error occurred");
    }
  };
}
