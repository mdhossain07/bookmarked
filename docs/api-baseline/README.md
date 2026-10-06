# API baseline

`express.json` records how the Express API answers 66 requests. `nextjs.json` records the same requests against the Next.js API. Phase 3 of the [migration plan](../plans/nextjs-migration.md) runs the same requests against the Next.js API and compares the two files.

## How it was recorded

Recorded on 2026-10-06 from `main` at commit `3a69590`, against an empty local MongoDB.

The Express code is not in the tree after Phase 5. To record it again, use a worktree of that commit.

1. Start an empty MongoDB, for example on port 27027.
2. Make a worktree of the recorded commit and install its packages:

   ```bash
   git worktree add ../bookmarked-express 3a69590
   ```

   ```bash
   cd ../bookmarked-express && yarn install
   ```

3. Start the Express API on port 3099 with test values:

   ```bash
   cd ../bookmarked-express/backend && NODE_ENV=production PORT=3099 MONGODB_URI=mongodb://127.0.0.1:27027/bookmarked-baseline JWT_SECRET=baseline-test-secret-not-real-0123456789 OPENAI_API_KEY=sk-baseline-invalid npx tsx src/server.ts
   ```

4. In this repository, run the script and save the output:

   ```bash
   BASE_URL=http://localhost:3099 node scripts/api-baseline.mjs > docs/api-baseline/express.json
   ```

The script replaces IDs, dates, and cookie values with placeholders, so two runs on an empty database give the same file. No request calls OpenAI.

## How Phase 3 uses it

1. Run the script against the Next.js app on an empty database, and save it as `nextjs.json`.
2. Compare the files with `diff docs/api-baseline/express.json docs/api-baseline/nextjs.json`.
3. Each difference must be one of these:
   - A case with a `bug` field. The fix in the plan changes that result on purpose.
   - A route that the plan removes (decision D3). The Next.js answer depends on the path:
     - An unknown path gives 404.
     - A path that exists, but without that method, gives 405.
     - A path in the form `/api/books/<id>`, for example `/api/books/search`, gives 400.
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
| `movies: stats` | F14 | `total: 0` with one movie | `total: 1` |

## Known differences

These are allowed, because Next.js or the plan changes them on purpose:

- `welcome` (`GET /`): Next.js serves the app page there. The health route moves to `GET /api/health`.
- `unknown route`: the Express message says `Route GET / not found` for every path (F12). The Next.js 404 message must name the real path.
- The cookie changes from `Max-Age=86400` (1 day) to 7 days (F4), and `SameSite=Lax` is written as `SameSite=lax`.
- Auth errors (401) now have `details: {}`. Express left `details` out for these.
- The `Authorization: Bearer` header is no longer accepted. The baseline does not use it.
- A bad book or movie ID gives the standard validation error, with "Invalid ID format" (F13).
- `openai search: no prompt` gives the standard validation error.
- `login: deactivated, wrong password` says "Invalid email or password" (S3).
- After the duplicate fix (S1), the second "Who Framed Roger Rabbit?" is not created, so later book lists and stats have one book fewer.
- JSON key order can differ. The comparison counts these cases as different, but the values are the same.

## Result for Next.js (Phase 3)

27 of 66 cases are the same. Each of the other 39 cases matches a row above: a planned fix, a removed route, or a known difference. Two runs on empty databases give the same `nextjs.json`.
