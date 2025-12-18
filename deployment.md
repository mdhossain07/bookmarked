# Bookmarked Deployment Guide (Vercel)

This guide outlines the steps to deploy the **Bookmarked** application (Frontend and Backend) to Vercel.

## 1. Prerequisites

- A [Vercel Account](https://vercel.com/signup).
- Your code pushed to a Git provider (GitHub/GitLab/Bitbucket).

## 2. Preparation (Monorepo Setup)

This project is a monorepo. We will deploy it as **two separate Vercel projects** linked to the same repository.

### Done for you:

I have already created the necessary files to make the backend Vercel-compatible:

- `backend/api/index.ts`: Entry point for Serverless Functions.
- `backend/vercel.json`: Configuration to rewrite requests to the API.

## 3. Deployment Steps

### Step A: Deploy Backend

1.  Go to your Vercel Dashboard and click **Add New > Project**.
2.  Import your `bookmarked` repository.
3.  Configure the project as follows:
    - **Project Name**: `bookmarked-backend` (suggested)
    - **Framework Preset**: Other
    - **Root Directory**: Click `Edit` and select `backend`.
    - **Build Command**: `cd .. && yarn install --production=false && yarn workspace bookmarked-types build && cd backend && yarn build`
      > _Note: This ensures the shared types package is built before the backend._
    - **Output Directory**: Leave empty / default (Do **NOT** set to `dist`).
    - **Install Command**: `yarn install` (or leave default if it detects yarn)
4.  **Environment Variables**:
    Add the variables from your `backend/.env` file. These are critical:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `OPENAI_API_KEY`
    - `NODE_ENV` (set to `production`)
    - `APP_PORT` (optional, can be ignored as Vercel handles ports)
    - `CORS_ORIGIN` (Set to your _future_ frontend URL, e.g., `https://bookmarked-frontend.vercel.app`)
5.  Click **Deploy**.

### Step B: Deploy Frontend

1.  Go to Vercel Dashboard and click **Add New > Project** (again).
2.  Import the **same** `bookmarked` repository.
3.  Configure the project:
    - **Project Name**: `bookmarked-frontend`
    - **Framework Preset**: Vite (should be auto-detected)
    - **Root Directory**: Click `Edit` and select `frontend`.
    - **Build Command**: Leave default (`vite build` or `npm run build`).
    - **Output Directory**: Leave default (`dist`).
4.  **Environment Variables**:
    - `VITE_API_URL`: Set this to your **Backend URL** from Step A (e.g., `https://bookmarked-backend.vercel.app/api`).
5.  Click **Deploy**.

## 4. Post-Deployment

1.  **Update CORS**: Once the Frontend is deployed, go back to the **Backend Project Settings > Environment Variables** and update `CORS_ORIGIN` to match your actual Frontend URL (e.g., `https://bookmarked-frontend-xyza.vercel.app`). Redeploy the backend for changes to take effect.
2.  **Verify**: Visit your frontend URL. It should load and successfully communicate with the backend.
