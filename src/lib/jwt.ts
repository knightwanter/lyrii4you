import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || JWT_SECRET;
const RESET_TOKEN_EXPIRY = process.env.RESET_TOKEN_EXPIRY || "30m";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Refusing to start with an insecure default."
  );
}

const SECRET: string = JWT_SECRET;
const RESET_SECRET: string = RESET_TOKEN_SECRET as string;

export const AUTH_COOKIE_NAME = "lyrii_token";

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: JWT_EXPIRY as string & jwt.SignOptions["expiresIn"] });
}

export function generatePasswordResetToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email, purpose: "password-reset" },
    RESET_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRY as string & jwt.SignOptions["expiresIn"] }
  );
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: number };
  } catch {
    return null;
  }
}

/**
 * Extract the authenticated user id from a request.
 * Prefers the httpOnly `lyrii_token` cookie, falls back to `Authorization: Bearer …`
 * for transitional compatibility with older clients.
 */
export function getAuthUserId(req: NextRequest): number | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload?.userId) return payload.userId;
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload?.userId) return payload.userId;
  }
  return null;
}

export function verifyPasswordResetToken(token: string): { userId: number; email: string; purpose: string } | null {
  try {
    const payload = jwt.verify(token, RESET_SECRET) as { userId: number; email: string; purpose: string };
    return payload.purpose === "password-reset" ? payload : null;
  } catch {
    return null;
  }
}

/** Build a Set-Cookie header for the auth cookie. */
export function buildAuthCookie(token: string, maxAgeDays = 7): string {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function buildClearAuthCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
