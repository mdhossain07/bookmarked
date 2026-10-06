# Plan: Move Bookmarked to Next.js, Refresh the Design, and Deploy on Vercel

Status: draft for review, 2026-10-06. Updated the same day with the design phases (6, 7, 8). Phase 0 is done and waits for review. The other phases are not started.

## Overview

### What this change is

Bookmarked is a personal tracker for books and movies. Today it is two separate apps: an Express API in `backend/` and a React single-page app (Vite) in `frontend/`. This plan replaces both with one Next.js app. The API becomes Next.js Route Handlers (server functions that answer HTTP requests). The pages become Next.js App Router pages.

The plan also gives the app a new look: a calm color palette, a better typeface, small motion effects, and one quiet 3D background animation made with three.js. The goal is simple and elegant, not busy.

### Who it is for and what problem it solves

It is for you as the owner and for anyone who uses the deployed app. The current Vercel setup cannot work in production, for three reasons:

1. The serverless entry `backend/api/index.ts` never opens the MongoDB connection, so every database query waits and then times out.
2. The login cookie uses `sameSite: "lax"`. The frontend and the backend run on two different `*.vercel.app` hosts. The browser treats them as different sites, so it does not send the cookie on API calls. Login looks successful, but the next request is unauthenticated.
3. `deployment.md` tells you to set `CORS_ORIGIN`, but the code reads `ALLOWED_ORIGINS`. Production CORS falls back to `localhost`, so the browser blocks the API calls.

One Next.js app serves pages and API from the same origin. That removes the cookie and CORS problems completely, and you have one Vercel project instead of two.

### What the result looks like

You open one URL. Login, books, movies, the dashboard, and AI search work the same as today. Lists show all your items, not only the first 20. The dashboard counts are correct. The app looks like a quiet reading room: warm paper colors in light mode, a deep ink color in dark mode, and one brass accent. Books and movies each have their own soft color. The login page and the dashboard header show a slow 3D field of floating pages. The repository has one `package.json`, one build, and one Vercel project.

## Decisions (defaults chosen, override before Phase 1)

| ID | Decision | Default in this plan | Alternative |
|---|---|---|---|
| D1 | Repository layout | One Next.js app at the repository root. Remove Yarn workspaces and the `bookmarked-types` package. Move its schemas to `src/shared/`. | Keep a monorepo: `apps/web` plus `packages/bookmarked-types`. |
| D2 | API style | Route Handlers that keep the current REST paths, so the client code changes little. | Server Actions. This is a larger rewrite of the client data layer. |
| D3 | Unused code | Remove endpoints and modules that no page uses (list in Phase 5). | Keep them and port them too. |
| D4 | Rate limit storage | A MongoDB collection with a TTL index (automatic expiry). No new service. | Upstash Redis from the Vercel Marketplace. |
| D5 | After register | Log the user in and go to `/dashboard`. The server already sets the cookie today. | Keep the redirect to `/login`, and stop setting the cookie on register. |
| D6 | Tailwind | Keep Tailwind 3 and the current shadcn/ui components. Upgrade to Tailwind 4 later, in a separate task. | Upgrade during the migration. |
| D7 | Data fetching | Keep TanStack Query and axios on the client. | Move reads to React Server Components now. |
| D8 | Color palette | "Reading room": ivory, ink, brass, sage for books, plum for movies (Phase 6). | Your own brand colors. The tokens keep a palette change to one file. |
| D9 | Typefaces | Fraunces for headings, Inter for body text, through `next/font`. | Inter only. |
| D10 | 3D library | `three` with `@react-three/fiber`, without `drei` or postprocessing. | Plain `three` in a `useEffect`. Fewer packages, more manual cleanup. |
| D11 | Where the 3D scene shows | Login, register, and a band behind the dashboard greeting. Not on list pages. | Login and register only. |
| D12 | Motion library | CSS only (Tailwind classes and `tailwindcss-animate`). No animation library. | `motion` (Framer Motion) for page transitions. |

Target versions:

- Next.js 16 (current 16.3.x), React 19, Zod 3, Node 22 (`.nvmrc` already says 22).
- Mongoose 8. Mongoose 9 is a separate upgrade.
- `three` 0.18x and `@react-three/fiber` 9.x. `@react-three/fiber` 9.8 accepts React 19.0 to 19.3, so keep React inside that range.

Next.js 16 facts that this plan depends on:

- `middleware.ts` is now `proxy.ts`.
- `cookies()`, `headers()`, and route `params` are async.
- Turbopack is the default bundler.
- `next lint` no longer exists. You run ESLint directly.
- Node 20.9 or later is required.

## Phases at a glance

The work has three stages. Each phase ends at a review stop: I finish the phase, report, and wait for your review before the next phase. Nothing is committed without your approval.

| Stage | Phase | Branch | Result you can see |
|---|---|---|---|
| A. Migration | 0. Preparation | `chore-nextjs-p0-baseline` | This plan and a recorded API baseline. |
| A. Migration | 1. Create the Next.js app | `refactor-nextjs-p1-scaffold` | An empty Next.js app runs next to the old apps. |
| A. Migration | 2. Server foundation | `refactor-nextjs-p2-server` | `GET /api/health` answers with the database status. |
| A. Migration | 3. Port the API | `refactor-nextjs-p3-api` | All API routes work in Next.js, with the security fixes. |
| A. Migration | 4. Port the pages | `refactor-nextjs-p4-pages` | The full app works in Next.js, with the old look. |
| A. Migration | 5. Remove the old code | `chore-nextjs-p5-remove-legacy` | `backend/`, `frontend/`, and `packages/` are gone. |
| B. Design | 6. Design system | `feat-design-p6-tokens` | New palette, typefaces, and color tokens on every page. |
| B. Design | 7. Components and motion | `feat-design-p7-components` | New layout, cards, skeletons, and small CSS motion. |
| B. Design | 8. Three.js scene | `feat-design-p8-three-scene` | Slow 3D background on login, register, and dashboard. |
| C. Launch | 9. Tests and quality gates | `chore-nextjs-p9-quality` | Lint, tests, contrast, and performance pass. |
| C. Launch | 10. Documentation and Claude files | `chore-nextjs-p10-docs` | `CLAUDE.md`, README, deployment guide, PRD updated. |
| C. Launch | 11. Deploy to Vercel | `chore-nextjs-p11-deploy` | One Production URL. Old Vercel projects removed. |

Stage A comes before stage B on purpose. The design work then touches each page one time, in its final Next.js form.

### Branches

The project has no ClickUp task, so the branch names have no task ID. They use `<type>-<feature-name>` with the phase number.

The branches are a stack. Each phase branch starts from the branch of the phase before it. Phase 0 starts from `main`. Git Town manages the stack (`git-town.main-branch` is `main` for this repository):

- `git town hack chore-nextjs-p0-baseline` created the first branch from `main`.
- When the next phase starts, `git town append <next-branch>` creates the child branch.
- `git town sync --stack` brings changes down the stack after a review fix in a lower branch.

Each branch gets its own pull request against its parent branch, so each review shows one phase only. I do not create the next branch, commit, push, or open a pull request before you approve the current phase.

## Issues found in the current code

Each issue has an ID. The phases below refer to these IDs. "Fixed by migration" means that the issue goes away with Express.

### Deployment blockers

| ID | Issue | Where | Fix |
|---|---|---|---|
| V1 | The serverless entry exports the Express app without a database connection. | `backend/api/index.ts:1` | Phase 2: cached connection that every route opens. |
| V2 | Cross-site cookie with `sameSite: "lax"` is not sent from the frontend host to the backend host. | `backend/src/utils/jwt.ts:13` | Fixed by migration (same origin). |
| V3 | The docs say `CORS_ORIGIN`, the code reads `ALLOWED_ORIGINS`. | `deployment.md:37`, `backend/src/config/environment.ts:25` | Fixed by migration (no CORS). |
| V4 | If `OPENAI_API_KEY` is missing, the OpenAI service throws during import. Every route imports `app.ts`, so the whole API fails. | `backend/src/services/openAI.service.ts:18`, `:132` | Phase 3: create the client on first use. If the key is missing, return 503. |
| V5 | Invalid environment variables call `process.exit(1)` during import. On Vercel this kills the function without a useful error. | `backend/src/config/environment.ts:49` | Phase 2: validate once, throw an error with the variable names. |
| V6 | `maxDuration: 10` is too short for a 1500-token GPT call. The axios timeout is also 10 seconds. | `backend/vercel.json`, `frontend/src/lib/api.ts:14` | Phase 3: `maxDuration = 60` on the AI route. Phase 4: longer timeout for that call only. |
| V7 | `VITE_API_URL` falls back to `http://localhost:3001/api` in production builds. | `frontend/src/lib/api.ts:9` | Fixed by migration (`baseURL: "/api"`). |

### Security

| ID | Issue | Where | Fix |
|---|---|---|---|
| S1 | User input goes into `new RegExp()` without escaping. A crafted search can cause very slow regex evaluation (ReDoS). Titles with `?`, `(`, `+` break the duplicate test. Example: "Who Framed Roger Rabbit?" is never found as a duplicate. | `backend/src/services/book.service.ts:35`, `:142`, `:161`, `movie.service.ts:34`, `:146`, `:166`, `:237` | Phase 3: one `escapeRegex()` helper for every user value. |
| S2 | A deactivated user keeps a valid token. The auth guard never reads `isActive`. | `backend/src/middleware/auth.middleware.ts:45` | Phase 2: `requireUser()` loads the user and rejects inactive accounts. |
| S3 | Login says "Account is deactivated" before it compares the password. This tells an attacker that the email exists. | `backend/src/services/auth.service.ts:85` | Phase 3: compare the password first. |
| S4 | No rate limit on login, register, or AI search. It was removed in commit `c6d25ca`. The AI route can run up the OpenAI bill. | `backend/src/app.ts` | Phase 3: rate limit (D4). |
| S5 | `JWT_SECRET` accepts 5 characters. | `backend/src/config/environment.ts:19` | Phase 2: require at least 32. |
| S6 | The development error log prints the request body, which includes passwords. | `backend/src/middleware/error.middleware.ts:92` | Phase 2: do not log bodies. |
| S7 | The AI prompt has no length limit on the server. The 500-character limit exists only in the client form. | `backend/src/controllers/openAI.controller.ts:10` | Phase 3: Zod schema, 3 to 500 characters. |
| S8 | `ignore-engines true` hides Node version problems. | `.yarnrc` | Phase 1: remove. |

