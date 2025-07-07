import { QueryClient } from '@tanstack/react-query';

// Create a client with authentication-friendly defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time for auth-related queries
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time for auth data
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry configuration for auth failures
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus for auth state
      refetchOnWindowFocus: true,
      // Refetch on reconnect to ensure auth state is current
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        // Don't retry auth-related errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
