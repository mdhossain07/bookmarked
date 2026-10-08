import "server-only";
import type { NextRequest } from "next/server";
import { connectDb } from "../db";
import { toErrorResponse } from "./errors";

type Handler<Context> = (req: NextRequest, ctx: Context) => Promise<Response>;

/**
 * Wraps a Route Handler: opens the database, runs the handler, and turns any
 * thrown error into the shared error JSON.
 * @param options.db - set `false` for handlers that never touch the database
 */
export function route<Context = unknown>(
  handler: Handler<Context>,
  { db = true }: { db?: boolean } = {}
): Handler<Context> {
  return async (req, ctx) => {
    try {
      if (db) await connectDb();
      return await handler(req, ctx);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
