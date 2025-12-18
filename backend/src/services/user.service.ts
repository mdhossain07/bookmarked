import mongoose from "mongoose";
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserDocument,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { UserModel, UserDoc } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { ApiError } from "../middleware/error.middleware.js";

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    return user.toSafeObject();
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    // Update basic profile fields
    if (data.firstName !== undefined) {
      user.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      user.lastName = data.lastName;
    }

    // Update preferences if provided
    if (data.preferences) {
      // Only update provided preference fields
      if (data.preferences.defaultView !== undefined) {
        user.preferences.defaultView = data.preferences.defaultView;
      }
      if (data.preferences.itemsPerPage !== undefined) {
        user.preferences.itemsPerPage = data.preferences.itemsPerPage;
      }
      if (data.preferences.theme !== undefined) {
        user.preferences.theme = data.preferences.theme;
      }
      if (data.preferences.language !== undefined) {
        user.preferences.language = data.preferences.language;
      }
      if (data.preferences.timezone !== undefined) {
        user.preferences.timezone = data.preferences.timezone;
      }
    }

    await user.save();
    return user.toSafeObject();
  }

  /**
   * Change user password
   */
  async changeUserPassword(
    userId: string,
    data: ChangePasswordRequest
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = data;

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw new ApiError(
        "New password and confirmation do not match",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Find user with password field
    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new ApiError(
        "Current password is incorrect",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    await user.save();
  }

  /**
   * Get user by email (for internal use)
   */
  async getUserByEmail(email: string): Promise<UserDoc | null> {
    return UserModel.findByEmail(email);
  }

  /**
   * Get user by ID (for internal use)
   */
  async getUserById(userId: string): Promise<UserDoc | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return UserModel.findById(userId);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    user.isActive = false;
    await user.save();
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    user.isActive = true;
    await user.save();
  }
}

// Export singleton instance
export const userService = new UserService();
