# Bookmarked

A personal tracker for the books you read and the movies you watch. Add titles, rate them, filter and search your library, and see your totals on a dashboard. An optional AI search suggests books and movies from a short prompt.

It is one Next.js 16 app. The pages and the API (`/api/*`) live in the same project, so it deploys to Vercel as one project.

## Stack

- Next.js 16 (App Router, Route Handlers), React 19, TypeScript
- MongoDB with Mongoose
- Cookie session (signed JWT, `httpOnly`), `bcryptjs` for passwords
- Tailwind CSS 3, shadcn/ui, TanStack Query, React Hook Form, Zod
- Three.js for the quiet background scene on the login, register, and dashboard pages
- Vitest and `mongodb-memory-server` for tests

## Run it locally

You need Node 20.9 or later (`.nvmrc` says 22), Yarn 1, and a MongoDB database. A local `mongod` or a free Atlas cluster both work.

```bash
yarn install
cp .env.example .env.local   # then edit it
yarn dev
```

Open http://localhost:3000. Set these in `.env.local`:

| Variable | Needed | What it is |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | At least 32 characters. `openssl rand -base64 48` makes one. |
| `OPENAI_API_KEY` | no | Turns on AI search. Without it, AI search answers 503. |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o` |

## Scripts

```bash
yarn dev          # development server
yarn build        # production build
yarn start        # serve the production build
yarn type-check   # TypeScript check
yarn lint         # ESLint
yarn test         # Vitest (set MONGOMS_SYSTEM_BINARY to use a local mongod)
```

## API

All routes are under `/api` and return `{ success, message, data?, error?, timestamp }`. The session cookie is `accessToken`.

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/health` | GET | Database status, 503 when it is down |
| `/api/auth/register` | POST | Creates the user and signs in |
| `/api/auth/login` | POST | Rate limited: 10 tries per 15 minutes per address |
| `/api/auth/logout` | POST | Always clears the cookie |
| `/api/auth/profile` | GET | |
| `/api/users/update-profile` | PUT | |
| `/api/users/change-password` | POST | |
| `/api/users/deactivate` | POST | |
| `/api/books` | GET, POST | List with filters and pagination, create |
| `/api/books/[id]` | GET, PUT, DELETE | |
| `/api/books/authors` | GET | |
| `/api/books/stats` | GET | |
| `/api/movies` | GET, POST | Same shape as books |
| `/api/movies/[id]` | GET, PUT, DELETE | |
| `/api/movies/stats` | GET | |
| `/api/openai/search` | POST | Rate limited: 20 per hour per user |

Any other `/api/*` path returns a JSON 404.

## Project layout

See `CLAUDE.md` for the folder map and the coding rules. The migration plan, with every decision, is in `docs/plans/nextjs-migration.md`.

## Deploy

See `deployment.md`.

## License

MIT
