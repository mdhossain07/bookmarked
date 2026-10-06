"use client";

import { useMutation } from "@tanstack/react-query";
import type { AISearchRequest, AISearchResult, ApiResponse } from "@/shared";
import { apiClient } from "@/lib/api";

/** AI search. Never retried (F8): each attempt is a paid OpenAI call. */
export function useAISearch() {
  return useMutation({
    mutationFn: async (data: AISearchRequest) => {
      // matches the route's 60 s maxDuration
      const response = await apiClient.post<ApiResponse<AISearchResult>>("/openai/search", data, { timeout: 60_000 });
      return response.data.data!;
    },
    retry: false,
  });
}
