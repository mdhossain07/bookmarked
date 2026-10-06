"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, Book, BookStats, ListPagination, Movie, MovieStats } from "@/shared";
import { apiClient } from "@/lib/api";

type Resource = "books" | "movies";

/** Query params the list routes accept; empty values are dropped before the request. */
export interface MediaListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  author?: string;
  industry?: string;
  completedFrom?: string;
  completedTo?: string;
}

function compact(params: MediaListParams) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
}

async function getData<T>(url: string, params?: object): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.data as T;
}

// Every key starts with the resource, so invalidating ["books"] refreshes lists, stats, and authors.
export const mediaKeys = {
  all: (resource: Resource) => [resource] as const,
  list: (resource: Resource, params: MediaListParams) => [resource, "list", compact(params)] as const,
  stats: (resource: Resource) => [resource, "stats"] as const,
  authors: () => ["books", "authors"] as const,
};

export function useBooks(params: MediaListParams) {
  return useQuery({
    queryKey: mediaKeys.list("books", params),
    queryFn: () => getData<{ books: Book[]; pagination: ListPagination }>("/books", compact(params)),
    placeholderData: keepPreviousData,
  });
}

export function useMovies(params: MediaListParams) {
  return useQuery({
    queryKey: mediaKeys.list("movies", params),
    queryFn: () => getData<{ movies: Movie[]; pagination: ListPagination }>("/movies", compact(params)),
    placeholderData: keepPreviousData,
  });
}

export function useBookStats() {
  return useQuery({
    queryKey: mediaKeys.stats("books"),
    queryFn: async () => (await getData<{ stats: BookStats }>("/books/stats")).stats,
  });
}

export function useMovieStats() {
  return useQuery({
    queryKey: mediaKeys.stats("movies"),
    queryFn: async () => (await getData<{ stats: MovieStats }>("/movies/stats")).stats,
  });
}

/** All distinct authors, for the author filter (one page of books would miss some). */
export function useBookAuthors() {
  return useQuery({
    queryKey: mediaKeys.authors(),
    queryFn: async () => (await getData<{ authors: string[] }>("/books/authors")).authors,
  });
}

/** Create, update, and delete for one resource; each success refreshes every query of that resource. */
export function useMediaMutations<T extends object>(resource: Resource) {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: mediaKeys.all(resource) });

  const create = useMutation({
    mutationFn: (data: Partial<T>) => apiClient.post(`/${resource}`, data),
    onSuccess,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => apiClient.put(`/${resource}/${id}`, data),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/${resource}/${id}`),
    onSuccess,
  });

  return { create, update, remove };
}
