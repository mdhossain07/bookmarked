import "server-only";
import { ipAddress } from "@vercel/functions";
import { ErrorCodes, HttpStatus } from "@/shared";
import { ApiError } from "./http/errors";
import { RateLimitModel } from "./models/RateLimit";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const AUTH_RATE_LIMIT: RateLimitRule = { limit: 10, windowMs: 15 * 60 * 1000 };
export const AI_RATE_LIMIT: RateLimitRule = { limit: 20, windowMs: 60 * 60 * 1000 };

/** Client IP from Vercel's headers; one shared bucket when there is none (local dev). */
export function clientIp(req: Request): string {
  return ipAddress(req) ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Counts one request for `key` in a fixed window and throws 429 when the
 * window is full.
 */
export async function enforceRateLimit(key: string, { limit, windowMs }: RateLimitRule): Promise<void> {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  const bucketKey = `${key}:${windowStart}`;
  const update = {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date(windowStart + windowMs) },
  };

  let entry;
  try {
    entry = await RateLimitModel.findOneAndUpdate({ key: bucketKey }, update, { upsert: true, new: true });
  } catch (error) {
    // Two first requests in the same window can race on the upsert; the loser retries as an update.
    if ((error as { code?: number }).code !== 11000) throw error;
    entry = await RateLimitModel.findOneAndUpdate({ key: bucketKey }, update, { new: true });
  }

  if (entry && entry.count > limit) {
    const retryAfterSeconds = Math.ceil((windowStart + windowMs - now) / 1000);
    throw new ApiError(
      "Too many requests, please try again later.",
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      { retryAfterSeconds }
    );
  }
}
