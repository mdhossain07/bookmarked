import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { requireUser } from "@/server/auth/session";
import { ApiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/rate-limit";
import { loginUser } from "@/server/services/auth.service";
import { createBook, listBooks } from "@/server/services/book.service";
import { PASSWORD, deactivate, resetDb, signIn } from "../helpers";

beforeAll(resetDb);

describe("books", () => {
  let userId: string;
  beforeEach(async () => {
    await resetDb();
    userId = (await signIn()).id;
  });

  it.each(["C++", "Rabbit?", "Se7en (1995)", "a.b"])("finds a duplicate title with regex characters: %s", async (title) => {
    const book = { title, author: "A", genres: ["x"], status: "read" as const };
    await createBook(userId, book);
    await expect(createBook(userId, book)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("does not treat a different title as a duplicate", async () => {
    await createBook(userId, { title: "a.b", author: "A", genres: ["x"], status: "read" });
    await expect(createBook(userId, { title: "aXb", author: "A", genres: ["x"], status: "read" })).resolves.toBeTruthy();
  });

  it("searches for regex characters literally", async () => {
    await createBook(userId, { title: "C++ Primer", genres: ["x"], status: "read" });
    await createBook(userId, { title: "C Primer", genres: ["x"], status: "read" });
    const { books } = await listBooks(userId, { search: "C++" } as never);
    expect(books.map((b) => b.title)).toEqual(["C++ Primer"]);
  });
});

describe("sessions and login", () => {
  beforeEach(resetDb);

  it("rejects a deactivated user with 401 (S2)", async () => {
    const user = await signIn();
    await expect(requireUser()).resolves.toBeTruthy();
    await deactivate(user.id);
    await expect(requireUser()).rejects.toMatchObject({ statusCode: 401 });
  });

  it("does not reveal a deactivated account to a wrong password (S3)", async () => {
    const user = await signIn("gone@example.com");
    await deactivate(user.id);
    await expect(loginUser({ email: "gone@example.com", password: "wrong-password" })).rejects.toThrow(
      "Invalid email or password"
    );
    await expect(loginUser({ email: "gone@example.com", password: PASSWORD })).rejects.toThrow("Account is deactivated");
  });

  it("gives an unknown email the same message as a wrong password", async () => {
    await expect(loginUser({ email: "nobody@example.com", password: PASSWORD })).rejects.toThrow(
      "Invalid email or password"
    );
  });
});

describe("rate limit", () => {
  beforeEach(resetDb);

  it("allows the limit and then throws 429", async () => {
    const rule = { limit: 3, windowMs: 60 * 60 * 1000 };
    for (let i = 0; i < 3; i++) await enforceRateLimit("t:one", rule);
    const error = await enforceRateLimit("t:one", rule).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ statusCode: 429 });
  });

  it("counts each key on its own", async () => {
    const rule = { limit: 1, windowMs: 60 * 60 * 1000 };
    await enforceRateLimit("t:a", rule);
    await expect(enforceRateLimit("t:b", rule)).resolves.toBeUndefined();
  });

  it("stays correct when first requests race", async () => {
    const rule = { limit: 5, windowMs: 60 * 60 * 1000 };
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => enforceRateLimit("t:race", rule)));
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(3);
  });
});
