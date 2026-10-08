"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { NAV_ITEMS, isActive } from "./nav-items";

// h-10 item plus the 4 px gap, so the indicator can slide by index
const ITEM_STEP_PX = 44;

export function Sidebar({ className }: { className?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => isActive(pathname, item.href));

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-[250ms] ease-out",
        isCollapsed ? "w-[4.5rem]" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" aria-label="Bookmarked home">
          <Logo showName={!isCollapsed} />
        </Link>
        {!isCollapsed && (
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)} aria-label="Collapse sidebar">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav aria-label="Main" className="relative flex-1 p-3">
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute left-3 top-3 h-10 w-1 rounded-full bg-brass transition-transform duration-[250ms] ease-out"
            style={{ transform: `translateY(${activeIndex * ITEM_STEP_PX}px)` }}
          />
        )}
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md pl-4 pr-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-brass/10 text-brass-text"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isCollapsed && (
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
