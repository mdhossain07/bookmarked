"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { BookOpen, Film, Library } from "lucide-react";
import BookModal from "@/components/BookModal";
import MovieModal from "@/components/MovieModal";
import { EmptyState } from "@/components/media/EmptyState";
import { PageHeader } from "@/components/media/PageHeader";
import { SceneLayer } from "@/components/three/SceneLayer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBookStats,
  useBooks,
  useMovieStats,
  useMovies,
} from "@/hooks/use-media";
import { cn } from "@/lib/utils";

const RECENT_COUNT = 6;

const subscribeNever = () => () => {};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView() {
  const { user } = useAuth();
  // The server renders in UTC, so its hour differs from the visitor's: React shows the
  // server text while hydrating, then switches to the browser's own hour.
  const salutation = useSyncExternalStore(subscribeNever, greeting, () => "Welcome back");
  const bookStats = useBookStats();
  const movieStats = useMovieStats();
  const recentBooks = useBooks({ page: 1, limit: RECENT_COUNT });
  const recentMovies = useMovies({ page: 1, limit: RECENT_COUNT });

  const tiles = [
    {
      label: "Books read",
      value: bookStats.data?.byStatus.read,
      loading: bookStats.isLoading,
      kind: "book",
    },
    {
      label: "Reading now",
      value: bookStats.data?.byStatus.reading,
      loading: bookStats.isLoading,
      kind: "book",
    },
    {
      label: "Movies watched",
      value: movieStats.data?.byStatus.watched,
      loading: movieStats.isLoading,
      kind: "movie",
    },
    {
      label: "To watch",
      value: movieStats.data?.byStatus["to watch"],
      loading: movieStats.isLoading,
      kind: "movie",
    },
  ] as const;

  const recent = [
    ...(recentBooks.data?.books ?? []).map((b) => ({
      ...b,
      kind: "book" as const,
      creator: b.author,
    })),
    ...(recentMovies.data?.movies ?? []).map((m) => ({
      ...m,
      kind: "movie" as const,
      creator: m.director,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, RECENT_COUNT);
  const recentLoading = recentBooks.isLoading || recentMovies.isLoading;

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-lg border bg-card p-6 shadow-card">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_65%)]">
          <SceneLayer minWidth={768} />
        </div>
        <div className="relative [&>div]:mb-0">
          <PageHeader
            title={`${salutation}, ${user.firstName}`}
            description="Here is where your reading and watching stand."
            action={
              <>
                <BookModal />
                <MovieModal />
              </>
            }
          />
        </div>
      </div>

      <section
        aria-label="Totals"
        className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
      >
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={cn(
              "rounded-lg border border-t-2 bg-card p-5 shadow-card motion-safe:animate-enter",
              tile.kind === "book" ? "border-t-books" : "border-t-movies",
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            {tile.loading ? (
              <Skeleton className="mt-2 h-10 w-16" />
            ) : (
              <p className="mt-1 font-display text-2xl font-semibold">
                {tile.value ?? 0}
              </p>
            )}
          </div>
        ))}
      </section>

      <section aria-labelledby="recent-heading" className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently added
          </h2>
          <div className="flex gap-4 text-sm">
            <Link
              href="/books"
              className="text-muted-foreground hover:text-foreground"
            >
              All books
            </Link>
            <Link
              href="/movies"
              className="text-muted-foreground hover:text-foreground"
            >
              All movies
            </Link>
          </div>
        </div>

        {recentLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Library}
            title="Nothing here yet"
            description="Add a book or a movie, and your latest additions show up here."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item, index) => {
              const Icon = item.kind === "book" ? BookOpen : Film;
              return (
                <li
                  key={`${item.kind}-${item._id}`}
                  className="motion-safe:animate-enter"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Link
                    href={item.kind === "book" ? "/books" : "/movies"}
                    className="flex items-center gap-4 rounded-lg border bg-card p-3 shadow-card transition duration-150 hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
                  >
                    <span
                      className={cn(
                        "flex h-14 w-10 shrink-0 items-center justify-center rounded-sm",
                        item.kind === "book"
                          ? "bg-books/10 text-books"
                          : "bg-movies/10 text-movies",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {item.title}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {item.creator ||
                          (item.kind === "book" ? "Book" : "Movie")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
