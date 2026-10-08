import { HttpStatus, RegisterSchema } from "@/shared";
import { createSession } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";
import { parseBody } from "@/server/http/validate";
import { AUTH_RATE_LIMIT, clientIp, enforceRateLimit } from "@/server/rate-limit";
import { registerUser } from "@/server/services/auth.service";

export const POST = route(async (req) => {
  await enforceRateLimit(`register:${clientIp(req)}`, AUTH_RATE_LIMIT);
  const user = await registerUser(await parseBody(req, RegisterSchema));
  await createSession(user);
  return ok("User registered successfully", { user: user.toSafeObject() }, HttpStatus.CREATED);
});
