"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part![0]!.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2" aria-label="Account menu">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass/20 text-sm font-semibold text-foreground">
            {initials}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{user.firstName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
