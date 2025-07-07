import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { config } from "../config/environment";
import type { TokenPayload } from "bookmarked-types";

// Cookie configuration
export const COOKIE_CONFIG = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  OPTIONS: {
    httpOnly: true,
    secure: config.app.isProduction, // Only use secure cookies in production
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    path: "/",
  },
  REFRESH_OPTIONS: {
    httpOnly: true,
    secure: config.app.isProduction,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/api/auth/refresh",
  },
} as const;

/**
 * Generate JWT token for user
 */
export const generateToken = (
  payload: Omit<TokenPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Token verification failed");
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
};

/**
 * Extract token from cookies
 */
export const extractTokenFromCookies = (
  cookies: Record<string, string>
): string | null => {
  return cookies[COOKIE_CONFIG.ACCESS_TOKEN] || null;
};

/**
 * Extract token from request (tries cookies first, then Authorization header)
 */
export const extractTokenFromRequest = (req: Request): string | null => {
  // Try cookies first (preferred method)
  const tokenFromCookie = extractTokenFromCookies(req.cookies || {});
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Fallback to Authorization header for backward compatibility
  return extractTokenFromHeader(req.headers.authorization);
};

/**
 * Set authentication cookies in response
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken?: string
): void => {
  // Set access token cookie
  res.cookie(COOKIE_CONFIG.ACCESS_TOKEN, accessToken, COOKIE_CONFIG.OPTIONS);

  // Set refresh token cookie if provided
  if (refreshToken) {
    res.cookie(
      COOKIE_CONFIG.REFRESH_TOKEN,
      refreshToken,
      COOKIE_CONFIG.REFRESH_OPTIONS
    );
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN, {
    path: COOKIE_CONFIG.OPTIONS.path,
    httpOnly: true,
    secure: config.app.isProduction,
    sameSite: "lax",
  });

  res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN, {
    path: COOKIE_CONFIG.REFRESH_OPTIONS.path,
    httpOnly: true,
    secure: config.app.isProduction,
    sameSite: "lax",
  });
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};
