import { Router } from "express";
import { UpdateProfileSchema, ChangePasswordSchema } from "bookmarked-types";
import { validate } from "../utils/validation";
import { authenticate } from "../middleware/auth.middleware";
import {
  updateProfile,
  changePassword,
  deactivateAccount,
} from "../controllers/user.controller";

const router = Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 */
router.put(
  "/update-profile",
  authenticate,
  validate({ body: UpdateProfileSchema }),
  updateProfile
);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 */
router.post(
  "/change-password",
  authenticate,
  validate({ body: ChangePasswordSchema }),
  changePassword
);

/**
 * @route   POST /api/users/deactivate
 * @desc    Deactivate user account
 */
router.post("/deactivate", authenticate, deactivateAccount);

export default router;
