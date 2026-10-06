"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useBookStats, useMovieStats } from "@/hooks/use-media";

export function DashboardView() {
  const { user } = useAuth();
  const { data: bookStats, isLoading: booksLoading } = useBookStats();
  const { data: movieStats, isLoading: moviesLoading } = useMovieStats();

  const count = (value: number | undefined, loading: boolean) => (loading ? "…" : (value ?? 0));

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user.firstName}!</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your reading and watching progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Books</CardTitle>
            <CardDescription>Track your reading progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatRow label="Books Read" value={count(bookStats?.byStatus.read, booksLoading)} color="text-green-600" />
            <StatRow
              label="To Be Read"
              value={count(bookStats?.byStatus["will read"], booksLoading)}
              color="text-blue-600"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movies</CardTitle>
            <CardDescription>Keep track of what you&apos;ve watched</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatRow
              label="Movies Watched"
              value={count(movieStats?.byStatus.watched, moviesLoading)}
              color="text-green-600"
            />
            <StatRow
              label="To Watch"
              value={count(movieStats?.byStatus["to watch"], moviesLoading)}
              color="text-blue-600"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/books">Add Book</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/movies">Add Movie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatRow({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
