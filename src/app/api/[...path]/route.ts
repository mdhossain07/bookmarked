import type { NextRequest } from "next/server";
import { ErrorCodes, HttpStatus } from "@/shared";
import { fail } from "@/server/http/respond";

// JSON 404 for unknown /api paths; without it Next.js answers with its HTML 404 page.
function notFound(req: NextRequest) {
  return fail(HttpStatus.NOT_FOUND, `Route ${req.method} ${req.nextUrl.pathname} not found`, ErrorCodes.NOT_FOUND, {
    reason: "The requested resource was not found",
  });
}

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE };
