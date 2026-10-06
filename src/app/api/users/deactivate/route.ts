import { clearSession, requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { deactivateUser } from "@/server/services/user.service";

export const POST = route(async () => {
  await deactivateUser(await requireUser());
  await clearSession();
  return ok("Account deactivated successfully");
});
