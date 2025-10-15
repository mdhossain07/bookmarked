import { useMutation } from "@tanstack/react-query";
import { OpenAIService, type OpenAISearchRequest, type OpenAIStoryRequest } from "@/services/openaiService";

/**
 * Hook for searching books and movies using AI
 */
export const useOpenAISearch = () => {
  return useMutation({
    mutationFn: (data: OpenAISearchRequest) => OpenAIService.searchBooksAndMovies(data),
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook for generating stories using AI
 */
export const useOpenAIStoryGeneration = () => {
  return useMutation({
    mutationFn: (data: OpenAIStoryRequest) => OpenAIService.generateStory(data),
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useOpenAISearch instead
 */
export const useOpenAILatestUpdate = () => {
  return useMutation({
    mutationFn: (data: OpenAISearchRequest) => OpenAIService.getLatestUpdate(data),
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
