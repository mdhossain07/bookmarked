import { AISearchSchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody } from "@/server/http/validate";
import { AI_RATE_LIMIT, enforceRateLimit } from "@/server/rate-limit";
import { searchBooksAndMovies } from "@/server/services/ai.service";

// seconds; a 1500-token completion can take longer than the default
export const maxDuration = 60;

export const POST = route(async (req) => {
  const user = await requireUser();
  const { prompt } = await parseBody(req, AISearchSchema);
  await enforceRateLimit(`ai-search:${user._id.toString()}`, AI_RATE_LIMIT);
  return ok("Search completed successfully", await searchBooksAndMovies(prompt));
});
