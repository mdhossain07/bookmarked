import "server-only";
import {
  ErrorCodes,
  HttpStatus,
  type BookQueryRequest,
  type BookStats,
  type CreateBookRequest,
  type UpdateBookRequest,
} from "@/shared";
import { ApiError } from "../http/errors";
import { containsText } from "../http/validate";
import { BookModel } from "../models/Book";
import { countBy, dateRange, duplicateFilter, findPage, numberRange, oneOrMany } from "./media";

const duplicateError = () =>
  new ApiError(
    "Book with this title and author already exists in your collection",
    HttpStatus.CONFLICT,
    ErrorCodes.DUPLICATE_RESOURCE
  );

const notFoundError = () => new ApiError("Book not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);

export async function createBook(userId: string, data: CreateBookRequest) {
  if (await BookModel.exists(duplicateFilter(userId, data.title, "author", data.author))) {
    throw duplicateError();
  }
  const book = await BookModel.create({ userId, ...data });
  return book.toSafeObject();
}

export async function getBook(userId: string, bookId: string) {
  const book = await BookModel.findOne({ _id: bookId, userId });
  if (!book) throw notFoundError();
  return book.toSafeObject();
}

export async function listBooks(userId: string, query: BookQueryRequest) {
  const { status, genres, author, minRating, maxRating, completedFrom, completedTo, search } = query;
  const filter: Record<string, unknown> = { userId };

  if (status) filter.status = oneOrMany(status);
  if (genres) filter.genres = { $in: Array.isArray(genres) ? genres : [genres] };
  if (author) filter.author = containsText(author);
  const rating = numberRange(minRating, maxRating);
  if (rating) filter.rating = rating;
  const completedOn = dateRange(completedFrom, completedTo);
  if (completedOn) filter.completedOn = completedOn;
  if (search) {
    const pattern = containsText(search);
    filter.$or = [{ title: pattern }, { author: pattern }, { review: pattern }, { genres: pattern }];
  }

  const { items, pagination } = await findPage(BookModel, filter, query);
  return { books: items, pagination };
}

export async function updateBook(userId: string, bookId: string, data: UpdateBookRequest) {
  const book = await BookModel.findOne({ _id: bookId, userId });
  if (!book) throw notFoundError();

  if (data.title !== undefined || data.author !== undefined) {
    const filter = duplicateFilter(userId, data.title ?? book.title, "author", data.author ?? book.author, bookId);
    if (await BookModel.exists(filter)) throw duplicateError();
  }

  Object.assign(book, data);
  await book.save();
  return book.toSafeObject();
}

export async function deleteBook(userId: string, bookId: string): Promise<void> {
  const { deletedCount } = await BookModel.deleteOne({ _id: bookId, userId });
  if (deletedCount === 0) throw notFoundError();
}

export async function getBookStats(userId: string): Promise<BookStats> {
  const [basic, byGenre] = await Promise.all([
    BookModel.getBookStats(userId),
    countBy(BookModel, userId, "genres", { unwind: true }),
  ]);

  return {
    total: basic.total || 0,
    byStatus: {
      read: basic.readCount || 0,
      reading: basic.readingCount || 0,
      "will read": basic.willReadCount || 0,
    },
    byGenre,
    averageRating: basic.averageRating ? Math.round(basic.averageRating * 10) / 10 : 0,
    recentlyCompleted: basic.recentlyCompleted || 0,
  };
}