### Functional bugs

| ID | Issue | Where | Fix |
|---|---|---|---|
| F1 | The client fetches `/books` and `/movies` with the default `limit=20` and filters on the client. A user with more than 20 items does not see the rest. | `frontend/src/contexts/MediaContext.tsx:76`, `:155` | Phase 4: send filters and page to the API, show pagination. |
| F2 | Dashboard counts come from those first 20 items, so they are wrong for larger libraries. The `/stats` endpoints exist but no page uses them. | `frontend/src/pages/Dashboard.tsx:26` | Phase 4: use `/api/books/stats` and `/api/movies/stats`. |
| F3 | Logout requires a valid token. With an expired cookie, logout returns 401 and the cookie stays. | `backend/src/routes/auth.routes.ts:37` | Phase 3: logout always clears the cookie. |
| F4 | `/auth/refresh` requires a valid access token, and the server never creates a refresh token. The endpoint does nothing useful. | `backend/src/routes/auth.routes.ts:43`, `backend/src/utils/jwt.ts:17` | Phase 3: remove refresh. Use one cookie with a 7-day token. |
| F5 | The client calls `PUT /auth/profile` and `POST /auth/change-password`. These do not exist. The server has `/users/update-profile` and `/users/change-password`. | `frontend/src/services/authService.ts:86`, `:103` | Phase 4: use the correct paths. |
| F6 | Register sets the login cookie, but the client sends the user to `/login`. | `frontend/src/pages/Register.tsx:45` | Phase 4: apply D5. |
| F7 | Bulk book status uses `updateMany`, which skips the `pre("save")` hook. Books marked "read" get no `completedOn`. Books moved away from "read" keep it. Movies use a different loop. | `backend/src/services/book.service.ts:287`, `movie.service.ts:321` | Phase 3: one shared rule, or remove with D3. |
| F8 | AI search errors are re-thrown as plain `Error` without `response`. The retry rule cannot see the status, so a 401 or 400 is retried twice and costs extra OpenAI calls. | `frontend/src/services/openaiService.ts:47`, `frontend/src/hooks/useOpenAI.ts:10` | Phase 4: no retry for AI calls. |
| F9 | `PublicOnlyRoute` never asks the server, so a logged-in user who opens `/login` sees the form. | `frontend/src/components/ProtectedRoute.tsx:93` | Phase 4: `proxy.ts` redirects. |
| F10 | `RegisterSchema` requires `lastName`, but the model and the types say it is optional. | `packages/bookmarked-types/src/api/auth.ts:9`, `backend/src/models/User.ts:65` | Phase 1: make it optional everywhere. |
| F11 | Every protected page mount calls `/auth/profile` again, and the page shows a spinner first. | `frontend/src/components/ProtectedRoute.tsx:29` | Phase 4: the server layout loads the user once. |
| F12 | The 404 message says `Route GET / not found` for every unknown path, because `app.use("*")` changes `req.path`. Found by the baseline. | `backend/src/middleware/error.middleware.ts:127` | Phase 3: the Next.js 404 response names the real path. |
| F13 | The two search routes read different parameters: books use `search`, movies use `q`. A bad book ID says "Invalid ID format", and a bad movie ID says "Validation failed". Found by the baseline. | `backend/src/controllers/movie.controller.ts:286`, `backend/src/services/book.service.ts:66` | Phase 3: the search routes go (D3). One `ObjectIdSchema` message for both. |

### Maintenance and tooling

| ID | Issue | Where | Fix |
|---|---|---|---|
| M1 | `yarn lint` fails. There is no ESLint configuration file. | repository root | Phase 9: ESLint flat configuration with `eslint-config-next`. |
| M2 | Unused dependencies: `kysely`, `mongodb`, `nodemailer`, `dotenv`, `ts-node`, `@types/jest`. Type packages are in `dependencies`. | `backend/package.json` | Phase 5: removed with `backend/`. |
| M3 | Dead code: `aiResponseParser.ts` (624 lines, only a test uses it), `SelectableMediaItem.tsx`, `useAuthenticatedFetch.ts`, `withProtectedRoute`, `src/api/ai.ts`, `src/shared/ai-validation.ts`, `src/scripts/openAI.script.ts`. | several | Phase 5 (D3). |
| M4 | `.env.example` lists SMTP and rate limit variables that nothing reads, and it does not list `OPENAI_API_KEY`. | `.env.example` | Phase 10. |
| M5 | `shared/validation.ts` has stale schemas: `RatingSchema` is 1 to 5, `StatusSchema` uses "want"/"current". | `packages/bookmarked-types/src/shared/validation.ts:35`, `:47` | Phase 1: delete what nothing imports. |
| M6 | `mongoose.model("User", ...)` runs at import. In Next.js development, hot reload imports it again and Mongoose throws `OverwriteModelError`. | `backend/src/models/*.ts` | Phase 2: `models.User ?? model(...)`. |
| M7 | `ThemeContext` reads `localStorage` during render. That fails on the server and causes a light/dark flash. | `frontend/src/contexts/ThemeContext.tsx:30` | Phase 4: `next-themes`. |
| M8 | The OpenAI model `gpt-4o` is hard-coded. | `backend/src/services/openAI.service.ts:15` | Phase 3: `OPENAI_MODEL` variable with a default. |

