#!/usr/bin/env node
// Records normalized responses for every API route. Needs an empty database: it registers fixed users.

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";
const VOLATILE_KEYS = new Set(["_id", "id", "userId", "timestamp", "createdAt", "updatedAt", "lastLogin", "completedOn", "stack"]);

const results = [];
let cookie = "";

function normalize(value, key) {
  if (Array.isArray(value)) return value.map((v) => normalize(v, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v, k)]));
  }
  if (VOLATILE_KEYS.has(key) && value != null) return `<${key}>`;
  return value;
}

// Keeps attributes, drops the token value.
function describeSetCookie(header) {
  if (!header) return undefined;
  return header
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.trim().replace(/^(\w+)=[^;]*/, "$1=<value>").replace(/Expires=[^;]*/, "Expires=<date>"));
}

async function call(name, method, path, { body, auth = true, rawCookie, bug } = {}) {
  const headers = { "Content-Type": "application/json" };
  const sendCookie = rawCookie ?? (auth ? cookie : "");
  if (sendCookie) headers.Cookie = sendCookie;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get("set-cookie");
  const token = setCookie?.match(/accessToken=([^;]*)/)?.[1];
  if (token !== undefined) cookie = token ? `accessToken=${token}` : "";

  let parsed;
  const text = await res.text();
  try {
    parsed = JSON.parse(text);
  } catch {
    // HTML pages embed a build ID that changes on every build
    parsed = text.startsWith("<!DOCTYPE html>") ? "<html page>" : text;
  }
  results.push({
    name,
    method,
    // the all-zero ID is a fixed "missing" fixture, so it stays readable
    path: path.replace(/[0-9a-f]{24}(?=$|[/?])/, (id) => (/^0+$/.test(id) ? id : "<id>")),
    ...(bug && { bug }),
    status: res.status,
    setCookie: describeSetCookie(setCookie),
    body: normalize(parsed),
  });
  return parsed;
}

const user = { email: "baseline@example.com", password: "Password123!", confirmPassword: "Password123!", firstName: "Base", lastName: "Line" };
const book = { title: "Dune", author: "Frank Herbert", genres: ["Sci-Fi"], status: "read", rating: 9 };
const movie = { title: "Heat", director: "Michael Mann", industry: "Hollywood", genres: ["Crime"], status: "watched", rating: 8 };

// Root and unknown routes
await call("welcome", "GET", "/", { auth: false });
await call("unknown route", "GET", "/api/nope", { auth: false });

// Auth
await call("register: invalid body", "POST", "/api/auth/register", { auth: false, body: { email: "x", password: "1" } });
await call("register: no lastName", "POST", "/api/auth/register", { auth: false, body: { ...user, email: "nolast@example.com", lastName: undefined }, bug: "F10" });
await call("register: ok", "POST", "/api/auth/register", { auth: false, body: user });
await call("register: duplicate", "POST", "/api/auth/register", { auth: false, body: user });
cookie = "";
await call("profile: no cookie", "GET", "/api/auth/profile", { auth: false });
await call("profile: bad token", "GET", "/api/auth/profile", { rawCookie: "accessToken=not-a-jwt" });
await call("login: invalid body", "POST", "/api/auth/login", { auth: false, body: { email: "x" } });
await call("login: wrong password", "POST", "/api/auth/login", { auth: false, body: { email: user.email, password: "wrong" } });
await call("login: ok", "POST", "/api/auth/login", { auth: false, body: { email: user.email, password: user.password } });
await call("profile: ok", "GET", "/api/auth/profile");
await call("refresh: ok", "POST", "/api/auth/refresh", { bug: "F4" });

// Users
await call("update-profile: ok", "PUT", "/api/users/update-profile", { body: { firstName: "Basey", preferences: { defaultView: "list" } } });
await call("update-profile: invalid", "PUT", "/api/users/update-profile", { body: { preferences: { itemsPerPage: 5 } } });
await call("change-password: mismatch", "POST", "/api/users/change-password", { body: { currentPassword: user.password, newPassword: "Password456!", confirmPassword: "nope" } });
await call("change-password: wrong current", "POST", "/api/users/change-password", { body: { currentPassword: "wrong", newPassword: "Password456!", confirmPassword: "Password456!" } });
await call("change-password: ok", "POST", "/api/users/change-password", { body: { currentPassword: user.password, newPassword: "Password456!", confirmPassword: "Password456!" } });

