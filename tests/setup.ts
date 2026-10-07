import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { afterAll, beforeEach, vi } from "vitest";
import { jar } from "./cookies";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    has: (name: string) => jar.has(name),
    set: (name: string, value: string, options: Record<string, unknown> = {}) => {
      jar.set(name, { value, options });
    },
  }),
}));

process.env.JWT_SECRET = "test-secret-with-at-least-thirty-two-characters";
// A database per test file keeps files that run in parallel apart.
process.env.MONGODB_URI = `${process.env.TEST_MONGO_URI}${randomUUID()}`;

beforeEach(() => jar.clear());

afterAll(async () => {
  await mongoose.disconnect();
});
