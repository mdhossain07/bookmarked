export interface Genre {
  _id: string;
  name: string;
  type: 'book' | 'movie' | 'both';
  description?: string;
  color?: string; // Hex color for UI
  isDefault: boolean; // System-defined genres
  createdAt: Date;
  updatedAt: Date;
}

// Predefined genres for books
export const DEFAULT_BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Self-Help',
  'Business',
  'Health',
  'Travel',
  'Cooking',
  'Art',
  'Poetry',
  'Drama',
  'Horror',
  'Thriller',
  'Young Adult',
  'Children',
] as const;

// Predefined genres for movies
export const DEFAULT_MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Sport',
  'Thriller',
  'War',
  'Western',
] as const;

export type BookGenre = typeof DEFAULT_BOOK_GENRES[number];
export type MovieGenre = typeof DEFAULT_MOVIE_GENRES[number];
