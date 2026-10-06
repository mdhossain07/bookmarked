import { UpdateProfileSchema } from "@/shared";
import { requireUser } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody } from "@/server/http/validate";
import { updateProfile } from "@/server/services/user.service";

export const PUT = route(async (req) => {
  const user = await requireUser();
  const updated = await updateProfile(user, await parseBody(req, UpdateProfileSchema));
  return ok("Profile updated successfully", { user: updated });
});