### Design and user interface

| ID | Issue | Where | Fix |
|---|---|---|---|
| UI1 | Pages do not use the theme tokens. There are 462 hard-coded color classes (`bg-gray-800`, `text-black`, and others) in 11 files. A palette change today means editing every page. | `frontend/src/pages/*`, `frontend/src/components/*` | Phase 6: replace them with tokens. |
| UI2 | The shadcn/ui components use `animate-in` and `fade-in` classes, but `tailwindcss-animate` is not installed. Dialog, popover, and toast animations do nothing. | `frontend/src/components/ui/dialog.tsx` and 5 more | Phase 6: install the plugin. |
| UI3 | The app uses the system font stack only, with no type scale. Headings and body text look the same weight everywhere. | `frontend/src/index.css` | Phase 6: two typefaces and four text sizes. |
| UI4 | Loading states are full-page spinners, and empty lists show no guidance. | `frontend/src/pages/Books.tsx`, `Movies.tsx`, `Dashboard.tsx` | Phase 7: skeletons and empty states. |

## Target structure

```
bookmarked/
  proxy.ts                      # redirects for pages only, by cookie
  next.config.ts                # security headers (replaces helmet)
  src/
    app/
      layout.tsx                # html, fonts, Providers
      providers.tsx             # "use client": QueryClient, Theme, Auth, Toaster
      (auth)/login/page.tsx
      (auth)/register/page.tsx
      (app)/layout.tsx          # server: requireUser() or redirect, MainLayout
      (app)/dashboard/page.tsx
      (app)/books/page.tsx
      (app)/movies/page.tsx
      (app)/latest-updates/page.tsx
      api/health/route.ts
      api/auth/{register,login,logout,profile}/route.ts
      api/users/{update-profile,change-password,deactivate}/route.ts
      api/books/route.ts        # GET list, POST create
      api/books/stats/route.ts
      api/books/[id]/route.ts   # GET, PUT, DELETE
      api/movies/...            # same shape as books
      api/openai/search/route.ts
    server/                     # every file imports "server-only"
      env.ts  db.ts  rate-limit.ts
      auth/{session.ts,password.ts}
      http/{route.ts,errors.ts,validate.ts,respond.ts}
      models/{User,Book,Movie}.ts
      services/{auth,user,book,movie,ai}.service.ts
    shared/                     # Zod schemas and types (from bookmarked-types)
    components/
      three/AmbientScene.tsx    # the only three.js code (Phase 8)
      layout/  media/  ui/
    contexts/  hooks/  lib/
```

## Steps

### Phase 0: Preparation (done, waits for review)

1. Branch `chore-nextjs-p0-baseline` exists, created from `main` with Git Town. There is no ClickUp task for this project.
2. The current API behavior is recorded in `docs/api-baseline/express.json`: 67 requests with the status code, the cookie attributes, and the response body. `scripts/api-baseline.mjs` makes the recording, and `docs/api-baseline/README.md` explains how to run it again. Phase 3 runs it against the Next.js app and compares.
3. The recording ran the old API against a local test database. It proves bugs S1, S2, S3, F3, F4, F7, and F10, and it found F12 and F13.
4. Still open, for you: make sure that you have a MongoDB Atlas cluster and a connection string for production. Pick the Atlas region now. The Vercel function region must be near it. This is needed only in Phase 11.

Done when: the branch exists and the route list is recorded. Both are done.

### Phase 1: Create the Next.js app

1. Create the Next.js 16 app at the repository root with TypeScript, the App Router, the `src/` directory, and the `@/*` alias.
2. Copy `tailwind.config.js`, `postcss.config.js`, and `index.css` (as `src/app/globals.css`). Keep Tailwind 3 (D6).
3. Move `packages/bookmarked-types/src/*` to `src/shared/`. Change the `bookmarked-types` imports to `@/shared`. Delete the schemas that nothing imports (M5). Make `lastName` optional in `RegisterSchema` (F10).
4. Replace the root `package.json`: no workspaces. Scripts are `dev`, `build`, `start`, `lint`, `type-check`, `test`. Set `"engines": { "node": ">=20.9" }`. Remove `ignore-engines` from `.yarnrc` (S8).
5. Keep `backend/` and `frontend/` in place for now. You can run the old app next to the new one to compare.

Done when: `yarn dev` shows an empty Next.js page with the Tailwind theme, and `yarn type-check` passes.

### Phase 2: Server foundation

This phase replaces what Express middleware did. Nothing is visible to users yet.

