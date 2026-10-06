import "server-only";
import {
  ErrorCodes,
  HttpStatus,
  type CreateMovieRequest,
  type MovieQueryRequest,
  type MovieStats,
  type UpdateMovieRequest,
} from "@/shared";
import { ApiError } from "../http/errors";
import { containsText } from "../http/validate";
import { MovieModel } from "../models/Movie";
import { countBy, dateRange, duplicateFilter, findPage, numberRange, oneOrMany } from "./media";

const duplicateError = () =>
  new ApiError(
    "Movie with this title and director already exists in your collection",
    HttpStatus.CONFLICT,
    ErrorCodes.DUPLICATE_RESOURCE
  );

const notFoundError = () => new ApiError("Movie not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);

export async function createMovie(userId: string, data: CreateMovieRequest) {
  if (await MovieModel.exists(duplicateFilter(userId, data.title, "director", data.director))) {
    throw duplicateError();
  }
  const movie = await MovieModel.create({ userId, ...data });
  return movie.toSafeObject();
}

export async function getMovie(userId: string, movieId: string) {
  const movie = await MovieModel.findOne({ _id: movieId, userId });
  if (!movie) throw notFoundError();
  return movie.toSafeObject();
}

export async function listMovies(userId: string, query: MovieQueryRequest) {
  const { industry, status, genres, director, minRating, maxRating, completedFrom, completedTo, search } = query;
  const filter: Record<string, unknown> = { userId };

  if (industry) filter.industry = oneOrMany(industry);
  if (status) filter.status = oneOrMany(status);
  if (genres) filter.genres = { $in: Array.isArray(genres) ? genres : [genres] };
  if (director) filter.director = containsText(director);
  const rating = numberRange(minRating, maxRating);
  if (rating) filter.rating = rating;
  const completedOn = dateRange(completedFrom, completedTo);
  if (completedOn) filter.completedOn = completedOn;
  if (search) {
    const pattern = containsText(search);
    filter.$or = [{ title: pattern }, { director: pattern }, { review: pattern }, { genres: pattern }];
  }

  const { items, pagination } = await findPage(MovieModel, filter, query);
  return { movies: items, pagination };
}

export async function updateMovie(userId: string, movieId: string, data: UpdateMovieRequest) {
  const movie = await MovieModel.findOne({ _id: movieId, userId });
  if (!movie) throw notFoundError();

  if (data.title !== undefined || data.director !== undefined) {
    const filter = duplicateFilter(
      userId,
      data.title ?? movie.title,
      "director",
      data.director ?? movie.director,
      movieId
    );
    if (await MovieModel.exists(filter)) throw duplicateError();
  }

  Object.assign(movie, data);
  await movie.save();
  return movie.toSafeObject();
}

export async function deleteMovie(userId: string, movieId: string): Promise<void> {
  const { deletedCount } = await MovieModel.deleteOne({ _id: movieId, userId });
  if (deletedCount === 0) throw notFoundError();
}

export async function getMovieStats(userId: string): Promise<MovieStats> {
  const [basic, industries, byGenre] = await Promise.all([
    MovieModel.getMovieStats(userId),
    countBy(MovieModel, userId, "industry"),
    countBy(MovieModel, userId, "genres", { unwind: true }),
  ]);

  return {
    total: basic.total,
    byStatus: {
      watched: basic.watchedCount,
      watching: basic.watchingCount,
      "to watch": basic.toWatchCount,
    },
    byIndustry: { Hollywood: 0, Bollywood: 0, Bangla: 0, "South Indian": 0, Foreign: 0, ...industries },
    byGenre,
    averageRating: basic.averageRating ? Math.round(basic.averageRating * 10) / 10 : 0,
    recentlyCompleted: basic.recentlyCompleted,
  };
}
