import "server-only";
import { SignJWT, jwtVerify, errors } from "jose";
import { env } from "../env";

// No database or next/headers imports: proxy.ts uses this file too.

export const SESSION_COOKIE = "accessToken";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SessionClaims {
  userId: string;
  email: string;
}

const secretKey = () => new TextEncoder().encode(env().JWT_SECRET);

export function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export type VerifyResult =
  | { ok: true; claims: SessionClaims }
  | { ok: false; reason: "Token expired" | "Invalid token" };

export async function verifySessionToken(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return { ok: false, reason: "Invalid token" };
    }
    return { ok: true, claims: { userId: payload.userId, email: payload.email } };
  } catch (error) {
    return { ok: false, reason: error instanceof errors.JWTExpired ? "Token expired" : "Invalid token" };
  }
}
