import "server-only";
import { NextResponse } from "next/server";
import { HttpStatus, type ApiResponse } from "@/shared";

/** Success response in the shared `ApiResponse` shape. */
export function ok<T>(message: string, data?: T, status: number = HttpStatus.OK): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, { status });
}

/**
 * Error response in the shared `ApiResponse` shape.
 * @param reason - `error.message`; defaults to `message`
 */
export function fail(
  status: number,
  message: string,
  code: string,
  { reason, details }: { reason?: string; details?: Record<string, unknown> } = {}
): NextResponse {
  const body: ApiResponse = {
    success: false,
    message,
    error: { code, message: reason ?? message, details: details ?? {} },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, { status });
}
