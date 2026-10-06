import { ChangePasswordSchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody } from "@/server/http/validate";
import { changePassword } from "@/server/services/user.service";

export const POST = route(async (req) => {
  const user = await requireUser();
  await changePassword(user._id.toString(), await parseBody(req, ChangePasswordSchema));
  return ok("Password changed successfully");
});
