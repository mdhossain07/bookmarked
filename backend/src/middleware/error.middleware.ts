import { Request, Response, NextFunction } from "express";
import { ApiResponse, ErrorCodes, HttpStatus } from "bookmarked-types";
import { config } from "../config/environment.js";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details || {};

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApiError);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let details: Record<string, any> | undefined;

  // Handle different types of errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    errorCode = error.code as ErrorCodes;
    message = error.message;
    details = error.details;
  } else if (error.name === "ValidationError") {
    // Mongoose validation error
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = "Validation failed";
    details = { errors: error.message };
  } else if (error.name === "CastError") {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = "Invalid data format";
  } else if (error.name === "MongoServerError") {
    // MongoDB server errors
    const mongoError = error as any;
    if (mongoError.code === 11000) {
      // Duplicate key error
      statusCode = HttpStatus.CONFLICT;
      errorCode = ErrorCodes.DUPLICATE_RESOURCE;
      message = "Resource already exists";
      details = { duplicateField: Object.keys(mongoError.keyPattern)[0] };
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ErrorCodes.DATABASE_ERROR;
      message = "Database operation failed";
    }
  } else if (error.name === "JsonWebTokenError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCodes.AUTHENTICATION_ERROR;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCodes.AUTHENTICATION_ERROR;
    message = "Token expired";
  }

  // Log error in development
  if (config.app.isDevelopment) {
    console.error("❌ Error:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  // Create error response
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      message,
      details: details || {},
    },
    timestamp: new Date().toISOString(),
  };

  // Add stack trace in development
  if (config.app.isDevelopment && error.stack) {
    response.error!.details = {
      ...details,
      stack: error.stack,
    };
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: "The requested resource was not found",
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.NOT_FOUND).json(response);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
