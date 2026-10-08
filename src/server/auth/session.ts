import "server-only";
import { cookies } from "next/headers";
import { ErrorCodes, HttpStatus, type UserDocument } from "@/shared";
import { connectDb } from "../db";
import { env } from "../env";
import { ApiError } from "../http/errors";
import { UserModel, type UserDoc } from "../models/User";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSessionToken, verifySessionToken } from "./token";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: env().NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession(user: { _id: { toString(): string }; email: string }): Promise<void> {
  const token = await signSessionToken({ userId: user._id.toString(), email: user.email });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_SECONDS));
}

export async function clearSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", cookieOptions(0));
}

/**
 * For Server Components: the signed-in user as plain JSON (the same shape
 * `/api/auth/profile` returns), or `null` when there is no valid session.
 */
export async function getSessionUser(): Promise<UserDocument | null> {
  // cookies() first: it marks the page dynamic, so the build never prerenders it against the database
  if (!(await cookies()).has(SESSION_COOKIE)) return null;
  try {
    await connectDb();
    const user = await requireUser();
    return JSON.parse(JSON.stringify(user.toSafeObject())) as UserDocument;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === HttpStatus.UNAUTHORIZED) return null;
    throw error;
  }
}

/** Returns the signed-in, active user, or throws a 401 `ApiError`. */
export async function requireUser(): Promise<UserDoc> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    throw new ApiError(
      "Access token required",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR,
      undefined,
      "No access token provided"
    );
  }

  const result = await verifySessionToken(token);
  if (!result.ok) {
    throw new ApiError(
      "Invalid or expired token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR,
      undefined,
      result.reason
    );
  }

  const user = await UserModel.findById(result.claims.userId);
  if (!user?.isActive) {
    throw new ApiError(
      "Invalid or expired token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR,
      undefined,
      "User not found or deactivated"
    );
  }

  return user;
}
