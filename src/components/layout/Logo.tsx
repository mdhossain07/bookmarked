import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ showName = true, className }: { showName?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Bookmark className="h-5 w-5" aria-hidden />
      </span>
      {showName && <span className="font-display text-lg font-semibold tracking-tight">Bookmarked</span>}
    </span>
  );
}
