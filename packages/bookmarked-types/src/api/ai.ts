import { z } from "zod";
import { CreateBookSchema } from "./book.js";
import { CreateMovieSchema } from "./movie.js";
import { MediaTypeSchema } from "../shared/validation.js";
import {
  AISourceSchema,
  MatchTypeSchema,
  ParsingStatusSchema,
  ContentTypeSchema,
  ResponseQualitySchema,
  ParsingConfigSchema,
  type AISource,
} from "../shared/ai-validation.js";

// Confidence score schema (0-1 range)
export const ConfidenceScoreSchema = z
  .number()
  .min(0, "Confidence score must be at least 0")
  .max(1, "Confidence score cannot exceed 1");

// Parsed media item schema - represents an item extracted from AI response
export const ParsedMediaItemSchema = z.object({
  type: MediaTypeSchema,
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
  director: z
    .string()
    .max(100, "Director name cannot exceed 100 characters")
    .trim()
    .optional(),
  genre: z
    .array(z.string().min(1).max(50))
    .max(10, "Cannot have more than 10 genres")
    .optional(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .trim()
    .optional(),
  confidence: ConfidenceScoreSchema,
});

// Parsed response schema - result of parsing an AI response
export const ParsedResponseSchema = z.object({
  books: z.array(ParsedMediaItemSchema),
  movies: z.array(ParsedMediaItemSchema),
  hasBooks: z.boolean(),
  hasMovies: z.boolean(),
});

// AI response parsing request schema
export const AIResponseParseSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content too large for parsing"),
});

// Extended create schemas for AI-sourced items
export const CreateBookFromAISchema = CreateBookSchema.extend({
  source: AISourceSchema.optional(),
  confidence: ConfidenceScoreSchema.optional(),
  originalText: z.string().max(1000).optional(), // Store original AI text for reference
});

export const CreateMovieFromAISchema = CreateMovieSchema.extend({
  source: AISourceSchema.optional(),
  confidence: ConfidenceScoreSchema.optional(),
  originalText: z.string().max(1000).optional(), // Store original AI text for reference
});

// Batch addition schemas for AI-parsed items
export const BatchAddFromAISchema = z
  .object({
    books: z
      .array(CreateBookFromAISchema)
      .max(50, "Cannot add more than 50 books at once")
      .optional(),
    movies: z
      .array(CreateMovieFromAISchema)
      .max(50, "Cannot add more than 50 movies at once")
      .optional(),
  })
  .refine(
    (data) =>
      (data.books && data.books.length > 0) ||
      (data.movies && data.movies.length > 0),
    {
      message: "At least one book or movie must be provided",
    }
  );

// Duplicate detection schema
export const DuplicateCheckSchema = z.object({
  items: z
    .array(ParsedMediaItemSchema)
    .min(1, "At least one item is required")
    .max(100, "Cannot check more than 100 items at once"),
});

// Selection state schema for UI validation
export const MediaItemSelectionSchema = z.object({
  item: ParsedMediaItemSchema,
  isSelected: z.boolean(),
  isDuplicate: z.boolean().optional(),
  duplicateId: z.string().optional(),
  matchType: z.enum(["exact", "fuzzy"]).optional(),
});

