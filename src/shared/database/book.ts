export interface Book {
  _id: string;
  userId: string; // Reference to the user who bookmarked this book
  title: string; // Required
  author?: string; // Optional
  coverUrl?: string; // Optional - URL to book cover image
  genres: string[]; // Array of genre strings, required
  status: "read" | "reading" | "will read"; // Required enum for reading status
  rating?: number; // Optional - user's rating (1-5 or 1-10 scale)
  review?: string; // Optional - user's written review
  completedOn?: Date; // Optional - date when book was completed/read
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

// Database document interface (for client-side usage)
export interface BookDocument extends Book {
  // Computed fields can be added here if needed
  formattedRating?: string; // e.g., "4.5/5" or "8.5/10"
  durationSinceCompleted?: string; // e.g., "2 days ago"
}

// Book filters for search and filtering operations
export interface BookFilters {
  userId?: string;
  genres?: string | string[];
  status?: Book['status'] | Book['status'][];
  rating?: {
    min?: number;
    max?: number;
  };
  author?: string;
  completedOn?: {
    from?: Date;
    to?: Date;
  };
  createdAt?: {
    from?: Date;
    to?: Date;
  };
  search?: string; // Search in title, author, review
}

// Book statistics interface
export interface BookStats {
  total: number;
  byStatus: {
    read: number;
    reading: number;
    'will read': number;
  };
  byGenre: Record<string, number>;
  averageRating?: number;
  totalReadTime?: number; // If we track reading duration
  recentlyCompleted: number; // Books completed in last 30 days
}

// Book sort options
export type BookSortField = 
  | 'title'
  | 'author'
  | 'rating'
  | 'completedOn'
  | 'createdAt'
  | 'updatedAt';

export type BookSortOrder = 'asc' | 'desc';

export interface BookSort {
  field: BookSortField;
  order: BookSortOrder;
}

// Book query options for pagination and filtering
export interface BookQueryOptions {
  page?: number;
  limit?: number;
  sort?: BookSort;
  filters?: BookFilters;
}

// Book aggregation result
export interface BookQueryResult {
  books: BookDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: BookStats;
}
