import mongoose from "mongoose";
import {
  CreateBookRequest,
  UpdateBookRequest,
  BookQueryRequest,
  BookStats,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { BookModel, BookDoc } from "../models/Book.js";
import { ApiError } from "../middleware/error.middleware.js";

// Type for book document with _id as string
type BookDocument = ReturnType<BookDoc["toSafeObject"]>;

export class BookService {
  /**
   * Create a new book
   */
  async createBook(
    userId: string,
    data: CreateBookRequest
  ): Promise<BookDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Check for duplicate book (same title and author for the same user)
    const existingBook = await BookModel.findOne({
      userId,
      title: { $regex: new RegExp(`^${data.title}$`, "i") },
      ...(data.author && {
        author: { $regex: new RegExp(`^${data.author}$`, "i") },
      }),
    });

    if (existingBook) {
      throw new ApiError(
        "Book with this title and author already exists in your collection",
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE_RESOURCE
      );
    }

    const book = new BookModel({
      userId,
      ...data,
    });

    await book.save();
    return book.toSafeObject();
  }

  /**
   * Get book by ID
   */
  async getBookById(userId: string, bookId: string): Promise<BookDocument> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const book = await BookModel.findOne({ _id: bookId, userId });
    if (!book) {
      throw new ApiError(
        "Book not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    return book.toSafeObject();
  }

  /**
   * Get books with filtering, sorting, and pagination
   */
  async getBooks(
    userId: string,
    query: BookQueryRequest
  ): Promise<{
    books: BookDocument[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      genres,
      author,
      minRating,
      maxRating,
      completedFrom,
      completedTo,
      search,
    } = query;

    // Build filter object
    const filter: any = { userId };

    // Status filter
    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Genres filter
    if (genres) {
      filter.genres = Array.isArray(genres)
        ? { $in: genres }
        : { $in: [genres] };
    }

    // Author filter
    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }

    // Rating range filter
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = minRating;
      if (maxRating) filter.rating.$lte = maxRating;
    }

    // Completed date range filter
    if (completedFrom || completedTo) {
      filter.completedOn = {};
      if (completedFrom) filter.completedOn.$gte = new Date(completedFrom);
      if (completedTo) filter.completedOn.$lte = new Date(completedTo);
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { review: searchRegex },
        { genres: searchRegex },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [books, total] = await Promise.all([
      BookModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      BookModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      books: books.map((book) => ({ ...book, _id: book._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update a book
   */
  async updateBook(
    userId: string,
    bookId: string,
    data: UpdateBookRequest
  ): Promise<BookDocument> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const book = await BookModel.findOne({ _id: bookId, userId });
    if (!book) {
      throw new ApiError(
        "Book not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    // Update fields
    Object.assign(book, data);

    await book.save();
    return book.toSafeObject();
  }

  /**
   * Delete a book
   */
  async deleteBook(userId: string, bookId: string): Promise<void> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const result = await BookModel.deleteOne({ _id: bookId, userId });
    if (result.deletedCount === 0) {
      throw new ApiError(
        "Book not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }
  }

  /**
   * Bulk update book status
   */
  async bulkUpdateBookStatus(
    userId: string,
    bookIds: string[],
    status: string
  ): Promise<{ updated: number; failed: number; errors?: string[] }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Validate all book IDs
    const invalidIds = bookIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      throw new ApiError(
        `Invalid book ID format: ${invalidIds.join(", ")}`,
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Update books
    const result = await BookModel.updateMany(
      { _id: { $in: bookIds }, userId },
      { $set: { status } }
    );

    return {
      updated: result.modifiedCount,
      failed: bookIds.length - result.modifiedCount,
    };
  }

  /**
   * Get book statistics for a user
   */
  async getBookStats(userId: string): Promise<BookStats> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const [basicStats, genreStats] = await Promise.all([
      BookModel.getBookStats(userId),
      this.getGenreStats(userId),
    ]);

    return {
      total: basicStats.total || 0,
      byStatus: {
        read: basicStats.readCount || 0,
        reading: basicStats.readingCount || 0,
        "will read": basicStats.willReadCount || 0,
      },
      byGenre: genreStats,
      averageRating: basicStats.averageRating
        ? Math.round(basicStats.averageRating * 10) / 10
        : 0,
      recentlyCompleted: basicStats.recentlyCompleted || 0,
    };
  }

  /**
   * Batch add books with duplicate detection
   */
  async batchAddBooks(
    userId: string,
    books: CreateBookRequest[]
  ): Promise<{
    added: number;
    failed: number;
    duplicates: number;
    errors: string[];
    books: BookDocument[];
  }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const results = {
      added: 0,
      failed: 0,
      duplicates: 0,
      errors: [] as string[],
      books: [] as BookDocument[],
    };

    for (const bookData of books) {
      try {
        // Check for duplicate
        const existingBook = await BookModel.findOne({
          userId,
          title: {
            $regex: new RegExp(
              `^${bookData.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
          ...(bookData.author && {
            author: {
              $regex: new RegExp(
                `^${bookData.author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i"
              ),
            },
          }),
        });

        if (existingBook) {
          results.duplicates++;
          results.errors.push(
            `Duplicate book: "${bookData.title}" by ${
              bookData.author || "Unknown Author"
            }`
          );
          continue;
        }

        // Create new book
        const book = new BookModel({
          userId,
          ...bookData,
        });

        await book.save();
        results.books.push(book.toSafeObject());
        results.added++;
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push(
          `Failed to add "${bookData.title}": ${errorMessage}`
        );
      }
    }

    return results;
  }

  /**
   * Check for duplicate books
   */
  async checkDuplicateBooks(
    userId: string,
    books: CreateBookRequest[]
  ): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const duplicates: string[] = [];

    for (const bookData of books) {
      const existingBook = await BookModel.findOne({
        userId,
        title: {
          $regex: new RegExp(
            `^${bookData.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        },
        ...(bookData.author && {
          author: {
            $regex: new RegExp(
              `^${bookData.author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        }),
      });

      if (existingBook) {
        duplicates.push(
          `"${bookData.title}" by ${bookData.author || "Unknown Author"}`
        );
      }
    }

    return duplicates;
  }

  /**
   * Get genre statistics for a user
   */
  private async getGenreStats(userId: string): Promise<Record<string, number>> {
    const genreStats = await BookModel.aggregate([
      { $match: { userId } },
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return genreStats.reduce(
      (acc: Record<string, number>, curr: { _id: string; count: number }) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {}
    );
  }
}

// Export singleton instance
export const bookService = new BookService();
