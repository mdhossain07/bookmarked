import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { listAuthors } from "@/server/services/book.service";

export const GET = route(async () => {
  const user = await requireUser();
  return ok("Authors retrieved successfully", { authors: await listAuthors(user._id.toString()) });
});
