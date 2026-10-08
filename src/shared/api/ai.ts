import { z } from "zod";

export const AISearchSchema = z.object({
  prompt: z
    .string({ required_error: "Search prompt is required" })
    .trim()
    .min(3, "Search query must be at least 3 characters")
    .max(500, "Search query cannot exceed 500 characters"),
});

export type AISearchRequest = z.infer<typeof AISearchSchema>;

export interface AISearchResult {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