1. `src/server/env.ts`: a Zod schema for `MONGODB_URI`, `JWT_SECRET` (minimum 32 characters, S5), `JWT_EXPIRES_IN` (default `7d`), `OPENAI_API_KEY` (optional), `OPENAI_MODEL` (optional). Parse once on first use. On failure, throw an error that names the variables (V5). Next.js loads `.env` files, so `dotenv` goes away.
2. `src/server/db.ts`: cache the connection promise on `globalThis`, so hot reload and warm functions reuse it (V1). Use `bufferCommands: false` and a small `maxPoolSize` (5). On Vercel, call `attachDatabasePool()` from `@vercel/functions` with the Mongoose client. If a function instance stops, this closes its idle connections.
3. Models: move `User`, `Book`, `Movie` to `src/server/models/`. Export with `mongoose.models.X ?? mongoose.model(...)` (M6).
4. `src/server/http/errors.ts`: keep `ApiError`. Add `toErrorResponse(error)`. It maps `ApiError`, `ZodError`, Mongoose `ValidationError` and `CastError`, and duplicate key `11000` to the same `ApiResponse` JSON as today. Do not log request bodies (S6).
5. `src/server/http/route.ts`: one wrapper that every handler uses. It opens the database, runs the handler, and turns errors into responses. This replaces `asyncHandler`, `errorHandler`, and `notFoundHandler`.

   ```ts
   export const GET = route(async (req) => {
     const user = await requireUser();
     return ok(await bookService.getBookStats(user.id));
   });
   ```

6. `src/server/http/validate.ts`: `parseBody(req, schema)` and `parseQuery(req, schema)`. `parseQuery` must turn repeated keys into arrays (`?status=read&status=reading`), as Express did, because `BookQuerySchema` accepts arrays.
7. `src/server/auth/session.ts`: replace `jsonwebtoken` with `jose`. It works in both the Node.js runtime and `proxy.ts`. Functions:
   - `createSession(user)` sets one `accessToken` cookie: `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`, 7 days.
   - `clearSession()` deletes it.
   - `requireUser()` reads the cookie with `await cookies()` and makes sure that the token is valid. Then it loads the user. If the user is missing or inactive, it throws 401 (S2).
8. `src/server/auth/password.ts`: keep `bcryptjs`, 12 rounds.

Done when: a test route `GET /api/health` returns `{ success: true, db: "connected" }` locally.

### Phase 3: Port the API

Port each Express route to a Route Handler at the same path, with the same request and response shapes. Services move almost unchanged to `src/server/services/`. Fix the listed issues during the port.

| Express route | Route Handler file | Fixes in this step |
|---|---|---|
| `POST /api/auth/register` | `api/auth/register/route.ts` | rate limit (S4), D5 |
| `POST /api/auth/login` | `api/auth/login/route.ts` | compare the password first (S3), rate limit (S4) |
| `GET /api/auth/profile` | `api/auth/profile/route.ts` | none |
| `POST /api/auth/logout` | `api/auth/logout/route.ts` | no auth required (F3) |
| `POST /api/auth/refresh` | removed | F4 |
| `PUT /api/users/update-profile` | `api/users/update-profile/route.ts` | none |
| `POST /api/users/change-password` | `api/users/change-password/route.ts` | none |
| `POST /api/users/deactivate` | `api/users/deactivate/route.ts` | clear the cookie after deactivation |
| `GET`, `POST /api/books` | `api/books/route.ts` | escape regex (S1) |
| `GET /api/books/stats` | `api/books/stats/route.ts` | none |
| `GET`, `PUT`, `DELETE /api/books/:id` | `api/books/[id]/route.ts` | `params` is async. Validate with `ObjectIdSchema`. |
| movie routes | same shape under `api/movies/` | escape regex (S1) |
| `POST /api/openai/search` | `api/openai/search/route.ts` | Zod prompt 3 to 500 (S7). Rate limit (S4). Lazy client. No key gives 503 (V4). `OPENAI_MODEL` (M8). `export const maxDuration = 60` (V6). |

Shared details for this phase:

1. `escapeRegex()` in `src/server/http/validate.ts`. Use it for `search`, `author`, `director`, and the duplicate tests (S1).
2. Rate limit (D4): collection `ratelimits` with fields `key`, `count`, `expiresAt`, and a TTL index on `expiresAt`. One `findOneAndUpdate` with `$inc` and `upsert` for each request. The key is the route name plus the client IP (`x-forwarded-for` on Vercel) or the user ID. Limits: login and register 10 per 15 minutes per IP. AI search 20 per hour per user. Return 429 with the existing `ApiResponse` shape.
3. Response headers: the security headers from `helmet` go to `headers()` in `next.config.ts`. Use `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`. Vercel compresses responses, so `compression` is not needed. Vercel logs requests, so `morgan` is not needed.

Done when: every route in the table gives the same answers as the Express route for the Phase 0 cases. The new fixes work as described.

### Phase 4: Port the pages

