import { apiClient } from "@/lib/api";
import type {
  LoginRequest,
  RegisterRequest,
  ProfileResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "bookmarked-types";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<any> {
    try {
      const response = await apiClient.post("/auth/register", data);
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Login user - tokens are automatically set in HTTP-only cookies by backend
   */
  static async login(data: LoginRequest): Promise<any> {
    try {
      const response = await apiClient.post("/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to clear HTTP-only cookies on server
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server, the cookies should still be cleared
      console.warn("Logout request failed:", error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<{ success: boolean }> {
    try {
      // With HTTP-only cookies, the refresh token is automatically sent
      const response = await apiClient.post("/auth/refresh");

      if (response.data.success) {
        // New token is automatically set in HTTP-only cookie by server
        return { success: true };
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>("/auth/profile");
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<ProfileResponse> {
    try {
      const response = await apiClient.put<ProfileResponse>(
        "/auth/profile",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post("/auth/change-password", data);
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle authentication errors consistently
   */
  private static handleAuthError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.response?.status === 401) {
      return new Error("Invalid credentials");
    }

    if (error.response?.status === 403) {
      return new Error("Access forbidden");
    }

    if (error.response?.status === 422) {
      return new Error("Validation failed");
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }
}

export default AuthService;
