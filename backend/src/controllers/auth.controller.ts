import { Request, Response } from "express";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { ApiError, asyncHandler } from "../middleware/error.middleware";

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data: RegisterRequest = req.body;

  const result = await authService.registerUser(data);

  const response: AuthResponse = {
    success: true,
    message: "User registered successfully",
    data: result,
  };

  res.status(HttpStatus.CREATED).json(response);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data: LoginRequest = req.body;

  const result = await authService.loginUser(data);

  const response: AuthResponse = {
    success: true,
    message: "Login successful",
    data: result,
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const user = await userService.getUserProfile(req.user.userId);

  const response: ApiResponse = {
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Logout user (placeholder - token invalidation would be handled client-side or with Redis)
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // In a production app, you might want to:
  // 1. Add token to a blacklist in Redis
  // 2. Clear any server-side sessions
  // For now, we'll just return a success response

  const response: ApiResponse = {
    success: true,
    message: "Logout successful",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Refresh token (placeholder)
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    // Generate new token
    const token = generateToken({
      userId: req.user.userId,
      email: req.user.email,
    });

    const response: ApiResponse = {
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
        expiresIn: "24h",
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);
