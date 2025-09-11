import { Router } from "express";
import { z } from "zod";
import {
  CreateBookSchema,
  UpdateBookSchema,
  BookQuerySchema,
  BookIdParamSchema,
  BulkUpdateBookStatusSchema,
  BookStatusSchema,
} from "bookmarked-types";
import { validate } from "../utils/validation";
import { authenticate } from "../middleware/auth.middleware";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBookStats,
  bulkUpdateBookStatus,
  getBooksByStatus,
  searchBooks,
} from "../controllers/book.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/books
 * @desc    Create a new book
 * @access  Private
 */
router.post("/", validate({ body: CreateBookSchema }), createBook);

/**
 * @route   GET /api/books
 * @desc    Get all books for the authenticated user with filtering and pagination
 * @access  Private
 */
router.get("/", validate({ query: BookQuerySchema }), getBooks);

/**
 * @route   GET /api/books/stats
 * @desc    Get book statistics for the authenticated user
 * @access  Private
 */
router.get("/stats", getBookStats);

/**
 * @route   GET /api/books/search
 * @desc    Search books
 * @access  Private
 */
router.get("/search", validate({ query: BookQuerySchema }), searchBooks);

/**
 * @route   POST /api/books/bulk-update-status
 * @desc    Bulk update book status
 * @access  Private
 */
router.post(
  "/bulk-update-status",
  validate({ body: BulkUpdateBookStatusSchema }),
  bulkUpdateBookStatus
);

/**
 * @route   GET /api/books/status/:status
 * @desc    Get books by status
 * @access  Private
 */
router.get(
  "/status/:status",
  validate({
    params: z.object({ status: BookStatusSchema }),
    query: BookQuerySchema,
  }),
  getBooksByStatus
);

/**
 * @route   GET /api/books/:id
 * @desc    Get a specific book by ID
 * @access  Private
 */
router.get("/:id", validate({ params: BookIdParamSchema }), getBookById);

/**
 * @route   PUT /api/books/:id
 * @desc    Update a book
 * @access  Private
 */
router.put(
  "/:id",
  validate({
    params: BookIdParamSchema,
    body: UpdateBookSchema,
  }),
  updateBook
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Private
 */
router.delete("/:id", validate({ params: BookIdParamSchema }), deleteBook);

export default router;
