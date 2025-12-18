import {
  RegisterRequest,
  LoginRequest,
  UserDocument,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { UserModel } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../middleware/error.middleware.js";

export interface AuthResult {
  user: UserDocument;
  token: string;
  expiresIn: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async registerUser(data: RegisterRequest): Promise<AuthResult> {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(
        "User already exists with this email",
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE_RESOURCE
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new UserModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toSafeObject(),
      token,
      expiresIn: "24h",
    };
  }

  /**
   * Authenticate user login
   */
  async loginUser(data: LoginRequest): Promise<AuthResult> {
    const { email, password } = data;

    // Find user with password field
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      throw new ApiError(
        "Invalid email or password",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(
        "Account is deactivated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(
        "Invalid email or password",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toSafeObject(),
      token,
      expiresIn: "24h",
    };
  }
}

export const authService = new AuthService();
