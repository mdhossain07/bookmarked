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
          <h1 className="text-4xl font-semibold text-foreground">
            My Books
          </h1>
          <p className="text-muted-foreground text-lg mt-2">Track your reading journey and literary adventures.</p>
        </div>
        <BookModal />
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border border-border space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search books, authors, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="min-w-[100px]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
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
                  className="text-muted-foreground hover:text-foreground"
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
          <div className="text-lg text-muted-foreground">Loading books...</div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-destructive">{errorMessage(error, "Failed to load books")}</div>
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
        <div className="text-center py-16 bg-card rounded-lg shadow-sm border">
          <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            {search || hasActiveFilters ? "No books found" : "Start Your Book Collection"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
