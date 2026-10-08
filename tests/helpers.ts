import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { createSession } from "@/server/auth/session";
import { connectDb } from "@/server/db";
import { registerUser } from "@/server/services/auth.service";
import { UserModel } from "@/server/models/User";

export function request(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
  const { method = "GET", body, headers } = init;
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function json(response: Response) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tests read arbitrary fields from the body
  return (await response.json()) as { success: boolean; message: string; data?: any; error?: { code: string } };
}

export async function resetDb() {
  await connectDb();
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
}

export const PASSWORD = "password123";

/** Registers a user and puts a session cookie for them in the jar. */
export async function signIn(email = "reader@example.com") {
  const user = await registerUser({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
    firstName: "Reader",
  });
  await createSession(user);
  return user;
}

export const deactivate = (id: string) => UserModel.updateOne({ _id: id }, { isActive: false });
