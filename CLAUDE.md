# Bookmarked

A personal tracker for books and movies. One Next.js 16 app (App Router) with Route Handlers for the API, MongoDB through Mongoose, and a cookie session. It deploys to Vercel as one project. The migration plan and decisions are in `docs/plans/nextjs-migration.md`.

## Commands

```bash
yarn dev          # http://localhost:3000, needs .env.local (copy .env.example)
yarn build        # production build
yarn start        # serve the build
yarn type-check   # next typegen && tsc --noEmit
yarn lint         # ESLint, must have no errors and no warnings
yarn test         # Vitest with an in-memory MongoDB
```

`yarn test` downloads a MongoDB binary on first run. To use a local one, set `MONGOMS_SYSTEM_BINARY=/path/to/mongod`.

Before you finish a change, run `yarn type-check`, `yarn lint`, and `yarn test`. For anything visible, run `yarn build && yarn start` and look at the page.

## Folder map

```
src/
  proxy.ts                 # signed-out visitors go to /login?from=... (cookie check only)
  app/
    (auth)/                # login, register
    (app)/                 # dashboard, books, movies, latest-updates (signed-in layout)
    api/                   # Route Handlers: auth, users, books, movies, openai, health, 404
    globals.css            # color tokens for both themes
  server/                  # server only, every file imports "server-only"
    env.ts db.ts rate-limit.ts
    auth/ http/ models/ services/
  shared/                  # Zod schemas and types used by server and client
  components/              # layout/ media/ ui/ three/ auth/
  contexts/ hooks/ lib/
tests/server/              # Vitest tests, helpers in tests/helpers.ts
docs/                      # plan and API baseline
```

## Rules

- Every file in `src/server/**` imports `server-only`. Client code must never import from it.
- Every Route Handler is wrapped in `route()` from `src/server/http/route.ts`. Use `{ db: false }` for handlers that do not use the database.
- Routes validate input with the Zod schemas in `src/shared`, through `parseBody`, `parseQuery`, and `parseParams`. Errors are `ApiError`, and `route()` turns them into the shared error JSON.
- Protected routes call `requireUser()` first. User text that goes into a MongoDB regex goes through `containsText` or `equalsText`.
- Models use the guard `mongoose.models.X ?? mongoose.model(...)`. User ids are stored as strings.
- Read environment variables only through `env()` in `src/server/env.ts`. A new variable goes into `env.ts` and `.env.example`.
- Do not add Express, a second server, or a `NEXT_PUBLIC_API_URL`. The API is same-origin under `/api`.
- Server Components read cookies with `await cookies()`. Page props are `PageProps<"/route">` and route context is `RouteContext<"/route">`.
- Tests cover server behavior. Add a test with each bug fix in `src/server`.

## Design rules

- Colors come only from the tokens in `src/app/globals.css` and `tailwind.config.ts`. Do not write raw colors or `gray-*` classes. Books use `books`, movies use `movies`, and the accent is `brass`.
- Text uses four sizes: 14, 16, 20, and 32 px (`text-sm`, `text-base`, `text-lg`, `text-2xl`). Headings use the display font (Fraunces), and body text uses Inter.
- Motion: hover 150 ms, enter 250 ms with an 8 px move up, 30 ms stagger for the first 10 list items, nothing over 400 ms. Put `motion-safe:` on every movement.
- Text must keep 4.5:1 contrast (3:1 for large text) in both themes.
- All three.js code stays in `src/components/three/`. Load it only through `SceneLayer` (dynamic import, browser only). Do not add `@react-three/fiber`, `drei`, textures, or models.
- Ratings are 1 to 5 in steps of 0.5.

## Gotchas

- `getSessionUser()` reads the cookie before it touches the database, so `next build` never prerenders a page against the database.
- The database connection is cached on `globalThis`. `maxIdleTimeMS` must stay set, because Vercel's `attachDatabasePool` only tracks pools that set it.
- Rate limits are stored in MongoDB (collection `ratelimits`, TTL index). Memory counters do not work on serverless.
- `docs/api-baseline/` records the old Express responses. `node scripts/api-baseline.mjs` compares a running app with it.
