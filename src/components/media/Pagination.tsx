"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListPagination } from "@/shared";
import { Button } from "@/components/ui/button";

export function Pagination({
  pagination,
  onPageChange,
  noun,
}: {
  pagination: ListPagination;
  onPageChange: (page: number) => void;
  noun: string;
}) {
  const { page, limit, total, pages, hasNext, hasPrev } = pagination;
  if (total === 0) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {first}–{last} of {total} {noun}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pages}
          </span>
          <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}
