"use client";

import { useEffect, useState } from "react";
import { Film, Filter, Search, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Movie } from "@/shared";
import MovieModal from "@/components/MovieModal";
import { MediaCard } from "@/components/MediaCard";
import { ConfirmDeleteDialog } from "@/components/media/ConfirmDeleteDialog";
import { DateFilter } from "@/components/media/DateFilter";
import { FilterBadge } from "@/components/media/FilterBadge";
import { FilterSelect } from "@/components/media/FilterSelect";
import { Pagination } from "@/components/media/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMediaMutations, useMovies } from "@/hooks/use-media";
import { toast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { completedParams, presetLabel } from "@/lib/date-presets";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const STATUS_OPTIONS = [
  { value: "watching", label: "Currently Watching" },
  { value: "watched", label: "Completed" },
  { value: "to watch", label: "Want to Watch" },
];

const INDUSTRY_OPTIONS = ["Bollywood", "Hollywood", "Bangla", "South Indian", "Foreign"].map((industry) => ({
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
  const [showFilters, setShowFilters] = useState(false);
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
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, industryFilter, watchedDateFilter, customDateRange]);

  const movies = data?.movies ?? [];
  const hasActiveFilters = statusFilter !== "all" || industryFilter !== "all" || watchedDateFilter !== "all";

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
      toast({ title: "Success", description: "Movie deleted successfully" });
      setMovieToDelete(null);
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, "Failed to delete movie"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Movies
          </h1>
          <p className="text-gray-600 text-lg mt-2">Keep track of your cinematic adventures and favorites.</p>
        </div>
        <MovieModal />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search movies, directors, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={cn("min-w-[100px]", showFilters && "bg-purple-600 hover:bg-purple-700")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allLabel="All Movies"
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="Industry"
              value={industryFilter}
              onChange={setIndustryFilter}
              allLabel="All Industries"
              options={INDUSTRY_OPTIONS}
            />
            <DateFilter
              label="Watched Date"
              preset={watchedDateFilter}
              onPresetChange={setWatchedDateFilter}
              range={customDateRange}
              onRangeChange={setCustomDateRange}
            />
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <FilterBadge label={`Status: ${statusFilter}`} onClear={() => setStatusFilter("all")} />
          )}
          {industryFilter !== "all" && (
            <FilterBadge label={`Industry: ${industryFilter}`} onClear={() => setIndustryFilter("all")} />
          )}
          {watchedDateFilter !== "all" && (
            <FilterBadge
              label={`Watched: ${presetLabel(watchedDateFilter)}`}
              onClear={() => setWatchedDateFilter("all")}
            />
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading movies...</div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{errorMessage(error, "Failed to load movies")}</div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MediaCard
                key={movie._id}
                title={movie.title}
                creator={movie.director || "Unknown Director"}
                status={movie.status}
                rating={movie.rating}
                notes={movie.review}
                dateAdded={new Date(movie.createdAt)}
                dateFinished={movie.completedOn ? new Date(movie.completedOn) : undefined}
                genre={movie.genres}
                coverUrl={movie.coverUrl}
                onEdit={() => setEditingMovie(movie)}
                onDelete={() => setMovieToDelete(movie)}
              />
            ))}
          </div>
          {data && <Pagination pagination={data.pagination} onPageChange={setPage} noun="movies" />}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <Film className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {search || hasActiveFilters ? "No movies found" : "Start Your Movie Collection"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {search || hasActiveFilters
              ? "Try adjusting your search or filter criteria."
              : "Add your first movie to start tracking your viewing progress and build your personal collection."}
          </p>
          {!search && !hasActiveFilters && <MovieModal />}
        </div>
      )}

      {editingMovie && (
        <MovieModal
          movie={editingMovie}
          isEdit
          trigger={<div />}
          open
          onOpenChange={(open) => !open && setEditingMovie(null)}
        />
      )}

      <ConfirmDeleteDialog
        title={movieToDelete?.title}
        onConfirm={confirmDelete}
        onCancel={() => setMovieToDelete(null)}
      />
    </div>
  );
}
