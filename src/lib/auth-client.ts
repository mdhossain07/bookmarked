import type {
  ApiResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserDocument,
} from "@/shared";
import { apiClient } from "./api";

type UserResponse = ApiResponse<{ user: UserDocument }>;

export async function login(data: LoginRequest): Promise<UserDocument> {
  const response = await apiClient.post<UserResponse>("/auth/login", data);
  return response.data.data!.user;
}

export async function register(data: RegisterRequest): Promise<UserDocument> {
  const response = await apiClient.post<UserResponse>("/auth/register", data);
  return response.data.data!.user;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getProfile(): Promise<UserDocument> {
  const response = await apiClient.get<UserResponse>("/auth/profile");
  return response.data.data!.user;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserDocument> {
  const response = await apiClient.put<UserResponse>("/users/update-profile", data);
  return response.data.data!.user;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post("/users/change-password", data);
}