// Books
const created = await call("books: create", "POST", "/api/books", { body: book });
const bookId = created?.data?.book?._id;
await call("books: create duplicate", "POST", "/api/books", { body: book });
await call("books: create invalid", "POST", "/api/books", { body: { title: "", genres: [] } });
await call("books: create regex title", "POST", "/api/books", { body: { title: "Who Framed Roger Rabbit?", genres: ["Mystery"] } });
await call("books: duplicate regex title", "POST", "/api/books", { body: { title: "Who Framed Roger Rabbit?", genres: ["Mystery"] }, bug: "S1" });
await call("books: list", "GET", "/api/books");
await call("books: list filtered", "GET", "/api/books?status=read&status=reading&sortBy=title&sortOrder=asc&page=1&limit=5");
await call("books: list search", "GET", "/api/books?search=dune");
await call("books: list search regex chars", "GET", "/api/books?search=C%2B%2B", { bug: "S1" });
await call("books: list invalid query", "GET", "/api/books?sortBy=nope");
await call("books: stats", "GET", "/api/books/stats");
await call("books: search route", "GET", "/api/books/search?search=dune");
await call("books: by status", "GET", "/api/books/status/read");
await call("books: get", "GET", `/api/books/${bookId}`);
await call("books: get bad id", "GET", "/api/books/not-an-id");
await call("books: get missing", "GET", "/api/books/000000000000000000000000");
await call("books: update", "PUT", `/api/books/${bookId}`, { body: { status: "reading" } });
await call("books: bulk status", "POST", "/api/books/bulk-update-status", { body: { bookIds: [bookId], status: "read" }, bug: "F7" });
await call("books: get after bulk", "GET", `/api/books/${bookId}`, { bug: "F7" });
await call("books: check duplicates", "POST", "/api/books/check-duplicates", { body: { books: [book] } });
await call("books: batch add", "POST", "/api/books/batch-add", { body: { books: [book, { ...book, title: "Children of Dune" }] } });
await call("books: no cookie", "GET", "/api/books", { auth: false });
await call("books: delete", "DELETE", `/api/books/${bookId}`);
await call("books: delete again", "DELETE", `/api/books/${bookId}`);

// Movies
const createdMovie = await call("movies: create", "POST", "/api/movies", { body: movie });
const movieId = createdMovie?.data?.movie?._id;
await call("movies: create duplicate", "POST", "/api/movies", { body: movie });
await call("movies: create invalid", "POST", "/api/movies", { body: { title: "Heat", industry: "Mars", genres: [] } });
await call("movies: list", "GET", "/api/movies");
await call("movies: list filtered", "GET", "/api/movies?status=watched&industry=Hollywood&sortBy=title&sortOrder=asc");
await call("movies: list search regex chars", "GET", "/api/movies?search=Se7en%20(1995", { bug: "S1" });
await call("movies: stats", "GET", "/api/movies/stats");
await call("movies: search route", "GET", "/api/movies/search?search=heat");
await call("movies: by status", "GET", "/api/movies/status/watched");
await call("movies: by industry", "GET", "/api/movies/industry/Hollywood");
await call("movies: get", "GET", `/api/movies/${movieId}`);
await call("movies: get bad id", "GET", "/api/movies/not-an-id");
await call("movies: update", "PUT", `/api/movies/${movieId}`, { body: { status: "to watch" } });
await call("movies: bulk status", "POST", "/api/movies/bulk-update-status", { body: { movieIds: [movieId], status: "watched" } });
await call("movies: check duplicates", "POST", "/api/movies/check-duplicates", { body: { movies: [movie] } });
await call("movies: batch add", "POST", "/api/movies/batch-add", { body: { movies: [{ ...movie, title: "Collateral" }] } });
await call("movies: delete", "DELETE", `/api/movies/${movieId}`);

// AI: only paths that do not call OpenAI
await call("openai search: no prompt", "POST", "/api/openai/search", { body: {} });
await call("openai search: no cookie", "POST", "/api/openai/search", { auth: false, body: { prompt: "hello" } });

// Session end and deactivation
const session = cookie;
await call("logout: ok", "POST", "/api/auth/logout");
await call("logout: no cookie", "POST", "/api/auth/logout", { auth: false, bug: "F3" });
cookie = session;
await call("deactivate: ok", "POST", "/api/users/deactivate");
await call("profile: after deactivate, old token", "GET", "/api/auth/profile", { rawCookie: session, bug: "S2" });
await call("login: deactivated, wrong password", "POST", "/api/auth/login", { auth: false, body: { email: user.email, password: "wrong" }, bug: "S3" });

process.stdout.write(JSON.stringify({ baseUrl: "<base>", cases: results }, null, 2) + "\n");
