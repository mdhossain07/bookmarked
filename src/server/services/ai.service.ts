import "server-only";
import OpenAI from "openai";
import { ErrorCodes, HttpStatus, type AISearchResult } from "@/shared";
import { env } from "../env";
import { ApiError } from "../http/errors";

const SYSTEM_PROMPT = `You are an expert assistant specializing in books and movies.
Provide helpful, accurate, and engaging information about:
- Book recommendations and reviews
- Movie recommendations and reviews
- Author and director information
- Genre analysis and comparisons
- Latest releases and trending content
- Plot summaries and character analysis

Always provide well-structured, informative responses that help users discover new content or learn more about books and movies they're interested in.`;

let client: OpenAI | undefined;

// Created on first use (V4): a missing key fails this route only, not every import.
function openai(): OpenAI {
  const apiKey = env().OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError("AI search is not configured", HttpStatus.SERVICE_UNAVAILABLE, ErrorCodes.EXTERNAL_SERVICE_ERROR);
  }
  // timeout stays under the route's 60 s maxDuration
  client ??= new OpenAI({ apiKey, timeout: 50_000, maxRetries: 1 });
  return client;
}

export async function searchBooksAndMovies(prompt: string): Promise<AISearchResult> {
  const ai = openai();
  try {
    const response = await ai.chat.completions.create({
      model: env().OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1500,
      temperature: 0.7,
    });

    const { usage } = response;
    return {
      content: response.choices[0]?.message?.content ?? "",
      ...(usage && {
        usage: {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        },
      }),
    };
  } catch (error) {
    // APIError carries the full response headers; its message already starts with the status
    console.error("OpenAI search failed:", error instanceof OpenAI.APIError ? error.message : error);
    throw new ApiError("AI search failed. Please try again.", HttpStatus.BAD_GATEWAY, ErrorCodes.EXTERNAL_SERVICE_ERROR);
  }
}
