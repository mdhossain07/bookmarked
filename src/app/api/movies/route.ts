import { CreateMovieSchema, HttpStatus, MovieQuerySchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody, parseQuery } from "@/server/http/validate";
import { createMovie, listMovies } from "@/server/services/movie.service";

export const GET = route(async (req) => {
  const user = await requireUser();
  const result = await listMovies(user._id.toString(), parseQuery(req, MovieQuerySchema));
  return ok("Movies retrieved successfully", result);
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const movie = await createMovie(user._id.toString(), await parseBody(req, CreateMovieSchema));
  return ok("Movie created successfully", { movie }, HttpStatus.CREATED);
});
