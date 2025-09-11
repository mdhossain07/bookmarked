import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import MovieModal from "@/components/MovieModal";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/contexts/MediaContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Film,
  Filter,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import {
  format,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfToday,
  endOfToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Movie } from "bookmarked-types";

const INDUSTRIES = [
  "Bollywood",
  "Hollywood",
  "Bangla",
  "South Indian",
  "Foreign",
];
const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last Week", value: "lastWeek" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Month", value: "thisMonth" },
  { label: "This Year", value: "thisYear" },
];

export default function Movies() {
  const { movies, isLoadingMovies } = useMedia();
  console.log("movies", movies);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [watchedDateFilter, setWatchedDateFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date | undefined;
    to?: Date | undefined;
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const getDateRange = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "today":
        return { from: startOfToday(), to: endOfToday() };
      case "lastWeek":
        const lastWeekStart = startOfWeek(
          new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        const lastWeekEnd = endOfWeek(
          new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        return { from: lastWeekStart, to: lastWeekEnd };
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case "thisMonth":
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case "thisYear":
        return { from: startOfYear(today), to: endOfYear(today) };
      default:
        return null;
    }
  };

  const filteredMovies =
    movies?.movies?.filter((movie: Movie) => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.director &&
          movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.genres &&
          movie.genres.some((g: string) =>
            g.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesStatus =
        statusFilter === "all" || movie.status === statusFilter;
      const matchesIndustry =
        industryFilter === "all" || movie.industry === industryFilter;

      let matchesDate = true;
      if (watchedDateFilter !== "all" && movie.completedOn) {
        const completedDate = new Date(movie.completedOn);
        if (watchedDateFilter === "custom") {
          if (customDateRange.from && customDateRange.to) {
            matchesDate =
              isAfter(completedDate, customDateRange.from) &&
              isBefore(completedDate, customDateRange.to);
          }
        } else {
          const dateRange = getDateRange(watchedDateFilter);
          if (dateRange) {
            matchesDate =
              isAfter(completedDate, dateRange.from) &&
              isBefore(completedDate, dateRange.to);
          }
        }
      }

      return matchesSearch && matchesStatus && matchesIndustry && matchesDate;
    }) || [];

  const clearDateFilter = () => {
    setWatchedDateFilter("all");
    setCustomDateRange({});
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    industryFilter !== "all" ||
    watchedDateFilter !== "all";

  if (isLoadingMovies) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading movies...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Movies
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Keep track of your cinematic adventures and favorites.
            </p>
          </div>
          <MovieModal />
        </div>

        {/* Search and Filter Toggle */}
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
              className={cn(
                "min-w-[100px]",
                showFilters && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-red-100 text-red-800"
                >
                  {
                    [
                      statusFilter !== "all",
                      industryFilter !== "all",
                      watchedDateFilter !== "all",
                    ].filter(Boolean).length
                  }
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filter Section */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Movies</SelectItem>
                    <SelectItem value="watching">Currently Watching</SelectItem>
                    <SelectItem value="watched">Completed</SelectItem>
                    <SelectItem value="to watch">Want to Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <Select
                  value={industryFilter}
                  onValueChange={setIndustryFilter}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Watched Date
                </label>
                <Select
                  value={watchedDateFilter}
                  onValueChange={setWatchedDateFilter}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    {DATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setIndustryFilter("all");
                      clearDateFilter();
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Custom Date Range Picker */}
          {watchedDateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from
                        ? format(customDateRange.from, "PPP")
                        : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.from}
                      onSelect={(date: Date | undefined) =>
                        setCustomDateRange((prev) => ({ ...prev, from: date }))
                      }
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.to
                        ? format(customDateRange.to, "PPP")
                        : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.to}
                      onSelect={(date: Date | undefined) =>
                        setCustomDateRange((prev) => ({ ...prev, to: date }))
                      }
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie: Movie) => (
              <MediaCard
                key={movie._id}
                title={movie.title}
                creator={movie.director || "Unknown Director"}
                status={movie.status}
                rating={movie.rating}
                notes={movie.review}
                dateAdded={new Date(movie.createdAt)}
                dateFinished={
                  movie.completedOn ? new Date(movie.completedOn) : undefined
                }
                genre={movie.genres}
                coverUrl={movie.coverUrl}
                onEdit={() => setEditingMovie(movie)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <Film className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || hasActiveFilters
                ? "No movies found"
                : "Start Your Movie Collection"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || hasActiveFilters
                ? "Try adjusting your search or filter criteria."
                : "Add your first movie to start tracking your viewing progress and build your personal collection."}
            </p>
            {!searchTerm && !hasActiveFilters && <MovieModal />}
          </div>
        )}

        {/* Edit Modal */}
        {editingMovie && (
          <MovieModal movie={editingMovie} isEdit={true} trigger={<div />} />
        )}
      </div>
    </MainLayout>
  );
}
