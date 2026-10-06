import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";

// Checked against the database, not only the cookie: a deactivated user with a
// signed cookie must still see the sign-in form instead of a redirect loop.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getSessionUser()) redirect("/dashboard");
  return children;
}
