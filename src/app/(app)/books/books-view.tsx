"use client";

import { useEffect, useState } from "react";
import { BookOpen, SearchX } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Book } from "@/shared";
import BookModal from "@/components/BookModal";
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
import { useBookAuthors, useBooks, useMediaMutations } from "@/hooks/use-media";
import { toast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { completedParams, presetLabel } from "@/lib/date-presets";
import { optionLabel } from "@/components/media/FilterSelect";

const PAGE_SIZE = 24;

const STATUS_OPTIONS = [
  { value: "will read", label: "Will read" },
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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const activeFilters: ActiveFilter[] = [
    ...(statusFilter !== "all" ? [{ label: `Status: ${optionLabel(STATUS_OPTIONS, statusFilter)}`, onClear: () => setStatusFilter("all") }] : []),
    ...(authorFilter !== "all" ? [{ label: `Author: ${authorFilter}`, onClear: () => setAuthorFilter("all") }] : []),
    ...(readDateFilter !== "all"
      ? [{ label: `Read: ${presetLabel(readDateFilter)}`, onClear: () => setReadDateFilter("all") }]
      : []),
  ];
  const isFiltered = Boolean(search) || activeFilters.length > 0;

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
      toast({ title: "Book deleted", description: `“${bookToDelete.title}” is no longer in your library.` });
      setBookToDelete(null);
    } catch (err) {
      toast({ title: "Error", description: errorMessage(err, "Failed to delete book"), variant: "destructive" });
    }
  };

  return (
    <>
      <PageHeader
        title="Books"
        description="Everything you have read, are reading, and want to read."
        action={<BookModal />}
      />

      <LibraryToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search books, authors, or genres"
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
          label="Author"
          value={authorFilter}
          onChange={setAuthorFilter}
          allLabel="All authors"
          options={authors.map((author) => ({ value: author, label: author }))}
        />
        <DateFilter
          label="Read date"
          preset={readDateFilter}
          onPresetChange={setReadDateFilter}
          range={customDateRange}
          onRangeChange={setCustomDateRange}
        />
      </LibraryToolbar>

      {isLoading ? (
        <MediaGridSkeleton />
      ) : error ? (
        <p className="py-16 text-center text-destructive">{errorMessage(error, "Failed to load books")}</p>
      ) : books.length > 0 ? (
        <div className="space-y-8">
          <div className={MEDIA_GRID}>
            {books.map((book, index) => (
              <MediaCard
                key={book._id}
                kind="book"
                index={index}
                title={book.title}
                creator={book.author}
                status={book.status}
                rating={book.rating}
                genres={book.genres}
                coverUrl={book.coverUrl}
                onEdit={() => setEditingBook(book)}
                onDelete={() => setBookToDelete(book)}
              />
            ))}
          </div>
          {data && <Pagination pagination={data.pagination} onPageChange={setPage} noun="books" />}
        </div>
      ) : isFiltered ? (
        <EmptyState icon={SearchX} title="No books found" description="Try a different search or fewer filters." />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Your shelf is empty"
          description="Add the first book you are reading, or one you want to read next."
          action={<BookModal />}
        />
      )}

      {editingBook && (
        <BookModal
          book={editingBook}
          isEdit
          trigger={<span />}
          open
          onOpenChange={(open) => !open && setEditingBook(null)}
        />
      )}

      <ConfirmDeleteDialog
        title={bookToDelete?.title}
        onConfirm={confirmDelete}
        onCancel={() => setBookToDelete(null)}
      />
    </>
  );
}
