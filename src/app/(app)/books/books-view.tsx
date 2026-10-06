"use client";

import { useEffect, useState } from "react";
import { BookOpen, Filter, Search, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Book } from "@/shared";
import BookModal from "@/components/BookModal";
import { MediaCard } from "@/components/MediaCard";
import { ConfirmDeleteDialog } from "@/components/media/ConfirmDeleteDialog";
import { DateFilter } from "@/components/media/DateFilter";
import { FilterBadge } from "@/components/media/FilterBadge";
import { FilterSelect } from "@/components/media/FilterSelect";
import { Pagination } from "@/components/media/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBookAuthors, useBooks, useMediaMutations } from "@/hooks/use-media";
import { toast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { completedParams, presetLabel } from "@/lib/date-presets";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const STATUS_OPTIONS = [
  { value: "will read", label: "Will Read" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
];

export function BooksView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [readDateFilter, setReadDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const search = useDebouncedValue(searchTerm.trim());
  const { data, isLoading, error } = useBooks({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    author: authorFilter === "all" ? undefined : authorFilter,
    ...completedParams(readDateFilter, customDateRange),
  });
  const { data: authors = [] } = useBookAuthors();
  const { remove } = useMediaMutations<Book>("books");

  // A new filter starts again at page 1.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, authorFilter, readDateFilter, customDateRange]);

  const books = data?.books ?? [];
  const hasActiveFilters = statusFilter !== "all" || authorFilter !== "all" || readDateFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setAuthorFilter("all");
    setReadDateFilter("all");
    setCustomDateRange(undefined);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      await remove.mutateAsync(bookToDelete._id);
      toast({ title: "Success", description: "Book deleted successfully" });
      setBookToDelete(null);
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, "Failed to delete book"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            My Books
          </h1>
          <p className="text-gray-600 text-lg mt-2">Track your reading journey and literary adventures.</p>
        </div>
        <BookModal />
      </div>

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
            className={cn("min-w-[100px]", showFilters && "bg-blue-600 hover:bg-blue-700")}
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
              allLabel="All Statuses"
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="Author"
              value={authorFilter}
              onChange={setAuthorFilter}
              allLabel="All Authors"
              options={authors.map((author) => ({ value: author, label: author }))}
            />
            <DateFilter
              label="Read Date"
              preset={readDateFilter}
              onPresetChange={setReadDateFilter}
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
          {authorFilter !== "all" && (
            <FilterBadge label={`Author: ${authorFilter}`} onClear={() => setAuthorFilter("all")} />
          )}
          {readDateFilter !== "all" && (
            <FilterBadge label={`Read: ${presetLabel(readDateFilter)}`} onClear={() => setReadDateFilter("all")} />
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading books...</div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{errorMessage(error, "Failed to load books")}</div>
      ) : books.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <MediaCard
                key={book._id}
                title={book.title}
                creator={book.author || "Unknown Author"}
                status={book.status}
                rating={book.rating}
                notes={book.review}
                dateAdded={new Date(book.createdAt)}
                dateFinished={book.completedOn ? new Date(book.completedOn) : undefined}
                genre={book.genres}
                coverUrl={book.coverUrl}
                onEdit={() => setEditingBook(book)}
                onDelete={() => setBookToDelete(book)}
              />
            ))}
          </div>
          {data && <Pagination pagination={data.pagination} onPageChange={setPage} noun="books" />}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {search || hasActiveFilters ? "No books found" : "Start Your Book Collection"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {search || hasActiveFilters
              ? "Try adjusting your search or filter criteria."
              : "Add your first book to start tracking your reading progress and build your personal library."}
          </p>
          {!search && !hasActiveFilters && <BookModal />}
        </div>
      )}

      {editingBook && (
        <BookModal
          book={editingBook}
          isEdit
          trigger={<div />}
          open
          onOpenChange={(open) => !open && setEditingBook(null)}
        />
      )}

      <ConfirmDeleteDialog
        title={bookToDelete?.title}
        onConfirm={confirmDelete}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
}
