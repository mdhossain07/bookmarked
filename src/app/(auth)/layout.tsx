import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { SceneLayer } from "@/components/three/SceneLayer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getSessionUser } from "@/server/auth/session";

// Checked against the database, not only the cookie: a deactivated user with a
// signed cookie must still see the sign-in form instead of a redirect loop.
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="auth-backdrop flex flex-col px-6 py-6 sm:px-10 lg:bg-none">
        <div className="flex items-center justify-between">
          <Link href="/login" aria-label="Bookmarked home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm motion-safe:animate-enter">
            {children}
          </div>
        </main>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bookmarked
        </p>
      </div>

      {/* The gradient shows until the scene is ready, and stays if the scene cannot start. */}
      <aside className="auth-panel relative hidden overflow-hidden lg:flex lg:items-end">
        <SceneLayer minWidth={1024} />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[hsl(227_30%_14%)] to-transparent" />
        <div className="relative z-10 max-w-md p-12">
          <p className="font-display text-2xl font-semibold leading-snug text-[#ECE6DA]">
            A quiet place for the books you read and the films you watch.
          </p>
        </div>
      </aside>
    </div>
  );
}
