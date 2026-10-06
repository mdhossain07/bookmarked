import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { getBookStats } from "@/server/services/book.service";

export const GET = route(async () => {
  const user = await requireUser();
  return ok("Book statistics retrieved successfully", { stats: await getBookStats(user._id.toString()) });
});
