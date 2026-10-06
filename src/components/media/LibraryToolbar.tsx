"use client";

import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterBadge } from "./FilterBadge";

export interface ActiveFilter {
  label: string;
  onClear: () => void;
}

/** Search box, a filter panel that opens on demand, and chips for the active filters. */
export function LibraryToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filtersOpen,
  onFiltersOpenChange,
  activeFilters,
  onClearAll,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  activeFilters: ActiveFilter[];
  onClearAll: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
        <Button
          variant={filtersOpen ? "secondary" : "outline"}
          onClick={() => onFiltersOpenChange(!filtersOpen)}
          aria-expanded={filtersOpen}
          className="bg-card"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden />
          Filters
          {activeFilters.length > 0 && (
            <span className="ml-2 rounded-full bg-brass/10 px-1.5 text-sm text-brass-text">{activeFilters.length}</span>
          )}
        </Button>
      </div>

      {filtersOpen && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 shadow-card motion-safe:animate-enter sm:grid-cols-2 lg:grid-cols-4">
          {children}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <FilterBadge key={filter.label} label={filter.label} onClear={filter.onClear} />
          ))}
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground">
            <X className="mr-1 h-3.5 w-3.5" aria-hidden />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
