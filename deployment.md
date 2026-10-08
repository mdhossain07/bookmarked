# Deploy to Vercel

Bookmarked is one Next.js project. You create one Vercel project and one MongoDB Atlas database.

## 1. Before you start

- A Vercel account and a Git provider with this repository.
- A MongoDB Atlas cluster. Note its region.
- An OpenAI API key, if you want AI search. It is optional.

## 2. Atlas

1. Create a database user with a strong password.
2. Open Network Access. Vercel has no fixed IP addresses on the Hobby plan, so add `0.0.0.0/0`. The strong password is your protection. You can also use the MongoDB Atlas integration from the Vercel Marketplace.
3. Copy the connection string. Add a database name, for example `.../bookmarked?retryWrites=true&w=majority`.
4. Use a different database name for Preview, for example `bookmarked-preview`.

## 3. Vercel project

1. Click **Add New > Project** and import the repository.
2. Keep **Root Directory** as the repository root and **Framework Preset** as Next.js. Keep the default build command.
3. Add these environment variables for Production and Preview:
   - `MONGODB_URI`
   - `JWT_SECRET` (at least 32 characters, a different value for each environment)
   - `OPENAI_API_KEY` (optional)
   - `OPENAI_MODEL` (optional)
4. Open **Settings > Functions** and set the function region to the one nearest to your Atlas cluster.
5. Click **Deploy**.

There is no `vercel.json` and no CORS setting. The pages and the API share one origin.

## 4. After the first deploy

1. Open `/api/health` on the deployment URL. It must answer 200 with `"db": "connected"`. A 503 means that the app cannot reach Atlas, so check the network access list and `MONGODB_URI`.
2. Register a user, add a book, log out, and log in again.
3. If you set `OPENAI_API_KEY`, try AI search. Without it, the page shows a clear message.

## 5. Moving from the old two-project setup

The old setup had `bookmarked-backend` and `bookmarked-frontend`. After the new project works, delete both old projects in the Vercel dashboard. The old `VITE_API_URL` and `CORS_ORIGIN` variables are not used any more.

## Troubleshooting

- **Build says `Invalid environment variables`:** a variable is missing or too short. The message names it.
- **Login works, then you return to the login page:** the cookie is `secure` in production, so use the HTTPS URL.
- **AI search is slow:** the function can run up to 60 seconds (`maxDuration`).
