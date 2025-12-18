import { Router } from "express";
import { z } from "zod";
import {
  CreateMovieSchema,
  UpdateMovieSchema,
  MovieQuerySchema,
  MovieIdParamSchema,
  BulkUpdateMovieStatusSchema,
  BatchAddMoviesSchema,
  MovieIndustrySchema,
  MovieStatusSchema,
} from "bookmarked-types";
import { validate } from "../utils/validation.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  getMovieStats,
  bulkUpdateMovieStatus,
  getMoviesByStatus,
  getMoviesByIndustry,
  searchMovies,
  batchAddMovies,
  checkDuplicateMovies,
} from "../controllers/movie.controller.js";

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 * @access  Private
 */
router.post("/", validate({ body: CreateMovieSchema }), createMovie);

/**
 * @route   GET /api/movies
 * @desc    Get all movies for the authenticated user with filtering and pagination
 * @access  Private
 */
router.get("/", validate({ query: MovieQuerySchema }), getMovies);

/**
 * @route   GET /api/movies/stats
 * @desc    Get movie statistics for the authenticated user
 * @access  Private
 */
router.get("/stats", getMovieStats);

/**
 * @route   GET /api/movies/search
 * @desc    Search movies
 * @access  Private
 */
router.get("/search", validate({ query: MovieQuerySchema }), searchMovies);

/**
 * @route   POST /api/movies/bulk-update-status
 * @desc    Bulk update movie status
 * @access  Private
 */
router.post(
  "/bulk-update-status",
  validate({ body: BulkUpdateMovieStatusSchema }),
  bulkUpdateMovieStatus
);

/**
 * @route   POST /api/movies/batch-add
 * @desc    Batch add movies
 * @access  Private
 */
router.post(
  "/batch-add",
  validate({ body: BatchAddMoviesSchema }),
  batchAddMovies
);

/**
 * @route   POST /api/movies/check-duplicates
 * @desc    Check for duplicate movies
 * @access  Private
 */
router.post(
  "/check-duplicates",
  validate({ body: BatchAddMoviesSchema }),
  checkDuplicateMovies
);

/**
 * @route   GET /api/movies/status/:status
 * @desc    Get movies by status
 * @access  Private
 */
router.get(
  "/status/:status",
  validate({
    params: z.object({ status: MovieStatusSchema }),
    query: MovieQuerySchema,
  }),
  getMoviesByStatus
);

/**
 * @route   GET /api/movies/industry/:industry
 * @desc    Get movies by industry
 * @access  Private
 */
router.get(
  "/industry/:industry",
  validate({
    params: z.object({ industry: MovieIndustrySchema }),
    query: MovieQuerySchema,
  }),
  getMoviesByIndustry
);

/**
 * @route   GET /api/movies/:id
 * @desc    Get a specific movie by ID
 * @access  Private
 */
router.get("/:id", validate({ params: MovieIdParamSchema }), getMovieById);

/**
 * @route   PUT /api/movies/:id
 * @desc    Update a movie
 * @access  Private
 */
router.put(
  "/:id",
  validate({
    params: MovieIdParamSchema,
    body: UpdateMovieSchema,
  }),
  updateMovie
);

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie
 * @access  Private
 */
router.delete("/:id", validate({ params: MovieIdParamSchema }), deleteMovie);

export default router;
