import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Movie, Book } from "bookmarked-types";

// API response types
interface MoviesResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types for the context
interface MediaContextType {
  // Movies
  movies: MoviesResponse | null;
  isLoadingMovies: boolean;
  moviesError: Error | null;
  addMovie: (
    movie: Omit<Movie, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateMovie: (id: string, movie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;

  // Books
  books: BooksResponse | null;
  isLoadingBooks: boolean;
  booksError: Error | null;
  addBook: (
    book: Omit<Book, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateBook: (id: string, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

// Create context
const MediaContext = createContext<MediaContextType | undefined>(undefined);

// Provider props
interface MediaProviderProps {
  children: ReactNode;
}

// Media provider component
export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Movies queries and mutations
  const {
    data: movies = null,
    isLoading: isLoadingMovies,
    error: moviesError,
  } = useQuery({
    queryKey: ["movies"],
    queryFn: async (): Promise<MoviesResponse> => {
      const response = await apiClient.get("/movies");
      return (
        response.data.data || {
          movies: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      );
    },
    enabled: isAuthenticated,
  });

  const addMovieMutation = useMutation({
    mutationFn: async (
      movie: Omit<Movie, "_id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      const response = await apiClient.post("/movies", movie);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  const updateMovieMutation = useMutation({
    mutationFn: async ({
      id,
      movie,
    }: {
      id: string;
      movie: Partial<Movie>;
    }) => {
      const response = await apiClient.put(`/movies/${id}`, movie);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/movies/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });

  // Wrapper functions for mutations
  const addMovie = async (
    movie: Omit<Movie, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    await addMovieMutation.mutateAsync(movie);
  };

  const updateMovie = async (id: string, movie: Partial<Movie>) => {
    await updateMovieMutation.mutateAsync({ id, movie });
  };

  const deleteMovie = async (id: string) => {
    await deleteMovieMutation.mutateAsync(id);
  };

  // Books queries and mutations
  const {
    data: books = null,
    isLoading: isLoadingBooks,
    error: booksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<BooksResponse> => {
      const response = await apiClient.get("/books");
      return (
        response.data.data || {
          books: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      );
    },
    enabled: isAuthenticated,
  });

  const addBookMutation = useMutation({
    mutationFn: async (
      book: Omit<Book, "_id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      const response = await apiClient.post("/books", book);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, book }: { id: string; book: Partial<Book> }) => {
      const response = await apiClient.put(`/books/${id}`, book);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/books/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  // Wrapper functions for book mutations
  const addBook = async (
    book: Omit<Book, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    await addBookMutation.mutateAsync(book);
  };

  const updateBook = async (id: string, book: Partial<Book>) => {
    await updateBookMutation.mutateAsync({ id, book });
  };

  const deleteBook = async (id: string) => {
    await deleteBookMutation.mutateAsync(id);
  };

  // Context value
  const value: MediaContextType = {
    // Movies
    movies,
    isLoadingMovies,
    moviesError: moviesError as Error | null,
    addMovie,
    updateMovie,
    deleteMovie,

    // Books
    books,
    isLoadingBooks,
    booksError: booksError as Error | null,
    addBook,
    updateBook,
    deleteBook,
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

// Hook to use media context
export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);

  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }

  return context;
};

export default MediaContext;
