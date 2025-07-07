import { Request, Response, NextFunction } from "express";
import {
  ApiResponse,
  ErrorCodes,
  HttpStatus,
  TokenPayload,
} from "bookmarked-types";
import { verifyToken, extractTokenFromRequest } from "../utils/jwt";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: "Access token required",
        error: {
          code: ErrorCodes.AUTHENTICATION_ERROR,
          message: "No access token provided",
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    return next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Invalid or expired token",
      error: {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        message:
          error instanceof Error ? error.message : "Token verification failed",
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.UNAUTHORIZED).json(response);
  }
};

/**
 * Authorization middleware factory
 * Checks if authenticated user has required permissions
 */
export const authorize = (requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: "Authentication required",
        error: {
          code: ErrorCodes.AUTHENTICATION_ERROR,
          message: "User not authenticated",
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }

    // For now, we don't have role-based access control
    // This is a placeholder for future implementation
    if (requiredRoles.length > 0) {
      // TODO: Implement role checking when user roles are added
      console.log("Role checking not implemented yet:", requiredRoles);
    }

    return next();
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (userIdField: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: "Authentication required",
        error: {
          code: ErrorCodes.AUTHENTICATION_ERROR,
          message: "User not authenticated",
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }

    // Check if the resource belongs to the authenticated user
    const resourceUserId =
      req.params[userIdField] ||
      req.body[userIdField] ||
      req.query[userIdField];

    if (resourceUserId && resourceUserId !== req.user.userId) {
      const response: ApiResponse = {
        success: false,
        message: "Access denied",
        error: {
          code: ErrorCodes.AUTHORIZATION_ERROR,
          message: "You can only access your own resources",
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.FORBIDDEN).json(response);
    }

    return next();
  };
};