1. `src/app/providers.tsx` ("use client"): `QueryClientProvider`, `ThemeProvider` from `next-themes` (M7), `AuthProvider`, and `Toaster`. Load React Query Devtools only in development.
2. Router changes in the 31 places that use `react-router-dom`:
   - `useNavigate()` becomes `useRouter()`.
   - `<Link to>` becomes `<Link href>`.
   - `useLocation()` becomes `usePathname()`.
   - Each page file starts with `"use client"`. The page bodies do not change otherwise.
3. Auth:
   - `proxy.ts` handles redirects. Without a cookie, `/dashboard`, `/books`, `/movies`, and `/latest-updates` redirect to `/login?from=...`. With a valid cookie, `/login` and `/register` redirect to `/dashboard` (F9). The proxy only redirects. Route Handlers still call `requireUser()`.
   - `(app)/layout.tsx` is a Server Component. It calls `requireUser()`, and on failure it redirects. It passes the user to `AuthProvider` as the starting value. This removes the spinner and the extra profile call on each page (F11).
   - Delete `ProtectedRoute.tsx`.
   - Register goes to `/dashboard` (D5, F6).
   - Fix the `updateProfile` and `changePassword` paths (F5).
4. API client: `baseURL: "/api"`. Remove `withCredentials`, because the request is same-origin. Remove `VITE_API_URL` and `vite-env.d.ts` (V7). Give the AI search call a 60-second timeout (V6).
5. Lists and dashboard:
   - `Books` and `Movies` send `status`, `genres`, `author` or `industry`, the date range, `search`, `page`, and `limit` to the API. They use the `pagination` object from the response (F1). Put the filters in the query key. Then TanStack Query fetches again after each filter change.
   - The author filter options need all authors, not one page. Add `GET /api/books/authors` (a `distinct` query), or remove that filter.
   - `Dashboard` reads `/api/books/stats` and `/api/movies/stats` (F2).
   - `MediaContext` keeps only the mutations. Mutations invalidate both the list and the stats queries.
6. AI search: `retry: false` (F8).
7. `index.html` becomes `metadata` in `src/app/layout.tsx`. Add a favicon.

Done when: you can do every user flow in the new app with `yarn dev`, and the old app is no longer needed for comparison.

### Phase 5: Remove the old code

1. Delete `backend/`, `frontend/`, `packages/`, the root `tsconfig.json` references, and the workspace entries.
2. Remove dead code (M3, D3):
   - Endpoints that no page calls: `batch-add`, `check-duplicates`, `bulk-update-status`, `search`, `status/:status`, `industry/:industry`, `generate-story`, `latest-update`.
   - Modules: `aiResponseParser.ts` and its test, `SelectableMediaItem.tsx`, `useAuthenticatedFetch.ts`, `shared/api/ai.ts`, `shared/ai-validation.ts`, `scripts/openAI.script.ts`.
   - If the AI import feature comes back later, you can get them from `git log`.
3. Remove the dependencies that only Express or Vite used, and their `@types/*` packages:
   - Express: `express`, `cors`, `helmet`, `morgan`, `compression`, `cookie-parser`.
   - Server tools: `jsonwebtoken`, `dotenv`, `nodemon`, `tsx`, `ts-node`.
   - Client: `vite`, `@vitejs/plugin-react`, `react-router-dom`.
   - Unused (M2): `kysely`, `mongodb`, `nodemailer`, `concurrently`.
4. Run `yarn install` and commit the new `yarn.lock` with the rest of the change.

Done when: `yarn build` passes and `git grep -n "express\|react-router\|VITE_"` returns nothing in source files.

### Phase 6: Design system

What this phase does, in plain words: it picks the colors and the fonts, and it makes every page take its colors from one place. After this phase, the app has the new palette. The layout does not change yet.

1. Put the palette in `src/app/globals.css` as CSS variables (the existing shadcn/ui token names), plus three new tokens: `--accent-text`, `--books`, `--movies`. Add `books` and `movies` to `tailwind.config.ts`. Starting values (D8):

   | Token | Light ("paper") | Dark ("night library") |
   |---|---|---|
   | `--background` | `#FAF7F2` ivory | `#12141C` ink black |
   | `--foreground` | `#1C1F2A` ink | `#ECE6DA` warm white |
   | `--card` | `#FFFDF9` | `#1A1D27` |
   | `--muted` | `#F1ECE4` | `#232734` |
   | `--muted-foreground` | `#6B655E` | `#A39E93` |
   | `--primary` | `#2E3A59` deep indigo | `#D4A85A` brass |
   | `--accent` (fills, borders, icons) | `#B8873B` brass | `#D4A85A` brass |
   | `--accent-text` | `#8A6427` dark brass | `#D4A85A` brass |
   | `--books` | `#4F6E55` sage | `#8FB896` sage |
   | `--movies` | `#8A4458` plum | `#D791A6` rose |
   | `--border` | `#E6DFD3` | `#2C303D` |
   | `--destructive` | `#B3403A` | `#E0726B` |

