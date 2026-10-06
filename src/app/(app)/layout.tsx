import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSessionUser } from "@/server/auth/session";

// proxy.ts only checks the cookie signature; this also rejects deleted and deactivated users.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AuthProvider initialUser={user}>
      <MainLayout>{children}</MainLayout>
    </AuthProvider>
  );
}
