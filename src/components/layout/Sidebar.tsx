"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Film,
  Book,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Movies",
    href: "/movies",
    icon: Film,
  },
  {
    name: "Books",
    href: "/books",
    icon: Book,
  },
  {
    name: "Latest Updates",
    href: "/latest-updates",
    icon: Search,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Book className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Bookmarked
            </h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brass/10 text-brass-text"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="flex items-center mb-3 px-3 py-2">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {displayName}
              </span>
              {user?.email && (
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className={cn(
            "w-full flex items-center",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