// Batch operation configuration schema
export const BatchOperationConfigSchema = z.object({
  maxItems: z.number().min(1).max(100).default(50),
  allowDuplicates: z.boolean().default(false),
  skipValidation: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

// Export inferred types
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type ParsedMediaItem = z.infer<typeof ParsedMediaItemSchema>;
export type ParsedResponse = z.infer<typeof ParsedResponseSchema>;
export type EnhancedParsedResponse = z.infer<
  typeof EnhancedParsedResponseSchema
>;
export type AIResponseParseRequest = z.infer<typeof AIResponseParseSchema>;
export type CreateBookFromAIRequest = z.infer<typeof CreateBookFromAISchema>;
export type CreateMovieFromAIRequest = z.infer<typeof CreateMovieFromAISchema>;
export type BatchAddFromAIRequest = z.infer<typeof BatchAddFromAISchema>;
export type DuplicateCheckRequest = z.infer<typeof DuplicateCheckSchema>;
export type MediaItemSelectionType = z.infer<typeof MediaItemSelectionSchema>;
export type BatchOperationConfig = z.infer<typeof BatchOperationConfigSchema>;

// Enhanced parsing response with detailed metadata
export const EnhancedParsedResponseSchema = ParsedResponseSchema.extend({
  status: ParsingStatusSchema,
  contentType: ContentTypeSchema,
  quality: ResponseQualitySchema,
  processingTime: z.number().min(0),
  config: ParsingConfigSchema.optional(),
});

// API Response interfaces for AI functionality
export interface AIParseResponse {
  success: boolean;
  message: string;
  data: {
    parsed: ParsedResponse;
    status: z.infer<typeof ParsingStatusSchema>;
    contentType: z.infer<typeof ContentTypeSchema>;
    quality: z.infer<typeof ResponseQualitySchema>;
    processingTime: number;
    itemsFound: number;
    warnings?: string[];
  };
  timestamp: string;
}

export interface BatchAddFromAIResponse {
  success: boolean;
  message: string;
  data: {
    added: number;
    failed: number;
    duplicates: number;
    skipped: number;
    errors?: string[];
    warnings?: string[];
    addedBooks?: number;
    addedMovies?: number;
    failedItems?: Array<{
      item: ParsedMediaItem;
      error: string;
    }>;
    duplicateItems?: Array<{
      item: ParsedMediaItem;
      existingId: string;
      matchType: z.infer<typeof MatchTypeSchema>;
    }>;
  };
  timestamp: string;
}

export interface DuplicateCheckResponse {
  success: boolean;
  message: string;
  data: {
    totalChecked: number;
    duplicatesFound: number;
    duplicates: Array<{
      item: ParsedMediaItem;
      existingId: string;
      existingTitle: string;
      matchType: z.infer<typeof MatchTypeSchema>;
      confidence: number;
    }>;
  };
  timestamp: string;
}

// Additional API endpoint interfaces for AI functionality
export interface AIHealthCheckResponse {
  success: boolean;
  message: string;
  data: {
    parsingService: "online" | "offline";
    batchService: "online" | "offline";
    duplicateDetection: "online" | "offline";
    lastUpdated: string;
  };
  timestamp: string;
}

export interface AIStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalParsed: number;
    totalAdded: number;
    averageConfidence: number;
    duplicatesDetected: number;
    errorRate: number;
    lastWeekStats: {
      parsed: number;
      added: number;
      duplicates: number;
    };
  };
  timestamp: string;
}

// Selection state interface for UI components
export interface MediaItemSelection {
  item: ParsedMediaItem;
  isSelected: boolean;
  isDuplicate?: boolean;
  duplicateId?: string;
  matchType?: "exact" | "fuzzy";
}

// Batch operation result interface
export interface BatchOperationResult {
  success: boolean;
  totalItems: number;
  addedItems: number;
  failedItems: number;
  duplicateItems: number;
  errors: string[];
  warnings: string[];
}

// Component prop interfaces for React components

// AIResponseActions component props
export interface AIResponseActionsProps {
  searchResult: any; // OpenAISearchResponse - will be defined by the OpenAI integration
  onItemsAdded?: (type: "books" | "movies", count: number) => void;
}

// AddToListModal component props
export interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ParsedMediaItem[];
  type: "books" | "movies";
  onItemsAdded: (count: number) => void;
}

// SelectableMediaItem component props
export interface SelectableMediaItemProps {
  item: ParsedMediaItem;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  isDuplicate?: boolean;
}

// Batch service interfaces
export interface BatchAddRequest {
  books?: CreateBookFromAIRequest[];
  movies?: CreateMovieFromAIRequest[];
}

export interface BatchAddResponse {
  success: boolean;
  added: number;
  failed: number;
  errors?: string[];
  duplicates?: string[];
}

// Extended batch request types for internal use
export interface CreateBookRequestBatch
  extends Omit<CreateBookFromAIRequest, "userId"> {
  source?: AISource;
  confidence?: number;
}

export interface CreateMovieRequestBatch
  extends Omit<CreateMovieFromAIRequest, "userId"> {
  source?: AISource;
  confidence?: number;
}
