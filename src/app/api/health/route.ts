import { ErrorCodes, HttpStatus } from "@/shared";
import { connectDb, databaseStatus } from "@/server/db";
import { fail, ok } from "@/server/http/respond";
import { route } from "@/server/http/route";

// Connects inside the handler so an unreachable database gives 503, not 500.
export const GET = route(
  async () => {
    try {
      await connectDb();
    } catch (error) {
      console.error("Health check: database connection failed:", error);
    }

    // The cached connection can drop after it first succeeds, so read the live state.
    const db = databaseStatus();
    if (db !== "connected") {
      return fail(HttpStatus.SERVICE_UNAVAILABLE, "Database unavailable", ErrorCodes.DATABASE_ERROR, {
        details: { db },
      });
    }
    return ok("Bookmarked API is healthy", { db });
  },
  { db: false }
);
