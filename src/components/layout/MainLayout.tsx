import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:justify-end md:px-8">
          <Link href="/dashboard" className="md:hidden" aria-label="Bookmarked home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* pb-24 keeps content clear of the fixed bottom navigation on phones */}
        <main className="flex-1 px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <div className="mx-auto w-full max-w-content">{children}</div>
        </main>
      </div>

      <MobileNav className="md:hidden" />
    </div>
  );
}
