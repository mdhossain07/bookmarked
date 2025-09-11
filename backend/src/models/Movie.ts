import mongoose, { Schema, Document } from "mongoose";
import { Movie } from "bookmarked-types";

// Mongoose document interface with methods
export interface MovieDoc extends Omit<Movie, "_id">, Document {
  _id: mongoose.Types.ObjectId;
  toSafeObject(): any;
}

// Static methods interface
export interface MovieModel extends mongoose.Model<MovieDoc> {
  findByUserId(userId: string): Promise<MovieDoc[]>;
  findByUserIdAndStatus(
    userId: string,
    status: Movie["status"]
  ): Promise<MovieDoc[]>;
  getMovieStats(userId: string): Promise<any>;
}

// Movie schema
const movieSchema = new Schema<MovieDoc>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    director: {
      type: String,
      trim: true,
      maxlength: [100, "Director name cannot exceed 100 characters"],
      index: true,
    },
    coverUrl: {
      type: String,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid cover URL format",
      },
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      enum: {
        values: ["Hollywood", "Bollywood", "Bangla", "South Indian", "Foreign"],
        message:
          "Industry must be one of: Hollywood, Bollywood, Bangla, South Indian, Foreign",
      },
      index: true,
    },
    genres: {
      type: [String],
      required: [true, "At least one genre is required"],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0 && v.length <= 10;
        },
        message: "Must have between 1 and 10 genres",
      },
      index: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["watched", "watching", "to watch"],
        message: "Status must be one of: watched, watching, to watch",
      },
      default: "to watch",
      index: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
      validate: {
        validator: function (v: number) {
          if (v === undefined || v === null) return true; // Optional field
          return Number.isInteger(v * 2); // Allow half ratings (1, 1.5, 2, 2.5, etc.)
        },
        message: "Rating must be a number with at most one decimal place",
      },
    },
    review: {
      type: String,
      trim: true,
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    completedOn: {
      type: Date,
      validate: {
        validator: function (v: Date) {
          if (!v) return true; // Optional field
          return v <= new Date(); // Cannot be in the future
        },
        message: "Completion date cannot be in the future",
      },
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
movieSchema.index({ userId: 1, status: 1 });
movieSchema.index({ userId: 1, industry: 1 });
movieSchema.index({ userId: 1, genres: 1 });
movieSchema.index({ userId: 1, createdAt: -1 });
movieSchema.index({ userId: 1, completedOn: -1 });
movieSchema.index({ userId: 1, rating: -1 });

// Text index for search functionality
movieSchema.index({
  title: "text",
  director: "text",
  review: "text",
});

// Virtual for formatted rating
movieSchema.virtual("formattedRating").get(function (this: MovieDoc) {
  if (!this.rating) return null;
  return this.rating <= 5 ? `${this.rating}/5` : `${this.rating}/10`;
});

// Pre-save middleware for validation
movieSchema.pre("save", function (this: MovieDoc, next) {
  // Ensure genres array doesn't have duplicates
  if (this.genres && this.genres.length > 0) {
    this.genres = [...new Set(this.genres.map((g) => g.trim()))].filter(
      (g) => g.length > 0
    );
  }

  // If status is 'watched' and no completedOn date, set it to now
  if (this.status === "watched" && !this.completedOn) {
    this.completedOn = new Date();
  }

  // If status is not 'watched', clear completedOn date
  if (this.status !== "watched") {
    this.set("completedOn", undefined);
  }

  next();
});

// Instance methods
movieSchema.methods["toSafeObject"] = function (this: MovieDoc) {
  const obj = this.toObject();
  return obj;
};

// Static methods
movieSchema.statics["findByUserId"] = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

movieSchema.statics["findByUserIdAndStatus"] = function (
  userId: string,
  status: Movie["status"]
) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

movieSchema.statics["getMovieStats"] = async function (userId: string) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        watchedCount: {
          $sum: { $cond: [{ $eq: ["$status", "watched"] }, 1, 0] },
        },
        watchingCount: {
          $sum: { $cond: [{ $eq: ["$status", "watching"] }, 1, 0] },
        },
        toWatchCount: {
          $sum: { $cond: [{ $eq: ["$status", "to watch"] }, 1, 0] },
        },
        averageRating: {
          $avg: { $cond: [{ $ne: ["$rating", null] }, "$rating", null] },
        },
        recentlyCompleted: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "watched"] },
                  {
                    $gte: [
                      "$completedOn",
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return (
    result[0] || {
      total: 0,
      watchedCount: 0,
      watchingCount: 0,
      toWatchCount: 0,
      averageRating: null,
      recentlyCompleted: 0,
    }
  );
};

// Create and export the model
export const MovieModel = mongoose.model<MovieDoc, MovieModel>(
  "Movie",
  movieSchema
);
