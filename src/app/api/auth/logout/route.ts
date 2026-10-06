import { clearSession } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { route } from "@/server/http/route";

// No auth check (F3): an expired cookie must still be cleared.
export const POST = route(
  async () => {
    await clearSession();
    return ok("Logout successful");
  },
  { db: false }
);
