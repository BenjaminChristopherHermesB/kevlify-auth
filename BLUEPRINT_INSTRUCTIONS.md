# 🎛️ Render Blueprint Deployment

You asked for a **terminal-based way** to control Render. This is it.

I have created a `render.yaml` file (Infrastructure as Code). This file tells Render exactly how to build and link your services.

## How to Apply Fixes

1. **Commit & Push**:
   ```bash
   git add .
   git commit -m "Fix deployment: Add render.yaml blueprint and remove static serving"
   git push
   ```

2. **Go to Render Dashboard**:
   - Click **Blueprints** tab (top menu).
   - Click **New Blueprint Instance**.
   - Connect your `kevlify-auth` repo.
   - Click **Approve**.

Render will indiscriminately wipe your old broken services and spin up two perfect new ones (Backend + Frontend) defined by the code I just wrote.

## What This Fixes

1. **Auto-Discovery**: Backend URL is automatically injected into Frontend as `VITE_API_URL`.
2. **Auto-Discovery**: Frontend URL is automatically injected into Backend as `CORS_ORIGINS`.
3. **SPA Routing**: The `render.yaml` file defines the rewrite rule (`/* -> /index.html`) so you don't have to click around.
4. **Separation of Concerns**: Backend no longer tries to serve frontend files (fixing the `ENOENT` error).

## Critical: Secrets
Render cannot guess your secrets. After the Blueprint creates the services, go to the dashboard and ensure these values are set in the **Environment** tabs:
- `DATABASE_URL` (Neon/Supabase connection string)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
