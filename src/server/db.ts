import "server-only";
import mongoose from "mongoose";
import { attachDatabasePool } from "@vercel/functions";
import { env } from "./env";

// Cached on globalThis: dev hot reload and warm serverless instances reuse one connection.
const cache = globalThis as typeof globalThis & {
  mongooseConnection?: Promise<typeof mongoose>;
};

/** Opens the shared MongoDB connection once and returns it on every later call. */
export function connectDb(): Promise<typeof mongoose> {
  cache.mongooseConnection ??= mongoose
    .connect(env().MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      // attachDatabasePool only tracks MongoDB pools that set maxIdleTimeMS
      maxIdleTimeMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
    })
    .then((instance) => {
      // no-op outside Vercel
      attachDatabasePool(instance.connection.getClient());
      return instance;
    })
    .catch((error: unknown) => {
      cache.mongooseConnection = undefined;
      throw error;
    });

  return cache.mongooseConnection;
}

export function databaseStatus(): "connected" | "connecting" | "disconnected" {
  switch (mongoose.connection.readyState) {
    case mongoose.ConnectionStates.connected:
      return "connected";
    case mongoose.ConnectionStates.connecting:
      return "connecting";
    default:
      return "disconnected";
  }
}
