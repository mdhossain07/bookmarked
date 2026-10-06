import { z } from "zod";

// Industry enum schema
export const MovieIndustrySchema = z.enum([
  "Hollywood",
  "Bollywood",
  "Bangla",
  "South Indian",
  "Foreign",
]);

// Status enum schema
export const MovieStatusSchema = z.enum(["watched", "watching", "to watch"]);

// Rating schema - supports both 1-5 and 1-10 scales
export const MovieRatingSchema = z
  .number()
  .min(1, "Rating must be at least 1")
  .max(10, "Rating cannot exceed 10")
  .optional();

// Create movie validation schema
export const CreateMovieSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  director: z
    .string()
    .max(100, "Director name cannot exceed 100 characters")
    .trim()
    .optional(),
  coverUrl: z.string().url("Invalid cover URL format").optional(),
  industry: MovieIndustrySchema,
  genres: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one genre is required")
    .max(10, "Cannot have more than 10 genres"),
  status: MovieStatusSchema.default("to watch"),
  rating: MovieRatingSchema,
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

// Update movie validation schema (all fields optional except those that shouldn't change)
export const UpdateMovieSchema = CreateMovieSchema.partial().omit({
  // Don't allow changing userId through update
});

// Movie query parameters schema
export const MovieQuerySchema = z.object({
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
      "director",
      "rating",
      "completedOn",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filter parameters
  industry: z
    .union([MovieIndustrySchema, z.array(MovieIndustrySchema)])
    .optional(),
  status: z.union([MovieStatusSchema, z.array(MovieStatusSchema)]).optional(),
  genres: z.union([z.string(), z.array(z.string())]).optional(),
  director: z.string().optional(),
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

// Export request/response types
export type CreateMovieRequest = z.infer<typeof CreateMovieSchema>;
export type UpdateMovieRequest = z.infer<typeof UpdateMovieSchema>;
export type MovieQueryRequest = z.infer<typeof MovieQuerySchema>;
