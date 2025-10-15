import { apiClient } from "@/lib/api";
import type { ApiResponse } from "bookmarked-types";

export interface OpenAISearchRequest {
  prompt: string;
}

export interface OpenAISearchResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStoryRequest {
  prompt: string;
}

export interface OpenAIStoryResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  /**
   * Search for books and movies using AI
   */
  static async searchBooksAndMovies(data: OpenAISearchRequest): Promise<OpenAISearchResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OpenAISearchResponse>>(
        "/openai/search",
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Search failed");
      }

      return response.data.data!;
    } catch (error: any) {
      console.error("OpenAI search error:", error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search. Please try again.");
      }
    }
  }

  /**
   * Generate a creative story using AI
   */
  static async generateStory(data: OpenAIStoryRequest): Promise<OpenAIStoryResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OpenAIStoryResponse>>(
        "/openai/generate-story",
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Story generation failed");
      }

      return response.data.data!;
    } catch (error: any) {
      console.error("OpenAI story generation error:", error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to generate story. Please try again.");
      }
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use searchBooksAndMovies instead
   */
  static async getLatestUpdate(data: OpenAISearchRequest): Promise<OpenAISearchResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OpenAISearchResponse>>(
        "/openai/latest-update",
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Latest update failed");
      }

      return response.data.data!;
    } catch (error: any) {
      console.error("OpenAI latest update error:", error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to get latest update. Please try again.");
      }
    }
  }
}

export default OpenAIService;
