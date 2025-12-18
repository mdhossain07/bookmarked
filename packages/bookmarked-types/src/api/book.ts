import { z } from "zod";
import type { BookDocument, BookStats } from "../database/book.js";

// Status enum schema
export const BookStatusSchema = z.enum(["read", "reading", "will read"]);

// Rating schema - supports both 1-5 and 1-10 scales
export const BookRatingSchema = z
  .number()
  .min(1, "Rating must be at least 1")
  .max(10, "Rating cannot exceed 10")
  .optional();

// Create book validation schema
export const CreateBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  author: z
    .string()
    .max(100, "Author name cannot exceed 100 characters")
    .trim()
    .optional(),
  coverUrl: z.string().url("Invalid cover URL format").optional(),
  genres: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one genre is required")
    .max(10, "Cannot have more than 10 genres"),
  status: BookStatusSchema.default("will read"),
  rating: BookRatingSchema,
  review: z
    .string()
    .max(2000, "Review cannot exceed 2000 characters")
    .trim()
    .optional(),
  completedOn: z
    .string()
    .datetime("Invalid date format")
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

// Update book validation schema (all fields optional except those that shouldn't change)
export const UpdateBookSchema = CreateBookSchema.partial().omit({
  // Don't allow changing userId through update
});

// Book query parameters schema
export const BookQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().positive().default(1))
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100).default(20))
    .optional(),
  sortBy: z
    .enum([
      "title",
      "author",
      "rating",
      "completedOn",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filter parameters
  status: z.union([BookStatusSchema, z.array(BookStatusSchema)]).optional(),
  genres: z.union([z.string(), z.array(z.string())]).optional(),
  author: z.string().optional(),
  minRating: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(10))
    .optional(),
  maxRating: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(10))
    .optional(),
  completedFrom: z.string().datetime().optional(),
  completedTo: z.string().datetime().optional(),
  search: z.string().min(1).max(100).trim().optional(),
});

// Book ID parameter schema
export const BookIdParamSchema = z.object({
  id: z.string().min(1, "Book ID is required"),
});

// Bulk update book status schema
export const BulkUpdateBookStatusSchema = z.object({
  bookIds: z
    .array(z.string().min(1))
    .min(1, "At least one book ID is required"),
  status: BookStatusSchema,
});

// Batch add books schema
export const BatchAddBooksSchema = z.object({
  books: z
    .array(CreateBookSchema)
    .min(1, "At least one book is required")
    .max(50, "Cannot add more than 50 books at once"),
});

// Export request/response types
export type CreateBookRequest = z.infer<typeof CreateBookSchema>;
export type UpdateBookRequest = z.infer<typeof UpdateBookSchema>;
export type BookQueryRequest = z.infer<typeof BookQuerySchema>;
export type BookIdParam = z.infer<typeof BookIdParamSchema>;
export type BulkUpdateBookStatusRequest = z.infer<
  typeof BulkUpdateBookStatusSchema
>;
export type BatchAddBooksRequest = z.infer<typeof BatchAddBooksSchema>;

// API Response interfaces
export interface BookResponse {
  success: boolean;
  message: string;
  data: {
    book: BookDocument;
  };
  timestamp: string;
}

export interface BooksListResponse {
  success: boolean;
  message: string;
  data: {
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
  };
  timestamp: string;
}

export interface BookStatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: BookStats;
  };
  timestamp: string;
}

export interface BulkUpdateBookResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
    failed: number;
    errors?: string[];
  };
  timestamp: string;
}

export interface BatchAddBooksResponse {
  success: boolean;
  message: string;
  data: {
    added: number;
    failed: number;
    duplicates: number;
    errors?: string[];
    books?: BookDocument[];
  };
  timestamp: string;
}
