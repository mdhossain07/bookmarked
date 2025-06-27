import { z } from 'zod';
import type { Media, MediaFilters, MediaStats } from '../database/media';

// Zod validation schemas
export const CreateMediaSchema = z.object({
  type: z.enum(['book', 'movie']),
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().max(100).optional(),
  director: z.string().max(100).optional(),
  coverUrl: z.string().url().optional(),
  genres: z.array(z.string()).default([]),
  status: z.enum(['want', 'current', 'completed', 'abandoned']).default('want'),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().max(2000).optional(),
  dateCompleted: z.string().datetime().optional(),
  customTags: z.array(z.string()).default([]),
  
  // Book-specific fields
  isbn: z.string().optional(),
  pageCount: z.number().positive().optional(),
  publisher: z.string().max(100).optional(),
  publishedDate: z.string().datetime().optional(),
  
  // Movie-specific fields
  imdbId: z.string().optional(),
  runtime: z.number().positive().optional(),
  releaseYear: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  cast: z.array(z.string()).optional(),
  
  // Progress tracking
  currentPage: z.number().positive().optional(),
  watchedMinutes: z.number().positive().optional(),
});

export const UpdateMediaSchema = CreateMediaSchema.partial().extend({
  _id: z.string().min(1, 'Media ID is required'),
});

export const MediaFiltersSchema = z.object({
  type: z.enum(['book', 'movie']).optional(),
  status: z.enum(['want', 'current', 'completed', 'abandoned']).optional(),
  genres: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  author: z.string().optional(),
  director: z.string().optional(),
  year: z.number().optional(),
  page: z.number().positive().default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'rating', 'dateCompleted']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Request/Response types
export type CreateMediaRequest = z.infer<typeof CreateMediaSchema>;
export type UpdateMediaRequest = z.infer<typeof UpdateMediaSchema>;
export type MediaFiltersRequest = z.infer<typeof MediaFiltersSchema>;

export interface MediaResponse {
  success: boolean;
  message: string;
  data: {
    media: Media;
  };
}

export interface MediaListResponse {
  success: boolean;
  message: string;
  data: {
    media: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: MediaFilters;
  };
}

export interface MediaStatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: MediaStats;
    breakdown: {
      byType: Record<'book' | 'movie', MediaStats>;
      byStatus: Record<Media['status'], number>;
      byGenre: Record<string, number>;
      byRating: Record<string, number>;
      recentActivity: Media[];
    };
  };
}

export interface DeleteMediaResponse {
  success: boolean;
  message: string;
  data: {
    deletedId: string;
  };
}
