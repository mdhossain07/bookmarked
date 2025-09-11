import mongoose, { Schema, Document } from "mongoose";
import { Book } from "bookmarked-types";

// Mongoose document interface with methods
export interface BookDoc extends Omit<Book, "_id">, Document {
  _id: mongoose.Types.ObjectId;
  toSafeObject(): any;
}

// Static methods interface
export interface BookModel extends mongoose.Model<BookDoc> {
  findByUserId(userId: string): Promise<BookDoc[]>;
  findByUserIdAndStatus(
    userId: string,
    status: Book["status"]
  ): Promise<BookDoc[]>;
  getBookStats(userId: string): Promise<any>;
}

// Book schema
const bookSchema = new Schema<BookDoc>(
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
    author: {
      type: String,
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
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
        values: ["read", "reading", "will read"],
        message: "Status must be one of: read, reading, will read",
      },
      default: "will read",
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
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        ret["_id"] = ret["_id"].toString();
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        ret["_id"] = ret["_id"].toString();
        return ret;
      },
    },
  }
);

// Compound indexes for better query performance
bookSchema.index({ userId: 1, status: 1 });
bookSchema.index({ userId: 1, author: 1 });
bookSchema.index({ userId: 1, genres: 1 });
bookSchema.index({ userId: 1, rating: 1 });
bookSchema.index({ userId: 1, completedOn: 1 });
bookSchema.index({ userId: 1, createdAt: 1 });

// Text index for search functionality
bookSchema.index({
  title: "text",
  author: "text",
  review: "text",
  genres: "text",
});

// Pre-save middleware for validation
bookSchema.pre("save", function (this: BookDoc, next) {
  // Ensure genres array doesn't have duplicates
  if (this.genres && this.genres.length > 0) {
    this.genres = [...new Set(this.genres.map((g) => g.trim()))].filter(
      (g) => g.length > 0
    );
  }

  // If status is 'read' and no completedOn date, set it to now
  if (this.status === "read" && !this.completedOn) {
    this.completedOn = new Date();
  }

  // If status is not 'read', clear completedOn date
  if (this.status !== "read") {
    this.set("completedOn", undefined);
  }

  next();
});

// Instance methods
bookSchema.methods["toSafeObject"] = function (this: BookDoc) {
  const obj = this.toObject();
  return obj;
};

// Static methods
bookSchema.statics["findByUserId"] = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

bookSchema.statics["findByUserIdAndStatus"] = function (
  userId: string,
  status: Book["status"]
) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

bookSchema.statics["getBookStats"] = function (userId: string) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        readCount: {
          $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] },
        },
        readingCount: {
          $sum: { $cond: [{ $eq: ["$status", "reading"] }, 1, 0] },
        },
        willReadCount: {
          $sum: { $cond: [{ $eq: ["$status", "will read"] }, 1, 0] },
        },
        averageRating: {
          $avg: {
            $cond: [{ $ne: ["$rating", null] }, "$rating", null],
          },
        },
        recentlyCompleted: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$completedOn", null] },
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
  ]).then((result) => result[0] || {});
};

// Create and export the model
export const BookModel = mongoose.model<BookDoc, BookModel>("Book", bookSchema);
export default BookModel;
