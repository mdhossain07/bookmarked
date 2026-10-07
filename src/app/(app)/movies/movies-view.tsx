"use client";

import { useState } from "react";
import { Film, SearchX } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Movie } from "@/shared";
import MovieModal from "@/components/MovieModal";
import { MediaCard } from "@/components/MediaCard";
import { ConfirmDeleteDialog } from "@/components/media/ConfirmDeleteDialog";
import { DateFilter } from "@/components/media/DateFilter";
import { EmptyState } from "@/components/media/EmptyState";
import { FilterSelect } from "@/components/media/FilterSelect";
import { LibraryToolbar, type ActiveFilter } from "@/components/media/LibraryToolbar";
import { MEDIA_GRID, MediaGridSkeleton } from "@/components/media/MediaGridSkeleton";
import { PageHeader } from "@/components/media/PageHeader";
import { Pagination } from "@/components/media/Pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMediaMutations, useMovies } from "@/hooks/use-media";
import { toast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { completedParams, presetLabel } from "@/lib/date-presets";
import { optionLabel } from "@/components/media/FilterSelect";

const PAGE_SIZE = 24;

const STATUS_OPTIONS = [
  { value: "to watch", label: "To watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

const INDUSTRY_OPTIONS = ["Hollywood", "Bollywood", "Bangla", "South Indian", "Foreign"].map((industry) => ({
  value: industry,
  label: industry,
}));

export function MoviesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [watchedDateFilter, setWatchedDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  const search = useDebouncedValue(searchTerm.trim());
  const { data, isLoading, error } = useMovies({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    industry: industryFilter === "all" ? undefined : industryFilter,
    ...completedParams(watchedDateFilter, customDateRange),
  });
  const { remove } = useMediaMutations<Movie>("movies");

  // A new filter starts again at page 1.
  const filterKey = JSON.stringify([search, statusFilter, industryFilter, watchedDateFilter, customDateRange]);
  const [appliedKey, setAppliedKey] = useState(filterKey);
  if (appliedKey !== filterKey) {
    setAppliedKey(filterKey);
    setPage(1);
  }

  const movies = data?.movies ?? [];
  const activeFilters: ActiveFilter[] = [
    ...(statusFilter !== "all" ? [{ label: `Status: ${optionLabel(STATUS_OPTIONS, statusFilter)}`, onClear: () => setStatusFilter("all") }] : []),
    ...(industryFilter !== "all" ? [{ label: `Industry: ${industryFilter}`, onClear: () => setIndustryFilter("all") }] : []),
    ...(watchedDateFilter !== "all"
      ? [{ label: `Watched: ${presetLabel(watchedDateFilter)}`, onClear: () => setWatchedDateFilter("all") }]
      : []),
  ];
  const isFiltered = Boolean(search) || activeFilters.length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setIndustryFilter("all");
    setWatchedDateFilter("all");
    setCustomDateRange(undefined);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await remove.mutateAsync(movieToDelete._id);
      toast({ title: "Movie deleted", description: `“${movieToDelete.title}” is no longer in your library.` });
      setMovieToDelete(null);
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, "Failed to delete movie"), variant: "destructive" });
    }
  };

  return (
    <>
      <PageHeader
        title="Movies"
        description="Everything you have watched, are watching, and want to watch."
        action={<MovieModal />}
      />

      <LibraryToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search movies, directors, or genres"
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
        activeFilters={activeFilters}
        onClearAll={clearFilters}
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          allLabel="All statuses"
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Industry"
          value={industryFilter}
          onChange={setIndustryFilter}
          allLabel="All industries"
          options={INDUSTRY_OPTIONS}
        />
        <DateFilter
          label="Watched date"
          preset={watchedDateFilter}
          onPresetChange={setWatchedDateFilter}
          range={customDateRange}
          onRangeChange={setCustomDateRange}
        />
      </LibraryToolbar>

      {isLoading ? (
        <MediaGridSkeleton />
      ) : error ? (
        <p className="py-16 text-center text-destructive">{errorMessage(error, "Failed to load movies")}</p>
      ) : movies.length > 0 ? (
        <div className="space-y-8">
          <div className={MEDIA_GRID}>
            {movies.map((movie, index) => (
              <MediaCard
                key={movie._id}
                kind="movie"
                index={index}
                title={movie.title}
                creator={movie.director}
                status={movie.status}
                rating={movie.rating}
                genres={movie.genres}
                coverUrl={movie.coverUrl}
                onEdit={() => setEditingMovie(movie)}
                onDelete={() => setMovieToDelete(movie)}
              />
            ))}
          </div>
          {data && <Pagination pagination={data.pagination} onPageChange={setPage} noun="movies" />}
        </div>
      ) : isFiltered ? (
        <EmptyState icon={SearchX} title="No movies found" description="Try a different search or fewer filters." />
      ) : (
        <EmptyState
          icon={Film}
          title="No movies yet"
          description="Add a movie you loved, or one you want to watch next."
          action={<MovieModal />}
        />
      )}

      {editingMovie && (
        <MovieModal
          movie={editingMovie}
          isEdit
          trigger={<span />}
          open
          onOpenChange={(open) => !open && setEditingMovie(null)}
        />
      )}

      <ConfirmDeleteDialog
        title={movieToDelete?.title}
        onConfirm={confirmDelete}
        onCancel={() => setMovieToDelete(null)}
      />
    </>
  );
}
