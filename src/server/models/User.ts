import "server-only";
import mongoose, { Schema, Document } from "mongoose";
import { User, UserPreferences } from "@/shared";

// The fields the toJSON and toObject transforms touch.
type SerializedDoc = { _id: { toString(): string }; password?: unknown; __v?: unknown; [key: string]: unknown };

// Mongoose document interface with methods
export interface UserDoc extends Omit<User, "_id">, Document {
  _id: mongoose.Types.ObjectId;
  toSafeObject(): Record<string, unknown>;
}

// Static methods interface
export interface UserModel extends mongoose.Model<UserDoc> {
  findByEmail(email: string): Promise<UserDoc | null>;
}

// User preferences schema
const userPreferencesSchema = new Schema<UserPreferences>(
  {
    defaultView: {
      type: String,
      enum: ["grid", "list"],
      default: "grid",
    },
    itemsPerPage: {
      type: Number,
      min: 10,
      max: 100,
      default: 20,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  { _id: false }
);

// User schema
const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [false, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: unknown, ret: SerializedDoc) {
        ret._id = ret._id.toString();
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc: unknown, ret: SerializedDoc) {
        ret._id = ret._id.toString();
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function (this: UserDoc) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to ensure preferences are set
userSchema.pre("save", function (this: UserDoc, next) {
  if (!this.preferences) {
    this.preferences = {
      defaultView: "grid",
      itemsPerPage: 20,
      theme: "light",
      language: "en",
      timezone: "UTC",
    };
  }
  next();
});

// Instance methods
userSchema.methods["toSafeObject"] = function (this: UserDoc) {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Static methods
userSchema.statics["findByEmail"] = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Reuse the compiled model: dev hot reload re-runs this module
export const UserModel =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<UserDoc, UserModel>("User", userSchema);
