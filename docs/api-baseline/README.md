# API baseline

`express.json` records how the Express API answers 67 requests. Phase 3 of the [migration plan](../plans/nextjs-migration.md) runs the same requests against the Next.js API and compares the two files.

## How it was recorded

Recorded on 2026-10-06 from `main` at commit `3a69590`, against an empty local MongoDB.

1. Start an empty MongoDB, for example on port 27027.
2. Start the Express API on port 3099 with test values:

   ```bash
   cd backend && NODE_ENV=production PORT=3099 MONGODB_URI=mongodb://127.0.0.1:27027/bookmarked-baseline JWT_SECRET=baseline-test-secret-not-real-0123456789 OPENAI_API_KEY=sk-baseline-invalid npx tsx src/server.ts
   ```

3. Run the script and save the output:

   ```bash
   BASE_URL=http://localhost:3099 node scripts/api-baseline.mjs > docs/api-baseline/express.json
   ```

The script replaces IDs, dates, and cookie values with placeholders, so two runs on an empty database give the same file. No request calls OpenAI.

## How Phase 3 uses it

1. Run the script against the Next.js app on an empty database, and save it as `nextjs.json`.
2. Compare the files with `diff docs/api-baseline/express.json docs/api-baseline/nextjs.json`.
3. Each difference must be one of these:
   - A case with a `bug` field. The fix in the plan changes that result on purpose.
   - A route that the plan removes (decision D3). The Next.js app answers 404.
   - A row in the "Known differences" list below.

## Bugs that the baseline proves

| Case | Plan ID | Express result | Result after the fix |
|---|---|---|---|
| `books: duplicate regex title` | S1 | 201, a second "Who Framed Roger Rabbit?" is created | 409 |
| `books: list search regex chars` | S1 | 500 for `search=C++` | 200 |
| `movies: list search regex chars` | S1 | 500 for `search=Se7en (1995` | 200 |
| `profile: after deactivate, old token` | S2 | 200 | 401 |
| `login: deactivated, wrong password` | S3 | 401 "Account is deactivated" | 401 "Invalid email or password" |
| `logout: no cookie` | F3 | 401 | 200 |
| `refresh: ok` | F4 | 200 | 404 (route removed) |
| `books: get after bulk` | F7 | status "read" with no `completedOn` | route removed (D3) |
| `register: no lastName` | F10 | 400 | 201 |

## Known differences

These are allowed, because Next.js or the plan changes them on purpose:

- `welcome` (`GET /`): Next.js serves the app page there. The health route moves to `GET /api/health`.
- `unknown route`: the Express message says `Route GET / not found` for every path (F12). The Next.js 404 message must name the real path.
- The cookie changes from `Max-Age=86400` (1 day) to 7 days (F4), and `SameSite=Lax` is written as `SameSite=lax`.
- Auth errors (401) now have `details: {}`. Express left `details` out for these.
- The `Authorization: Bearer` header is no longer accepted. The baseline does not use it.
