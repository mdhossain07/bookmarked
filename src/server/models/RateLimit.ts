import "server-only";
import mongoose, { Schema } from "mongoose";

export interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    // TTL index: MongoDB deletes each window about a minute after it ends
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { collection: "ratelimits", versionKey: false }
);

export const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<RateLimitDoc> | undefined) ??
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);
