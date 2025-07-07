import { Request, Response } from "express";
import {
  RegisterRequest,
  LoginRequest,
  ApiResponse,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { generateToken, setAuthCookies, clearAuthCookies } from "../utils/jwt";
import { ApiError, asyncHandler } from "../middleware/error.middleware";

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data: RegisterRequest = req.body;

  const result = await authService.registerUser(data);

  // Set HTTP-only cookies for authentication
  setAuthCookies(res, result.token);

  // Return user data without token (token is now in HTTP-only cookie)
  const response: ApiResponse = {
    success: true,
    message: "User registered successfully",
    data: {
      user: result.user,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data: LoginRequest = req.body;

  const result = await authService.loginUser(data);

  // Set HTTP-only cookies for authentication
  setAuthCookies(res, result.token);

  // Return user data without token (token is now in HTTP-only cookie)
  const response: ApiResponse = {
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
    },
    timestamp: new Date().toISOString(),
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
 * Logout user - clears HTTP-only cookies
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Clear authentication cookies
  clearAuthCookies(res);

  const response: ApiResponse = {
    success: true,
    message: "Logout successful",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Refresh token - generates new token and sets it in HTTP-only cookie
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

    // Set new token in HTTP-only cookie
    setAuthCookies(res, token);

    const response: ApiResponse = {
      success: true,
      message: "Token refreshed successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);
