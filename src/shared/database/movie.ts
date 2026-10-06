export interface Movie {
  _id: string;
  userId: string; // Reference to the user who bookmarked this movie
  title: string; // Required
  director?: string; // Optional
  coverUrl?: string; // Optional - URL to movie poster/cover image
  industry: "Hollywood" | "Bollywood" | "Bangla" | "South Indian" | "Foreign"; // Required enum
  genres: string[]; // Array of genre strings, required
  status: "watched" | "watching" | "to watch"; // Required enum for viewing status
  rating?: number; // Optional - user's rating (1-5 or 1-10 scale)
  review?: string; // Optional - user's written review
  completedOn?: Date; // Optional - date when movie was completed/watched
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

// Database document interface (for client-side usage)
export interface MovieDocument extends Movie {
  // Computed fields can be added here if needed
  formattedRating?: string; // e.g., "4.5/5" or "8.5/10"
  durationSinceCompleted?: string; // e.g., "2 days ago"
}

// Movie filters for search and filtering operations
export interface MovieFilters {
  userId?: string;
  industry?: Movie["industry"] | Movie["industry"][];
  genres?: string | string[];
  status?: Movie["status"] | Movie["status"][];
  rating?: {
    min?: number;
    max?: number;
  };
  director?: string;
  completedOn?: {
    from?: Date;
    to?: Date;
  };
  createdAt?: {
    from?: Date;
    to?: Date;
  };
  search?: string; // Search in title, director, review
}

// Movie statistics interface
export interface MovieStats {
  total: number;
  byStatus: {
    watched: number;
    watching: number;
    "to watch": number;
  };
  byIndustry: {
    Hollywood: number;
    Bollywood: number;
    Bangla: number;
    "South Indian": number;
    Foreign: number;
  };
  byGenre: Record<string, number>;
  averageRating?: number;
  totalWatchTime?: number; // If we track movie duration
  recentlyCompleted: number; // Movies completed in last 30 days
}

// Movie sort options
export type MovieSortField =
  | "title"
  | "director"
  | "rating"
  | "completedOn"
  | "createdAt"
  | "updatedAt";

export type MovieSortOrder = "asc" | "desc";

export interface MovieSort {
  field: MovieSortField;
  order: MovieSortOrder;
}

// Movie query options for pagination and filtering
export interface MovieQueryOptions {
  page?: number;
  limit?: number;
  sort?: MovieSort;
  filters?: MovieFilters;
}

// Movie aggregation result
export interface MovieQueryResult {
  movies: MovieDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: MovieStats;
}
