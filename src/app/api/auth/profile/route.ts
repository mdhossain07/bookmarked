import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";

export const GET = route(async () => {
  const user = await requireUser();
  return ok("Profile retrieved successfully", { user: user.toSafeObject() });
});
