import { IdParamsSchema, UpdateMovieSchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody, parseParams } from "@/server/http/validate";
import { deleteMovie, getMovie, updateMovie } from "@/server/services/movie.service";

type Context = RouteContext<"/api/movies/[id]">;

export const GET = route<Context>(async (_req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  return ok("Movie retrieved successfully", { movie: await getMovie(user._id.toString(), id) });
});

export const PUT = route<Context>(async (req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  const movie = await updateMovie(user._id.toString(), id, await parseBody(req, UpdateMovieSchema));
  return ok("Movie updated successfully", { movie });
});

export const DELETE = route<Context>(async (_req, ctx) => {
  const { id } = await parseParams(ctx.params, IdParamsSchema);
  const user = await requireUser();
  await deleteMovie(user._id.toString(), id);
  return ok("Movie deleted successfully");
});
