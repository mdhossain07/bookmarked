import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// API base configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Request interceptor - no need to add auth token for HTTP-only cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // With HTTP-only cookies, the browser automatically includes the authentication cookie
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified for HTTP-only cookies
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // With HTTP-only cookies, we don't handle automatic token refresh in axios
    // The AuthContext will handle authentication state based on API responses
    // Just pass through all errors to let the calling code handle them
    return Promise.reject(error);
  }
);
