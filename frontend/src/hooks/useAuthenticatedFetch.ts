import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosRequestConfig, AxiosResponse } from "axios";

// Types for the hook
interface UseAuthenticatedFetchOptions<TData = any>
  extends Omit<UseQueryOptions<TData>, "queryFn"> {
  url: string;
  config?: AxiosRequestConfig;
}

interface UseAuthenticatedMutationOptions<TData = any, TVariables = any>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  url: string | ((variables: TVariables) => string);
  config?: AxiosRequestConfig;
}

/**
 * Custom hook for authenticated GET requests using React Query
 */
export const useAuthenticatedFetch = <TData = any>(
  options: UseAuthenticatedFetchOptions<TData>
) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { url, config, ...queryOptions } = options;

  return useQuery<TData>({
    ...queryOptions,
    queryFn: async () => {
      const response: AxiosResponse<TData> = await apiClient.get(url, config);
      return response.data;
    },
    enabled: isAuthenticated && !authLoading && queryOptions.enabled !== false,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Custom hook for authenticated mutations (POST, PUT, PATCH, DELETE)
 */
export const useAuthenticatedMutation = <TData = any, TVariables = any>(
  options: UseAuthenticatedMutationOptions<TData, TVariables>
) => {
  const { isAuthenticated } = useAuth();
  const { method = "POST", url, config, ...mutationOptions } = options;

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }

      const requestUrl = typeof url === "function" ? url(variables) : url;
      let response: AxiosResponse<TData>;

      switch (method) {
        case "POST":
          response = await apiClient.post(requestUrl, variables, config);
          break;
        case "PUT":
          response = await apiClient.put(requestUrl, variables, config);
          break;
        case "PATCH":
          response = await apiClient.patch(requestUrl, variables, config);
          break;
        case "DELETE":
          response = await apiClient.delete(requestUrl, {
            ...config,
            data: variables,
          });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Call the original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Handle auth errors
      if (error.message.includes("401") || error.message.includes("403")) {
        // Auth context will handle logout
        console.warn("Authentication error in mutation:", error);
      }

      // Call the original onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
  });
};

/**
 * Hook for fetching data with automatic refetching on auth state changes
 */
export const useAuthenticatedQuery = <TData = any>(
  queryKey: any[],
  url: string,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) => {
  const { isAuthenticated, user } = useAuth();

  return useQuery<TData>({
    queryKey: [...queryKey, user?._id], // Include user ID to refetch when user changes
    queryFn: async () => {
      const response: AxiosResponse<TData> = await apiClient.get(url);
      return response.data;
    },
    enabled: isAuthenticated && options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook for invalidating queries when authentication state changes
 */
export const useInvalidateOnAuth = (queryKeys: string[][]) => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { invalidateQueries };
};

/**
 * Hook for prefetching authenticated data
 */
export const usePrefetchAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const prefetchQuery = async <TData = any>(
    queryKey: any[],
    url: string,
    options?: { staleTime?: number }
  ) => {
    if (!isAuthenticated) return;

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response: AxiosResponse<TData> = await apiClient.get(url);
        return response.data;
      },
      staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
    });
  };

  return { prefetchQuery };
};
