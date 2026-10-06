import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/shared";

/** Error thrown by `apiClient`, carrying the server's message instead of axios's generic one. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  // `status=a&status=b`, the form the API's parseQuery reads as an array
  paramsSerializer: { indexes: null },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const body = error.response?.data;
    return Promise.reject(
      new ApiClientError(
        body?.message ?? (error.code === "ECONNABORTED" ? "The request timed out." : error.message),
        error.response?.status,
        body?.error?.code,
        body?.error?.details
      )
    );
  }
);

export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
