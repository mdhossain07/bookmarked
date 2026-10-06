import "server-only";
import { cookies } from "next/headers";
import { ErrorCodes, HttpStatus } from "@/shared";
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
