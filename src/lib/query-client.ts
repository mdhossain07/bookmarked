import { QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./api";

function isAuthError(error: unknown): boolean {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
}

// The session can expire while a page is open. Queries only: a mutation 401 can be a
// wrong current password, which must stay on the page.
function redirectOnExpiredSession(error: unknown) {
  if (error instanceof ApiClientError && error.status === 401 && typeof window !== "undefined") {
    const from = window.location.pathname + window.location.search;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full reload drops the cached data of the expired session
    window.location.assign(`/login?from=${encodeURIComponent(from)}`);
  }
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectOnExpiredSession }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) =>
          !isAuthError(error) && !(error instanceof ApiClientError && error.status === 404) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}
