import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

/**
 * Sliding-window rate limiter.
 *
 * Backends (auto-detected):
 *   • Redis (if REDIS_URL set + ioredis installed) — multi-instance safe
 *   • In-memory Map fallback — single-process only
 *
 * Synchronous form `rateLimit(req, opts)` is kept for backwards compatibility
 * and uses the in-memory backend. For Redis-backed limiting, await
 * `rateLimitAsync(req, opts)` instead.
 *
 *   const limited = rateLimit(req, { key: "login", limit: 5, windowMs: 60_000 });
 *   if (limited) return limited;
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitOptions {
  /** Logical bucket name (e.g. "login", "signup"). */
  key: string;
  /** Max requests allowed per window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
  /** Optional per-user bucket key (in addition to IP). */
  userId?: number | null;
}

export function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const subject = opts.userId ? `u:${opts.userId}` : `ip:${clientIp(req)}`;
  const id = `${opts.key}:${subject}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (bucket.count >= opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(bucket.resetAt / 1000)),
        },
      }
    );
  }

  bucket.count += 1;
  return null;
}

/**
 * Async rate limiter that prefers Redis when available, otherwise falls
 * through to the in-memory implementation. Use this in new code.
 */
export async function rateLimitAsync(
  req: NextRequest,
  opts: RateLimitOptions
): Promise<NextResponse | null> {
  const redis = await getRedis();
  if (!redis.enabled) return rateLimit(req, opts);

  const subject = opts.userId ? `u:${opts.userId}` : `ip:${clientIp(req)}`;
  const key = `lyrii:rl:${opts.key}:${subject}`;
  const ttlSeconds = Math.ceil(opts.windowMs / 1000);

  const { count, ttl } = await redis.incrWithTTL(key, ttlSeconds);

  if (count > opts.limit) {
    const retryAfter = Math.max(1, ttl);
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfter),
        },
      }
    );
  }
  return null;
}
