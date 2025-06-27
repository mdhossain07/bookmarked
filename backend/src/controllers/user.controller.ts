import { Request, Response } from "express";
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { userService } from "../services/user.service";
import { ApiError, asyncHandler } from "../middleware/error.middleware";

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const data: UpdateProfileRequest = req.body;
    const updatedUser = await userService.updateUserProfile(
      req.user.userId,
      data
    );

    const response: ApiResponse = {
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Change user password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const data: ChangePasswordRequest = req.body;
    await userService.changeUserPassword(req.user.userId, data);

    const response: ApiResponse = {
      success: true,
      message: "Password changed successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Deactivate user account
 */
export const deactivateAccount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    await userService.deactivateUser(req.user.userId);

    const response: ApiResponse = {
      success: true,
      message: "Account deactivated successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);
