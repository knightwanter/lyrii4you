import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side auth redirect logic for protected routes.
 *
 * This is the intended source of truth for protecting (app) routes in this project.
 * The exported `proxy(request)` function + `config.matcher` are designed to be
 * invoked from the actual request pipeline (custom server wrapper, edge handler,
 * or by renaming this file to middleware.ts at the root when the integration is ready).
 *
 * Primary credential: httpOnly "lyrii_token" cookie (set at login).
 * Fallback: Authorization: Bearer <token> header (legacy client support).
 *
 * When called for a protected path without a valid token, returns a 302 to
 * /login?redirect=...
 */

const protectedPaths = [
  "/feed", "/write", "/messages", "/analytics", "/notifications",
  "/bottles", "/unsent", "/whispers", "/secret-crush", "/verse-exchange",
  "/found-words", "/collections", "/journals", "/settings", "/admin",
  "/profile", "/post", "/people", "/features", "/explore",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("lyrii_token")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const hasToken = !!token || request.cookies.has("lyrii_token");

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/write/:path*",
    "/messages/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/bottles/:path*",
    "/unsent/:path*",
    "/whispers/:path*",
    "/secret-crush/:path*",
    "/verse-exchange/:path*",
    "/found-words/:path*",
    "/collections/:path*",
    "/journals/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/post/:path*",
    "/people/:path*",
    "/features/:path*",
    "/explore/:path*",
  ],
};
