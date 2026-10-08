import { beforeEach, describe, expect, it } from "vitest";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as profile } from "@/app/api/auth/profile/route";
import { GET as listBooksRoute, POST as createBookRoute } from "@/app/api/books/route";
import { GET as listMoviesRoute, POST as createMovieRoute } from "@/app/api/movies/route";
import { PUT as updateProfile } from "@/app/api/users/update-profile/route";
import { POST as aiSearch } from "@/app/api/openai/search/route";
import { GET as health } from "@/app/api/health/route";
import { GET as unknown } from "@/app/api/[...path]/route";
import { SESSION_COOKIE, signSessionToken } from "@/server/auth/token";
import { jar } from "../cookies";
import { PASSWORD, json, request, resetDb, signIn } from "../helpers";

const ctx = undefined as never;

beforeEach(async () => {
  await resetDb();
});

describe("auth routes", () => {
  it("registers, signs in, and sets the session cookie", async () => {
    const response = await register(
      request("/api/auth/register", {
        method: "POST",
        body: { email: "new@example.com", password: PASSWORD, confirmPassword: PASSWORD, firstName: "New" },
      }),
      ctx
    );
    expect(response.status).toBe(201);
    expect(jar.get(SESSION_COOKIE)?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("returns 400 with the error shape for a bad body", async () => {
    const response = await register(request("/api/auth/register", { method: "POST", body: {} }), ctx);
    expect(response.status).toBe(400);
    expect((await json(response)).error?.code).toBe("VALIDATION_ERROR");
  });

  it("answers 429 after 10 failed logins from one address", async () => {
    await signIn();
    const attempt = () =>
      login(
        request("/api/auth/login", {
          method: "POST",
          body: { email: "reader@example.com", password: "wrong-password" },
          headers: { "x-forwarded-for": "9.9.9.9" },
        }),
        ctx
      );
    for (let i = 0; i < 10; i++) expect((await attempt()).status).toBe(401);
    expect((await attempt()).status).toBe(429);
  });

  it("logs out with an expired cookie and clears it (F3)", async () => {
    const user = await signIn();
    const expired = await signSessionToken({ userId: user.id, email: user.email });
    jar.set(SESSION_COOKIE, { value: expired, options: {} });
    const response = await logout(request("/api/auth/logout", { method: "POST" }), ctx);
    expect(response.status).toBe(200);
    expect(jar.get(SESSION_COOKIE)).toMatchObject({ value: "", options: { maxAge: 0 } });
  });

  it("logs out with no cookie at all", async () => {
    expect((await logout(request("/api/auth/logout", { method: "POST" }), ctx)).status).toBe(200);
  });

  it("returns 401 for the profile without a session", async () => {
    expect((await profile(request("/api/auth/profile"), ctx)).status).toBe(401);
  });
});

describe("books routes", () => {
  it("rejects a signed-out caller", async () => {
    expect((await listBooksRoute(request("/api/books"), ctx)).status).toBe(401);
  });

  it("creates, lists, and rejects a duplicate with 409", async () => {
    await signIn();
    const body = { title: "Dune", author: "Frank Herbert", genres: ["scifi"], status: "read", rating: 4.5 };
    expect((await createBookRoute(request("/api/books", { method: "POST", body }), ctx)).status).toBe(201);
    expect((await createBookRoute(request("/api/books", { method: "POST", body }), ctx)).status).toBe(409);
    const listed = await json(await listBooksRoute(request("/api/books?status=read&status=reading"), ctx));
    expect(listed.data.books).toHaveLength(1);
  });

  it("rejects a rating above 5 (F18)", async () => {
    await signIn();
    const body = { title: "Dune", genres: ["scifi"], rating: 8 };
    expect((await createBookRoute(request("/api/books", { method: "POST", body }), ctx)).status).toBe(400);
  });
});

describe("movies routes", () => {
  it("creates and lists a movie", async () => {
    await signIn();
    const body = { title: "Se7en (1995)", industry: "Hollywood", genres: ["thriller"], status: "watched", rating: 5 };
    expect((await createMovieRoute(request("/api/movies", { method: "POST", body }), ctx)).status).toBe(201);
    const listed = await json(await listMoviesRoute(request("/api/movies?search=Se7en%20("), ctx));
    expect(listed.data.movies).toHaveLength(1);
  });
});

describe("users routes", () => {
  it("updates the profile", async () => {
    await signIn();
    const response = await updateProfile(request("/api/users/update-profile", { method: "PUT", body: { firstName: "Ada" } }), ctx);
    expect(response.status).toBe(200);
    expect((await json(response)).data.user.firstName).toBe("Ada");
  });
});

describe("ai route", () => {
  it("answers 503 without an OpenAI key", async () => {
    delete process.env.OPENAI_API_KEY;
    await signIn();
    const response = await aiSearch(request("/api/openai/search", { method: "POST", body: { prompt: "space books" } }), ctx);
    expect(response.status).toBe(503);
  });
});

describe("health and unknown routes", () => {
  it("reports a healthy database", async () => {
    const response = await health(request("/api/health"), ctx);
    expect(response.status).toBe(200);
    expect((await json(response)).data.db).toBe("connected");
  });

  it("answers an unknown api path with JSON 404", async () => {
    const response = await unknown(request("/api/nope"));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
