import { Request, Response } from "express";
import {
  CreateMovieRequest,
  UpdateMovieRequest,
  MovieQueryRequest,
  MovieIdParam,
  BulkUpdateMovieStatusRequest,
  ApiResponse,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { movieService } from "../services/movie.service";
import { ApiError, asyncHandler } from "../middleware/error.middleware";

/**
 * Create a new movie
 */
export const createMovie = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const data: CreateMovieRequest = req.body;
  const movie = await movieService.createMovie(req.user.userId, data);

  const response: ApiResponse = {
    success: true,
    message: "Movie created successfully",
    data: {
      movie,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
});

/**
 * Get all movies for the authenticated user
 */
export const getMovies = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const query: MovieQueryRequest = req.query as any;
  const result = await movieService.getMovies(req.user.userId, query);

  const response: ApiResponse = {
    success: true,
    message: "Movies retrieved successfully",
    data: {
      movies: result.movies,
      pagination: result.pagination,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Get a specific movie by ID
 */
export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: MovieIdParam = req.params as any;
  const movie = await movieService.getMovieById(req.user.userId, id);

  const response: ApiResponse = {
    success: true,
    message: "Movie retrieved successfully",
    data: {
      movie,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Update a movie
 */
export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: MovieIdParam = req.params as any;
  const data: UpdateMovieRequest = req.body;
  const movie = await movieService.updateMovie(req.user.userId, id, data);

  const response: ApiResponse = {
    success: true,
    message: "Movie updated successfully",
    data: {
      movie,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Delete a movie
 */
export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: MovieIdParam = req.params as any;
  await movieService.deleteMovie(req.user.userId, id);

  const response: ApiResponse = {
    success: true,
    message: "Movie deleted successfully",
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Get movie statistics for the authenticated user
 */
export const getMovieStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const stats = await movieService.getMovieStats(req.user.userId);

  const response: ApiResponse = {
    success: true,
    message: "Movie statistics retrieved successfully",
    data: {
      stats,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Bulk update movie status
 */
export const bulkUpdateMovieStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const data: BulkUpdateMovieStatusRequest = req.body;
    const result = await movieService.bulkUpdateStatus(req.user.userId, data);

    const response: ApiResponse = {
      success: true,
      message: `Bulk update completed. ${result.updated} movies updated, ${result.failed} failed.`,
      data: {
        updated: result.updated,
        failed: result.failed,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Get movies by status
 */
export const getMoviesByStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { status } = req.params;
    const query: MovieQueryRequest = { ...req.query, status } as any;
    const result = await movieService.getMovies(req.user.userId, query);

    const response: ApiResponse = {
      success: true,
      message: `Movies with status '${status}' retrieved successfully`,
      data: {
        movies: result.movies,
        pagination: result.pagination,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Get movies by industry
 */
export const getMoviesByIndustry = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { industry } = req.params;
    const query: MovieQueryRequest = { ...req.query, industry } as any;
    const result = await movieService.getMovies(req.user.userId, query);

    const response: ApiResponse = {
      success: true,
      message: `Movies from ${industry} industry retrieved successfully`,
      data: {
        movies: result.movies,
        pagination: result.pagination,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Search movies
 */
export const searchMovies = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { q: search } = req.query;
  if (!search || typeof search !== 'string') {
    throw new ApiError(
      "Search query is required",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const query: MovieQueryRequest = { ...req.query, search } as any;
  const result = await movieService.getMovies(req.user.userId, query);

  const response: ApiResponse = {
    success: true,
    message: `Search results for '${search}' retrieved successfully`,
    data: {
      movies: result.movies,
      pagination: result.pagination,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});
