import "server-only";
import {
  ErrorCodes,
  HttpStatus,
  type ChangePasswordRequest,
  type UpdateProfileRequest,
} from "@/shared";
import { comparePassword, hashPassword } from "../auth/password";
import { ApiError } from "../http/errors";
import { UserModel, type UserDoc } from "../models/User";

export async function updateProfile(user: UserDoc, data: UpdateProfileRequest) {
  if (data.firstName !== undefined) user.firstName = data.firstName;
  if (data.lastName !== undefined) user.lastName = data.lastName;

  const preferences = data.preferences ?? {};
  for (const key of ["defaultView", "itemsPerPage", "theme", "language", "timezone"] as const) {
    if (preferences[key] !== undefined) user.set(`preferences.${key}`, preferences[key]);
  }

  await user.save();
  return user.toSafeObject();
}

export async function changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordRequest) {
  // requireUser() loads the user without the password field
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new ApiError("User not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new ApiError("Current password is incorrect", HttpStatus.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);
  }

  user.password = await hashPassword(newPassword);
  await user.save();
}

export async function deactivateUser(user: UserDoc): Promise<void> {
  user.isActive = false;
  await user.save();
}
