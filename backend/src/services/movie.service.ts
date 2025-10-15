import mongoose from "mongoose";
import {
  CreateMovieRequest,
  UpdateMovieRequest,
  MovieQueryRequest,
  MovieDocument,
  MovieStats,
  BulkUpdateMovieStatusRequest,
  HttpStatus,
  ErrorCodes,
} from "bookmarked-types";
import { MovieModel } from "../models/Movie";
import { ApiError } from "../middleware/error.middleware";

export class MovieService {
  /**
   * Create a new movie
   */
  async createMovie(
    userId: string,
    data: CreateMovieRequest
  ): Promise<MovieDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Check for duplicate movie (same title and director for the same user)
    const existingMovie = await MovieModel.findOne({
      userId,
      title: { $regex: new RegExp(`^${data.title}$`, "i") },
      ...(data.director && {
        director: { $regex: new RegExp(`^${data.director}$`, "i") },
      }),
    });

    if (existingMovie) {
      throw new ApiError(
        "Movie with this title and director already exists in your collection",
        HttpStatus.CONFLICT,
        ErrorCodes.DUPLICATE_RESOURCE
      );
    }

    const movie = new MovieModel({
      userId,
      ...data,
    });

    await movie.save();
    return movie.toSafeObject();
  }

  /**
   * Get movie by ID
   */
  async getMovieById(userId: string, movieId: string): Promise<MovieDocument> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const movie = await MovieModel.findOne({ _id: movieId, userId });
    if (!movie) {
      throw new ApiError(
        "Movie not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    return movie.toSafeObject();
  }

  /**
   * Get movies with filtering, sorting, and pagination
   */
  async getMovies(
    userId: string,
    query: MovieQueryRequest
  ): Promise<{
    movies: MovieDocument[];
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
      industry,
      status,
      genres,
      director,
      minRating,
      maxRating,
      completedFrom,
      completedTo,
      search,
    } = query;

    // Build filter object
    const filter: any = { userId };

    // Industry filter
    if (industry) {
      filter.industry = Array.isArray(industry) ? { $in: industry } : industry;
    }

    // Status filter
    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Genres filter
    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : [genres];
      filter.genres = { $in: genreArray };
    }

    // Director filter
    if (director) {
      filter.director = { $regex: new RegExp(director, "i") };
    }

    // Rating filter
    if (minRating !== undefined || maxRating !== undefined) {
      filter.rating = {};
      if (minRating !== undefined) filter.rating.$gte = minRating;
      if (maxRating !== undefined) filter.rating.$lte = maxRating;
    }

    // Completed date filter
    if (completedFrom || completedTo) {
      filter.completedOn = {};
      if (completedFrom) filter.completedOn.$gte = new Date(completedFrom);
      if (completedTo) filter.completedOn.$lte = new Date(completedTo);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { director: { $regex: new RegExp(search, "i") } },
        { review: { $regex: new RegExp(search, "i") } },
        { genres: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [movies, total] = await Promise.all([
      MovieModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      MovieModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      movies: movies.map((movie) => ({ ...movie, _id: movie._id.toString() })),
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
   * Update movie
   */
  async updateMovie(
    userId: string,
    movieId: string,
    data: UpdateMovieRequest
  ): Promise<MovieDocument> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const movie = await MovieModel.findOne({ _id: movieId, userId });
    if (!movie) {
      throw new ApiError(
        "Movie not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    // Check for duplicate if title or director is being updated
    if (data.title || data.director) {
      const titleToCheck = data.title || movie.title;
      const directorToCheck = data.director || movie.director;

      const existingMovie = await MovieModel.findOne({
        _id: { $ne: movieId },
        userId,
        title: { $regex: new RegExp(`^${titleToCheck}$`, "i") },
        ...(directorToCheck && {
          director: { $regex: new RegExp(`^${directorToCheck}$`, "i") },
        }),
      });

      if (existingMovie) {
        throw new ApiError(
          "Movie with this title and director already exists in your collection",
          HttpStatus.CONFLICT,
          ErrorCodes.DUPLICATE_RESOURCE
        );
      }
    }

    // Update movie
    Object.assign(movie, data);
    await movie.save();

    return movie.toSafeObject();
  }

  /**
   * Delete movie
   */
  async deleteMovie(userId: string, movieId: string): Promise<void> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(movieId)
    ) {
      throw new ApiError(
        "Invalid ID format",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const result = await MovieModel.deleteOne({ _id: movieId, userId });
    if (result.deletedCount === 0) {
      throw new ApiError(
        "Movie not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }
  }

  /**
   * Get movie statistics for a user
   */
  async getMovieStats(userId: string): Promise<MovieStats> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const [basicStats, industryStats, genreStats] = await Promise.all([
      MovieModel.getMovieStats(userId),
      this.getIndustryStats(userId),
      this.getGenreStats(userId),
    ]);

    return {
      total: basicStats.total,
      byStatus: {
        watched: basicStats.watchedCount,
        watching: basicStats.watchingCount,
        "to watch": basicStats.toWatchCount,
      },
      byIndustry: industryStats,
      byGenre: genreStats,
      averageRating: basicStats.averageRating
        ? Math.round(basicStats.averageRating * 10) / 10
        : 0,
      recentlyCompleted: basicStats.recentlyCompleted,
    };
  }

  /**
   * Bulk update movie status
   */
  async bulkUpdateStatus(
    userId: string,
    data: BulkUpdateMovieStatusRequest
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const { movieIds, status, completedOn } = data;
    const errors: string[] = [];
    let updated = 0;
    let failed = 0;

    for (const movieId of movieIds) {
      try {
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
          errors.push(`Invalid movie ID: ${movieId}`);
          failed++;
          continue;
        }

        const updateData: any = { status };
        if (status === "watched" && completedOn) {
          updateData.completedOn = completedOn;
        } else if (status !== "watched") {
          updateData.completedOn = null;
        }

        const result = await MovieModel.updateOne(
          { _id: movieId, userId },
          updateData
        );

        if (result.matchedCount === 0) {
          errors.push(`Movie not found: ${movieId}`);
          failed++;
        } else {
          updated++;
        }
      } catch (error) {
        errors.push(
          `Error updating ${movieId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        failed++;
      }
    }

    return { updated, failed, errors };
  }

  /**
   * Get industry statistics (private helper)
   */
  private async getIndustryStats(
    userId: string
  ): Promise<MovieStats["byIndustry"]> {
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$industry", count: { $sum: 1 } } },
    ];

    const results = await MovieModel.aggregate(pipeline);

    return {
      Hollywood: 0,
      Bollywood: 0,
      Bangla: 0,
      "South Indian": 0,
      Foreign: 0,
      ...results.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
    };
  }

  /**
   * Batch add movies with duplicate detection
   */
  async batchAddMovies(
    userId: string,
    movies: CreateMovieRequest[]
  ): Promise<{
    added: number;
    failed: number;
    duplicates: number;
    errors: string[];
    movies: MovieDocument[];
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
      movies: [] as MovieDocument[],
    };

    for (const movieData of movies) {
      try {
        // Check for duplicate
        const existingMovie = await MovieModel.findOne({
          userId,
          title: {
            $regex: new RegExp(
              `^${movieData.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
          ...(movieData.director && {
            director: {
              $regex: new RegExp(
                `^${movieData.director.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,
                "i"
              ),
            },
          }),
        });

        if (existingMovie) {
          results.duplicates++;
          results.errors.push(
            `Duplicate movie: "${movieData.title}" by ${
              movieData.director || "Unknown Director"
            }`
          );
          continue;
        }

        // Create new movie
        const movie = new MovieModel({
          userId,
          ...movieData,
        });

        await movie.save();
        results.movies.push(movie.toSafeObject());
        results.added++;
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push(
          `Failed to add "${movieData.title}": ${errorMessage}`
        );
      }
    }

    return results;
  }

  /**
   * Check for duplicate movies
   */
  async checkDuplicateMovies(
    userId: string,
    movies: CreateMovieRequest[]
  ): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(
        "Invalid user ID",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const duplicates: string[] = [];

    for (const movieData of movies) {
      const existingMovie = await MovieModel.findOne({
        userId,
        title: {
          $regex: new RegExp(
            `^${movieData.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        },
        ...(movieData.director && {
          director: {
            $regex: new RegExp(
              `^${movieData.director.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        }),
      });

      if (existingMovie) {
        duplicates.push(
          `"${movieData.title}" by ${movieData.director || "Unknown Director"}`
        );
      }
    }

    return duplicates;
  }

  /**
   * Get genre statistics (private helper)
   */
  private async getGenreStats(userId: string): Promise<Record<string, number>> {
    const pipeline: any[] = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await MovieModel.aggregate(pipeline);
    return results.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      {}
    );
  }
}

// Export singleton instance
export const movieService = new MovieService();
