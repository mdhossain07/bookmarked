import { Skeleton } from "@/components/ui/skeleton";

export const MEDIA_GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6";

/** Placeholder cards in the shape of MediaCard while a list loads. */
export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={MEDIA_GRID} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border bg-card shadow-card">
          <Skeleton className="aspect-[2/3] rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
