import "server-only";
import type { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ErrorCodes, HttpStatus } from "@/shared";
import { fail } from "./respond";

export class ApiError extends Error {
  /**
   * @param details - sent as `error.details`
   * @param reason - sent as `error.message` when it differs from `message`
   */
  constructor(
    message: string,
    public readonly statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    public readonly details?: Record<string, unknown>,
    public readonly reason?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Maps any thrown value to the error JSON the Express error handler sent. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return fail(error.statusCode, error.message, error.code, {
      reason: error.reason,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return fail(HttpStatus.BAD_REQUEST, "Validation failed", ErrorCodes.VALIDATION_ERROR, {
      reason: "Request validation failed",
      details: {
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
    });
  }

  if (error instanceof Error) {
    if (error.name === "ValidationError") {
      return fail(HttpStatus.BAD_REQUEST, "Validation failed", ErrorCodes.VALIDATION_ERROR, {
        details: { errors: error.message },
      });
    }
    if (error.name === "CastError") {
      return fail(HttpStatus.BAD_REQUEST, "Invalid data format", ErrorCodes.VALIDATION_ERROR);
    }
    if (error.name === "MongoServerError") {
      const mongoError = error as Error & { code?: number; keyPattern?: Record<string, unknown> };
      if (mongoError.code === 11000) {
        return fail(HttpStatus.CONFLICT, "Resource already exists", ErrorCodes.DUPLICATE_RESOURCE, {
          details: { duplicateField: Object.keys(mongoError.keyPattern ?? {})[0] },
        });
      }
      console.error("Database error:", error);
      return fail(HttpStatus.INTERNAL_SERVER_ERROR, "Database operation failed", ErrorCodes.DATABASE_ERROR);
    }
  }

  // Logs the error only, never the request body, which can hold passwords.
  console.error("Unhandled API error:", error);
  return fail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", ErrorCodes.INTERNAL_SERVER_ERROR);
}
