import { Router } from "express";
import { RegisterSchema, LoginSchema } from "bookmarked-types";
import { validate } from "../utils/validation";
import { authenticate } from "../middleware/auth.middleware";
import {
  register,
  login,
  getProfile,
  logout,
  refreshToken,
} from "../controllers/auth.controller";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post("/register", validate({ body: RegisterSchema }), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post("/login", validate({ body: LoginSchema }), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 */
router.get("/profile", authenticate, getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
router.post("/logout", authenticate, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 */
router.post("/refresh", authenticate, refreshToken);

export default router;
