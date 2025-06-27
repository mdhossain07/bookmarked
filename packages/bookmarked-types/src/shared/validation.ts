import { z } from "zod";

// Common validation utilities and schemas
export const EmailSchema = z.string().email("Invalid email format");
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");
export const NameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name is too long");
export const OptionalUrlSchema = z
  .string()
  .url("Invalid URL format")
  .optional();
export const DateStringSchema = z.string().datetime("Invalid date format");

// MongoDB ObjectId validation
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Common field validations
export const TitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(200, "Title is too long");
export const DescriptionSchema = z
  .string()
  .max(2000, "Description is too long")
  .optional();
export const TagsSchema = z
  .array(z.string().min(1).max(50))
  .max(20, "Too many tags");
export const RatingSchema = z
  .number()
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot exceed 5");

// File upload validation
export const ImageUrlSchema = z.string().url("Invalid image URL").optional();
export const FileTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);

// Search and filter validation
export const SearchQuerySchema = z.string().min(1).max(100);
export const GenreSchema = z.string().min(1).max(50);
export const StatusSchema = z.enum([
  "want",
  "current",
  "completed",
  "abandoned",
]);
export const MediaTypeSchema = z.enum(["book", "movie"]);

// Custom validation helpers
export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T
) => {
  return z.enum(values);
};

export const createOptionalStringSchema = (maxLength: number = 255) => {
  return z.string().max(maxLength).optional();
};

export const createRequiredStringSchema = (
  minLength: number = 1,
  maxLength: number = 255
) => {
  return z.string().min(minLength).max(maxLength);
};

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  isbn: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
  imdbId: /^tt[0-9]{7,8}$/,
  mongoObjectId: /^[0-9a-fA-F]{24}$/,
} as const;
