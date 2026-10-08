import { Book, Film, LayoutDashboard, Sparkles, type LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Books", href: "/books", icon: Book },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "Latest Updates", href: "/latest-updates", icon: Sparkles },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
