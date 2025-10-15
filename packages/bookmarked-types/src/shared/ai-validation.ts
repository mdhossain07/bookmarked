import { z } from "zod";

// AI-specific validation schemas and enums

// Source type for items added via AI
export const AISourceSchema = z.enum([
  "ai_recommendation",
  "ai_search",
  "ai_suggestion",
]);

// Parsing confidence levels
export const ConfidenceLevelSchema = z.enum([
  "high", // 0.8-1.0
  "medium", // 0.5-0.79
  "low", // 0.0-0.49
]);

// Match types for duplicate detection
export const MatchTypeSchema = z.enum(["exact", "fuzzy", "partial"]);

// AI parsing status
export const ParsingStatusSchema = z.enum([
  "success",
  "partial",
  "failed",
  "no_content",
]);

// Content type detection
export const ContentTypeSchema = z.enum([
  "structured_list",
  "narrative_text",
  "mixed_content",
  "unknown",
]);

// AI response quality indicators
export const ResponseQualitySchema = z.object({
  hasStructuredData: z.boolean(),
  hasMetadata: z.boolean(),
  contentLength: z.number().min(0),
  itemCount: z.number().min(0),
  averageConfidence: z.number().min(0).max(1),
});

// Parsing configuration schema
export const ParsingConfigSchema = z.object({
  minConfidence: z.number().min(0).max(1).default(0.3),
  maxItems: z.number().min(1).max(100).default(50),
  enableFuzzyMatching: z.boolean().default(true),
  strictTitleMatching: z.boolean().default(false),
  extractGenres: z.boolean().default(true),
  extractDescriptions: z.boolean().default(true),
});

// Export inferred types
export type AISource = z.infer<typeof AISourceSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type MatchType = z.infer<typeof MatchTypeSchema>;
export type ParsingStatus = z.infer<typeof ParsingStatusSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type ResponseQuality = z.infer<typeof ResponseQualitySchema>;
export type ParsingConfig = z.infer<typeof ParsingConfigSchema>;

// Helper functions for confidence level mapping
export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

export const getConfidenceRange = (
  level: ConfidenceLevel
): [number, number] => {
  switch (level) {
    case "high":
      return [0.8, 1.0];
    case "medium":
      return [0.5, 0.79];
    case "low":
      return [0.0, 0.49];
  }
};

// UI-specific enums for AI features
export const UIActionTypeSchema = z.enum([
  "add_to_readlist",
  "add_to_watchlist",
  "parse_response",
  "check_duplicates",
]);

export const ModalStateSchema = z.enum([
  "closed",
  "loading",
  "selecting",
  "adding",
  "success",
  "error",
]);

export const SelectionModeSchema = z.enum([
  "none",
  "single",
  "multiple",
  "all",
]);

// Export additional types
export type UIActionType = z.infer<typeof UIActionTypeSchema>;
export type ModalState = z.infer<typeof ModalStateSchema>;
export type SelectionMode = z.infer<typeof SelectionModeSchema>;

// Validation helpers for AI content
export const validateAIContent = (content: string): boolean => {
  return content.trim().length > 0 && content.length <= 50000;
};

export const validateConfidenceScore = (score: number): boolean => {
  return score >= 0 && score <= 1 && !isNaN(score);
};

// Helper function to determine UI action based on content
export const getUIActionType = (
  hasBooks: boolean,
  hasMovies: boolean
): UIActionType[] => {
  const actions: UIActionType[] = [];
  if (hasBooks) actions.push("add_to_readlist");
  if (hasMovies) actions.push("add_to_watchlist");
  return actions;
};
