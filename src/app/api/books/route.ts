import { BookQuerySchema, CreateBookSchema, HttpStatus } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody, parseQuery } from "@/server/http/validate";
import { createBook, listBooks } from "@/server/services/book.service";

export const GET = route(async (req) => {
  const user = await requireUser();
  const result = await listBooks(user._id.toString(), parseQuery(req, BookQuerySchema));
  return ok("Books retrieved successfully", result);
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const book = await createBook(user._id.toString(), await parseBody(req, CreateBookSchema));
  return ok("Book created successfully", { book }, HttpStatus.CREATED);
});
