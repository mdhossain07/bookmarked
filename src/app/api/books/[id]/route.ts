import { IdParamsSchema, UpdateBookSchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody, parseParams } from "@/server/http/validate";
import { deleteBook, getBook, updateBook } from "@/server/services/book.service";

type Context = RouteContext<"/api/books/[id]">;

export const GET = route<Context>(async (_req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  return ok("Book retrieved successfully", { book: await getBook(user._id.toString(), id) });
});

export const PUT = route<Context>(async (req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  const book = await updateBook(user._id.toString(), id, await parseBody(req, UpdateBookSchema));
  return ok("Book updated successfully", { book });
});

export const DELETE = route<Context>(async (_req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  await deleteBook(user._id.toString(), id);
  return ok("Book deleted successfully", {});
});