2. Contrast rule: body text must have a contrast of 4.5:1 or more. Large text and icons must have 3:1 or more. I measured the values above against `--background`:
   - Light: foreground 15.4, muted text 5.4, primary 10.5, books 5.3, movies 6.5, accent text 5.0.
   - Dark: foreground 14.8, muted text 6.9, primary 8.4, books 8.3, movies 7.4.
   - Light `--accent` brass is 3.0:1, so it is for fills, borders, and icons only. Brass text in light mode uses `--accent-text`.
3. Typefaces (D9): load Fraunces (headings) and Inter (body) with `next/font/google`. `next/font` hosts the files with the app, so there is no layout shift and no request to Google at run time. Use four text sizes only: 14, 16, 20, and 32 pixels.
4. Shape: `--radius: 0.75rem`. One soft shadow token for cards, one for dialogs.
5. Install `tailwindcss-animate` and add it to the Tailwind plugins (UI2).
6. Replace the 462 hard-coded color classes with tokens (UI1). Examples: `bg-white dark:bg-gray-800` becomes `bg-card`. `text-gray-600 dark:text-gray-400` becomes `text-muted-foreground`. `bg-black dark:bg-white` becomes `bg-primary`.

Done when: both themes show the new palette on every page, and `git grep -nE "(gray|slate|zinc)-[0-9]|bg-black|text-black|bg-white|text-white" src` returns nothing outside `src/components/ui/`.

### Phase 7: Components and motion

What this phase does, in plain words: it gives the pages a cleaner layout and small, calm movements. Nothing moves for long. If your device asks for less motion, nothing moves at all.

1. Layout:
   - Sidebar on `--card` with a thin border. The active item has a brass bar on its left side that slides to the new item.
   - Top bar only holds the theme toggle and the user menu.
   - Page content has a maximum width of 1200 pixels and more white space.
2. Login and register: two columns on wide screens. The form card is on the left. The right side is a gradient in palette colors, and Phase 8 puts the 3D scene there. On phones, the form is full width over a soft gradient.
3. Dashboard:
   - A greeting with the user's first name.
   - Four stat tiles: books read, reading, movies watched, to watch. Each tile has a thin top border in the books or movies color.
   - A "recently added" row.
4. Media cards: cover image at a 2:3 ratio, title in Fraunces, a status badge tinted with the books or movies color. On hover, the card moves up 2 pixels and its shadow grows.
5. Loading and empty states (UI4): skeleton cards in the shape of the real cards. An empty list shows one short sentence and an "Add" button.
6. Motion rules (D12). Write them once in `globals.css` and the Tailwind configuration, and use only these:
   - Hover and press: 150 ms.
   - Content that enters (page body, dialog, list items): fade in and move up 8 pixels, 250 ms.
   - Lists: 30 ms delay between items, for the first 10 items only.
   - No motion longer than 400 ms. Easing `cubic-bezier(0.22, 1, 0.36, 1)`.
   - Use the `motion-safe:` prefix for all movement. With `prefers-reduced-motion: reduce`, only color and opacity changes remain.

Done when: every page uses the new layout and components, and with reduced motion turned on in the operating system, nothing moves.

### Phase 8: Three.js scene

What this phase does, in plain words: it adds one slow, quiet 3D background. Thin, softly lit "pages" and small points of light drift and turn slowly in the palette colors, like dust in a library. It is decoration only. It never covers text, and you cannot click it.

1. Install `three` and `@react-three/fiber` (D10). Do not add `drei`, postprocessing, textures, or 3D model files.
2. Create one component, `src/components/three/AmbientScene.tsx` (`"use client"`):
   - One `InstancedMesh` of about 60 thin planes (the "pages") and one `Points` object with about 200 points.
   - In `useFrame`, each page turns and drifts on a slow sine path. One full cycle takes 20 seconds or more.
   - Colors come from the CSS tokens (`--accent`, `--books`, `--movies`, `--muted`). When the theme changes, the scene reads them again.
   - On desktop only, a small pointer parallax: the camera turns 3 degrees at most toward the pointer.
3. Load it only where it shows (D11): `next/dynamic(() => import(...), { ssr: false })` on the login, register, and dashboard pages. Other pages never download three.js. The Phase 7 gradient shows until the scene is ready. If the scene cannot start, the gradient stays.
4. Performance guards:
   - `dpr={[1, 1.5]}` and `gl={{ antialias: false, powerPreference: "low-power" }}`. No shadows.
   - If the tab is hidden (`document.visibilityState`) or the canvas is off screen (`IntersectionObserver`), stop the render loop.
   - Free the WebGL context on unmount.
5. Accessibility and fallbacks:
   - The canvas has `aria-hidden="true"` and `pointer-events: none`.
   - With `prefers-reduced-motion: reduce`, draw one still frame and stop.
   - If WebGL is not available, keep the gradient.
6. Budgets:
   - The three.js chunk is 200 KB (gzip) or less, and it loads only on the three pages from D11.
   - Lighthouse Performance on `/login` with the mobile profile is 90 or more.
   - Cumulative Layout Shift is 0, because the canvas sits in an absolute-positioned layer.

Done when: the budgets pass and the scene works in both themes. Reduced motion gives a still frame. After 10 navigations between login and dashboard, the browser console shows no WebGL context warning.

### Phase 9: Tests and quality gates

