export interface Media {
  _id: string;
  userId: string;
  type: 'book' | 'movie';
  title: string;
  author?: string;
  director?: string;
  coverUrl?: string;
  genres: string[];
  status: 'want' | 'current' | 'completed' | 'abandoned';
  rating?: number; // 1-5 stars
  review?: string;
  dateCompleted?: Date;
  customTags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Book-specific fields
  isbn?: string;
  pageCount?: number;
  publisher?: string;
  publishedDate?: Date;
  
  // Movie-specific fields
  imdbId?: string;
  runtime?: number; // in minutes
  releaseYear?: number;
  cast?: string[];
  
  // Progress tracking
  currentPage?: number; // for books
  watchedMinutes?: number; // for movies
  
  // External data
  externalIds?: {
    goodreads?: string;
    imdb?: string;
    tmdb?: string;
  };
}

export interface MediaStats {
  totalItems: number;
  completedItems: number;
  currentItems: number;
  wantToReadWatch: number;
  abandonedItems: number;
  averageRating: number;
  totalPages?: number; // for books
  totalMinutes?: number; // for movies
}

export interface MediaFilters {
  type?: 'book' | 'movie';
  status?: Media['status'];
  genres?: string[];
  rating?: number;
  tags?: string[];
  search?: string;
  author?: string;
  director?: string;
  year?: number;
}
