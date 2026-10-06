import { LoginSchema } from "@/shared";
import { createSession } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody } from "@/server/http/validate";
import { AUTH_RATE_LIMIT, clientIp, enforceRateLimit } from "@/server/rate-limit";
import { loginUser } from "@/server/services/auth.service";

export const POST = route(async (req) => {
  await enforceRateLimit(`login:${clientIp(req)}`, AUTH_RATE_LIMIT);
  const user = await loginUser(await parseBody(req, LoginSchema));
  await createSession(user);
  return ok("Login successful", { user: user.toSafeObject() });
});
