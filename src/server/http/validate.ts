import "server-only";
import type { z } from "zod";
import { ErrorCodes, HttpStatus } from "@/shared";
import { ApiError } from "./errors";

/** Parses the JSON body with `schema`. An empty body counts as `{}`, so schema errors name the missing fields. */
export async function parseBody<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  const text = await req.text();
  let raw: unknown = {};
  if (text.trim()) {
    try {
      raw = JSON.parse(text);
    } catch {
      throw new ApiError("Invalid JSON body", HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }
  }
  return schema.parse(raw);
}

/** Parses the query string with `schema`. A repeated key becomes an array: `?status=a&status=b`. */
export function parseQuery<S extends z.ZodTypeAny>(req: Request, schema: S): z.output<S> {
  const params = new URL(req.url).searchParams;
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    query[key] = values.length > 1 ? values : values[0];
  }
  return schema.parse(query);
}

/** Parses async route params (`ctx.params` in Next.js 16) with `schema`. */
export async function parseParams<S extends z.ZodTypeAny>(
  params: Promise<Record<string, string | string[] | undefined>>,
  schema: S
): Promise<z.output<S>> {
  return schema.parse(await params);
}

/** Escapes regex metacharacters so user text matches literally (S1: `C++`, `Rabbit?`). */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" match for user text. */
export function containsText(text: string): RegExp {
  return new RegExp(escapeRegex(text), "i");
}

/** Case-insensitive whole-value match for user text. */
export function equalsText(text: string): RegExp {
  return new RegExp(`^${escapeRegex(text)}$`, "i");
}