1. ESLint flat configuration (`eslint.config.mjs`) with `eslint-config-next` and `typescript-eslint`. `yarn lint` passes (M1).
2. Vitest with `mongodb-memory-server` for services. Test these cases first, because they are the bugs in this plan:
   - A regex character in a title is found as a duplicate (S1).
   - A deactivated user gets 401 (S2).
   - Login with a wrong password on a deactivated account says "Invalid email or password" (S3).
   - Logout with an expired cookie returns 200 and clears the cookie (F3).
   - `parseQuery` turns repeated keys into arrays.
   - The rate limit returns 429 after the limit.
3. Route Handler tests: call the exported `GET` or `POST` with a `NextRequest` for one route for each module.
4. Manual run with `yarn build && yarn start`:
   - Register, then land on the dashboard.
   - Add 25 books, then see all 25 across pages, and see the correct dashboard counts.
   - Filter and search with `C++` and `Se7en (1995)`.
   - Log out, then make sure that `/books` redirects to `/login`.
   - AI search works. Without `OPENAI_API_KEY`, it shows a clear message and the rest of the app works.
   - Dark mode has no flash on reload.
5. Design tests:
   - Measure contrast for every text token pair in both themes with a contrast tool. All pairs meet the Phase 6 rule.
   - Turn on reduced motion in the operating system. Nothing moves, and the 3D scene is a still frame.
   - Turn off WebGL in the browser. The login page shows the gradient and works.
   - Run Lighthouse (mobile) on `/login` and `/dashboard`. Performance is 90 or more, Accessibility is 95 or more.
   - Look at each page at 375, 768, and 1440 pixels wide, in both themes.

Done when: lint, type-check, tests, and build pass, and the manual list and the design tests pass.

### Phase 10: Documentation and Claude files

There is no `CLAUDE.md` and no plan file in the repository today, only `Bookmarked-PRD.md`.

1. Create `CLAUDE.md` at the root. Content:
   - Commands.
   - The folder map from this plan.
   - Rules: `src/server/**` imports `server-only`. Every Route Handler uses `route()`. Models use the `models.X ??` guard. Validation uses Zod schemas from `src/shared`. Do not add new environment variables without adding them to `env.ts` and `.env.example`.
   - Design rules: colors come only from tokens in `globals.css`. Motion follows the Phase 7 rules. All three.js code stays in `src/components/three/`.
2. Rewrite `README.md`: one app, Next.js, the new commands, the API route list. Remove the "Phase 1 Completion Status" section, because it is out of date.
3. Rewrite `deployment.md` for one Vercel project (Phase 11).
4. `Bookmarked-PRD.md`: update "Technical Implementation Plan" and "Project Roadmap & Milestones". Replace Express and Vite with the Next.js App Router and Route Handlers. Keep the product sections as they are.
5. Delete `packages/bookmarked-types/MAINTENANCE.md` (the package no longer exists).
6. `.env.example`: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OPENAI_API_KEY`, `OPENAI_MODEL` (M4).
7. Mark this plan as done, with the date.

### Phase 11: Deploy to Vercel

1. Create one Vercel project from the repository. Root directory is the repository root. Framework preset is Next.js. Use the default build command.
2. Add the environment variables from `.env.example` for Production and Preview. Use a separate database (or a separate Atlas database name) for Preview.
3. In Atlas, allow connections from Vercel. On the Hobby plan, Vercel has no fixed IP addresses, so the network access list is `0.0.0.0/0` with a strong database password. You can also use the MongoDB Atlas integration from the Vercel Marketplace.
4. Set the function region to the region nearest to the Atlas cluster. Use the project configuration page, or `regions` in `vercel.json`.
5. Deploy a Preview from the branch. Do the manual list from Phase 9 on the Preview URL.
6. After you approve, merge and deploy Production. Then delete the two old Vercel projects (`bookmarked-backend`, `bookmarked-frontend`). Only you can do this step.

Done when: the Production URL passes the manual list, and the old projects are removed.

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| A response shape changes during the port. | Pages show empty data. | Phase 0 records the shapes. Phase 3 compares against them. |
| Too many Atlas connections from many function instances. | Connection errors under load. | Small pool, `attachDatabasePool()`, cached connection. |
| Existing users have a cookie from the old backend host. | None. The new app is on a new host and they log in again. | Tell users to log in again once. |
| The `ratelimits` collection grows. | Storage use. | The TTL index deletes old entries automatically. |
| The 3D scene is slow on old phones. | Battery use, slow page. | DPR cap. Pause in hidden tabs. Still frame with reduced motion. Lighthouse budget in Phase 9. Option: show the scene only on screens 768 pixels or wider. |
| The new palette does not suit you. | Rework. | All colors are tokens in one file (D8). Review the palette at the Phase 6 stop before Phase 7 starts. |
| A React update goes past 19.3. | `@react-three/fiber` peer range breaks the install. | Pin React to `~19.x` inside the range until a newer `@react-three/fiber` supports it. |
| Removing endpoints that something outside the app uses. | That caller breaks. | Only the frontend in this repository uses the API. If you know of another caller, keep those routes (D3). |
