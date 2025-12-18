import { Request, Response } from "express";
import {
  CreateBookRequest,
  UpdateBookRequest,
  BookQueryRequest,
  BookIdParam,
  BulkUpdateBookStatusRequest,
  BatchAddBooksRequest,
  ApiResponse,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { bookService } from "../services/book.service.js";
import { ApiError, asyncHandler } from "../middleware/error.middleware.js";

/**
 * Create a new book
 */
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const data: CreateBookRequest = req.body;
  const book = await bookService.createBook(req.user.userId, data);

  const response: ApiResponse = {
    success: true,
    message: "Book created successfully",
    data: {
      book,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.CREATED).json(response);
});

/**
 * Get all books for the authenticated user
 */
export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const query: BookQueryRequest = req.query as any;
  const result = await bookService.getBooks(req.user.userId, query);

  const response: ApiResponse = {
    success: true,
    message: "Books retrieved successfully",
    data: {
      books: result.books,
      pagination: result.pagination,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Get a specific book by ID
 */
export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: BookIdParam = req.params as any;
  const book = await bookService.getBookById(req.user.userId, id);

  const response: ApiResponse = {
    success: true,
    message: "Book retrieved successfully",
    data: {
      book,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Update a book
 */
export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: BookIdParam = req.params as any;
  const data: UpdateBookRequest = req.body;
  const book = await bookService.updateBook(req.user.userId, id, data);

  const response: ApiResponse = {
    success: true,
    message: "Book updated successfully",
    data: {
      book,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Delete a book
 */
export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const { id }: BookIdParam = req.params as any;
  await bookService.deleteBook(req.user.userId, id);

  const response: ApiResponse = {
    success: true,
    message: "Book deleted successfully",
    data: {},
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Get book statistics
 */
export const getBookStats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const stats = await bookService.getBookStats(req.user.userId);

    const response: ApiResponse = {
      success: true,
      message: "Book statistics retrieved successfully",
      data: {
        stats,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Bulk update book status
 */
export const bulkUpdateBookStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { bookIds, status }: BulkUpdateBookStatusRequest = req.body;
    const result = await bookService.bulkUpdateBookStatus(
      req.user.userId,
      bookIds,
      status
    );

    const response: ApiResponse = {
      success: true,
      message: `Bulk status update completed. ${result.updated} books updated, ${result.failed} failed.`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Get books by status
 */
export const getBooksByStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { status } = req.params;
    const query: BookQueryRequest = { ...req.query, status } as any;
    const result = await bookService.getBooks(req.user.userId, query);

    const response: ApiResponse = {
      success: true,
      message: `Books with status '${status}' retrieved successfully`,
      data: {
        books: result.books,
        pagination: result.pagination,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Search books
 */
export const searchBooks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.AUTHENTICATION_ERROR
    );
  }

  const query: BookQueryRequest = req.query as any;
  const result = await bookService.getBooks(req.user.userId, query);

  const response: ApiResponse = {
    success: true,
    message: "Book search completed successfully",
    data: {
      books: result.books,
      pagination: result.pagination,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Batch add books
 */
export const batchAddBooks = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { books }: BatchAddBooksRequest = req.body;
    const result = await bookService.batchAddBooks(req.user.userId, books);

    const response: ApiResponse = {
      success: true,
      message: `Batch add completed. ${result.added} books added, ${result.duplicates} duplicates skipped, ${result.failed} failed.`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.CREATED).json(response);
  }
);

/**
 * Check for duplicate books
 */
export const checkDuplicateBooks = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.AUTHENTICATION_ERROR
      );
    }

    const { books }: BatchAddBooksRequest = req.body;
    const duplicates = await bookService.checkDuplicateBooks(
      req.user.userId,
      books
    );

    const response: ApiResponse = {
      success: true,
      message: "Duplicate check completed",
      data: {
        duplicates,
        count: duplicates.length,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
);
