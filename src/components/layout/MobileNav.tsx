"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Bottom navigation for narrow screens, where the sidebar is hidden. */
export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur",
        className
      )}
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-sm transition-colors",
                  active ? "text-brass-text" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="leading-none">{item.name === "Latest Updates" ? "Discover" : item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
