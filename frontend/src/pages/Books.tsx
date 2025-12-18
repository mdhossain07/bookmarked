import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import BookModal from "@/components/BookModal";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/contexts/MediaContext";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
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
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  BookOpen,
  Filter,
  Calendar as CalendarIcon,
  X,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Book } from "bookmarked-types";

export default function Books() {
  const { books, isLoadingBooks, deleteBook } = useMedia();
  console.log("books", books);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [readDateFilter, setReadDateFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >();
  const [showFilters, setShowFilters] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Get unique authors for filter
  const uniqueAuthors = Array.from(
    new Set(
      books?.books
        ?.filter((book: Book) => book.author)
        .map((book: Book) => book.author!)
    )
  ).sort();

  const handleDeleteClick = (id: string, title: string) => {
    setBookToDelete({ id, title });
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await deleteBook(bookToDelete.id);
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      setBookToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  // Filter books based on search and filters
  const filteredBooks =
    books?.books?.filter((book: Book) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genres.some((genre) =>
          genre.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        book.review?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;

      // Author filter
      const matchesAuthor =
        authorFilter === "all" || book.author === authorFilter;

      // Date filter
      let matchesDate = true;
      if (readDateFilter !== "all" && book.completedOn) {
        const completedDate = new Date(book.completedOn);
        const now = new Date();

        switch (readDateFilter) {
          case "today":
            matchesDate =
              format(completedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
            break;
          case "yesterday":
            const yesterday = subDays(now, 1);
            matchesDate =
              format(completedDate, "yyyy-MM-dd") ===
              format(yesterday, "yyyy-MM-dd");
            break;
          case "this-week":
            matchesDate =
              isAfter(completedDate, startOfWeek(now)) &&
              isBefore(completedDate, endOfWeek(now));
            break;
          case "last-week":
            const lastWeekStart = startOfWeek(subWeeks(now, 1));
            const lastWeekEnd = endOfWeek(subWeeks(now, 1));
            matchesDate =
              isAfter(completedDate, lastWeekStart) &&
              isBefore(completedDate, lastWeekEnd);
            break;
          case "this-month":
            matchesDate =
              isAfter(completedDate, startOfMonth(now)) &&
              isBefore(completedDate, endOfMonth(now));
            break;
          case "last-month":
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));
            matchesDate =
              isAfter(completedDate, lastMonthStart) &&
              isBefore(completedDate, lastMonthEnd);
            break;
          case "this-year":
            matchesDate =
              isAfter(completedDate, startOfYear(now)) &&
              isBefore(completedDate, endOfYear(now));
            break;
          case "last-year":
            const lastYearStart = startOfYear(subYears(now, 1));
            const lastYearEnd = endOfYear(subYears(now, 1));
            matchesDate =
              isAfter(completedDate, lastYearStart) &&
              isBefore(completedDate, lastYearEnd);
            break;
          case "custom":
            if (customDateRange?.from && customDateRange?.to) {
              matchesDate =
                isAfter(completedDate, customDateRange.from) &&
                isBefore(completedDate, customDateRange.to);
            }
            break;
        }
      } else if (readDateFilter !== "all") {
        matchesDate = false; // If filter is set but book has no completion date
      }

      return matchesSearch && matchesStatus && matchesAuthor && matchesDate;
    }) || [];

  const clearFilters = () => {
    setStatusFilter("all");
    setAuthorFilter("all");
    setReadDateFilter("all");
    setCustomDateRange(undefined);
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    authorFilter !== "all" ||
    readDateFilter !== "all";

  if (isLoadingBooks) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading books...
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              My Books
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Track your reading journey and literary adventures.
            </p>
          </div>
          <BookModal />
        </div>

        {/* Search and Filter Toggle */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search books, authors, or genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "min-w-[100px]",
                showFilters && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="will read">Will Read</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Author
                </label>
                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="All authors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Read Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Read Date
                </label>
                <Select
                  value={readDateFilter}
                  onValueChange={setReadDateFilter}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {readDateFilter === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Range
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal focus:ring-2 focus:ring-blue-500"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange?.from ? (
                          customDateRange?.to ? (
                            <>
                              {format(customDateRange.from, "LLL dd, y")} -{" "}
                              {format(customDateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(customDateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={customDateRange?.from || new Date()}
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Clear Filters */}
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

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
            {authorFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Author: {authorFilter}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => setAuthorFilter("all")}
                />
              </Badge>
            )}
            {readDateFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Read: {readDateFilter}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => setReadDateFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book: Book) => (
              <MediaCard
                key={book._id}
                title={book.title}
                creator={book.author || "Unknown Author"}
                status={book.status}
                rating={book.rating}
                notes={book.review}
                dateAdded={new Date(book.createdAt)}
                dateFinished={
                  book.completedOn ? new Date(book.completedOn) : undefined
                }
                genre={book.genres}
                coverUrl={book.coverUrl}
                onEdit={() => setEditingBook(book)}
                onDelete={() => handleDeleteClick(book._id, book.title)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || hasActiveFilters
                ? "No books found"
                : "Start Your Book Collection"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || hasActiveFilters
                ? "Try adjusting your search or filter criteria."
                : "Add your first book to start tracking your reading progress and build your personal library."}
            </p>
            {!searchTerm && !hasActiveFilters && <BookModal />}
          </div>
        )}

        {/* Edit Modal */}
        {editingBook && (
          <BookModal
            book={editingBook}
            isEdit={true}
            trigger={<div />}
            open={!!editingBook}
            onOpenChange={(open) => !open && setEditingBook(null)}
          />
        )}

        <AlertDialog
          open={!!bookToDelete}
          onOpenChange={(open) => !open && setBookToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "
                {bookToDelete?.title}" from your collection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
