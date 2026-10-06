import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { getMovieStats } from "@/server/services/movie.service";

export const GET = route(async () => {
  const user = await requireUser();
  return ok("Movie statistics retrieved successfully", { stats: await getMovieStats(user._id.toString()) });
});
