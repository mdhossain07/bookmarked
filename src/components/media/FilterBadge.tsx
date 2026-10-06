"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FilterBadge({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {label}
      <button type="button" aria-label={`Remove filter ${label}`} onClick={onClear}>
        <X className="w-3 h-3 hover:text-red-500" />
      </button>
    </Badge>
  );
}
