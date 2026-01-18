# Deployment & Operations Guide for Kevlify Authenticator

This master guide covers everything from uploading your code to GitHub, deploying to Render, and managing the live application.

---

## 📋 Table of Contents

1. [Part 1: GitHub Setup](#part-1-github-setup) (Repo creation & Collaborators)
2. [Part 2: Render Deployment](#part-2-render-deployment) (Backend & Frontend)
3. [Part 3: Post-Deployment Config](#part-3-post-deployment-config) (Environment variables)
4. [Part 4: Operations & Maintenance](#part-4-operations--maintenance) (Updates, Backups, Troubleshooting)

---

## Part 1: GitHub Setup

### 1.1 Create Repository

1. Log in to [GitHub](https://github.com).
2. Click the **+** icon in the top right -> **New repository**.
3. **Repository name**: `kevlify-auth`
4. **Description**: Secure 2FA authenticator with Google OAuth and encrypted backups.
5. **Visibility**: Select **Private** (recommended) or Public.
6. **Initialize**: Do **NOT** check any boxes (README, .gitignore, License). We have these.
7. Click **Create repository**.

### 1.2 Push Code to GitHub

Open your local terminal in the project folder and run:

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add all files
git add .
git commit -m "Initial commit: Production ready Kevlify Authenticator"

# 3. Connect to your new repo
git remote add origin https://github.com/BenjaminChristopherHermesB/kevlify-auth.git

# 4. Rename branch to main
git branch -M main

# 5. Push code
git push -u origin main
```

### 1.3 Add Collaborator (Your Friend)

1. Go to your `kevlify-auth` repository on GitHub.
2. Click **Settings** (top tabs).
3. On the left sidebar, click **Collaborators**.
4. Click **Add people**.
5. Enter your friend's **GitHub username** or **email**.
6. Select them and click **Add to this repository**.
7. Send them the invite link (or they can accept via email).

---

## Part 2: Render Deployment

You will create two services on [Render](https://dashboard.render.com): one for the backend (API) and one for the frontend (React).

### 2.1 Backend Deployment (Web Service)

1. Click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Connect your GitHub account and select `kevlify-auth`.
4. **Configure Service**:
   - **Name**: `kevlify-backend`
   - **Region**: Closest to you (e.g., Oregon, Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `server` (Important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter).

5. **Environment Variables** (Advanced -> Add Environment Variable):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `SESSION_SECRET` | *Generate a random string (e.g. `openssl rand -base64 32`)* |
   | `DATABASE_PATH` | `./data/kevlify.db` |
   | `CORS_ORIGINS` | `https://kevlify-client.onrender.com` (Update after deploying frontend) |
   | `GOOGLE_CLIENT_ID` | *From your client_secret.json* |
   | `GOOGLE_CLIENT_SECRET` | *From your client_secret.json* |

6. **Persistent Disk** (Crucial for Database):
   - Scroll to **Disks**.
   - Click **Add Disk**.
   - **Name**: `kevlify-db`
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: 1 GB.

7. Click **Create Web Service**.

### 2.2 Frontend Deployment (Static Site)

1. Click **New +** -> **Static Site**.
2. Select `kevlify-auth` repo.
3. **Configure Service**:
   - **Name**: `kevlify-client`
   - **Branch**: `main`
   - **Root Directory**: `client` (Important!)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_GOOGLE_CLIENT_ID` | *Your Google Client ID* |

5. Click **Create Static Site**.

---

## Part 3: Post-Deployment Config

### 3.1 Connect Frontend to Backend

1. **Update Backend CORS**:
   - Go to `kevlify-backend` on Render dashboard.
   - Go to **Environment**.
   - Edit `CORS_ORIGINS` to match your actual frontend URL (e.g., `https://kevlify-client.onrender.com`).
   - Saving triggers a redeploy.

2. **Configure Frontend Rewrite** (To make API calls work):
   - Go to `kevlify-client` on Render.
   - Go to **Redirects/Rewrites**.
   - Add new rule:
     - **Source**: `/api/*`
     - **Destination**: `https://kevlify-backend.onrender.com/api/:splat` (Use your actual backend URL)
     - **Status**: `200` Rewrite
   - Add another rule for SPA routing:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Status**: `200` Rewrite

### 3.2 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. APIs & Services -> Credentials -> Your OAuth 2.0 Client.
3. Update **Authorized JavaScript origins**:
   - Add: `https://kevlify-client.onrender.com` (Your frontend URL)
4. Update **Authorized redirect URIs**:
   - Add: `https://kevlify-client.onrender.com`
5. Save.

---

## Part 4: Operations & Maintenance

### 🧪 Verifying Deployment

1. **Visit Frontend URL**: Ensure site loads.
2. **Test Register/Login**: Creates user in DB.
3. **Test Google Sign-In**: Pop-up should work and redirect correctly.
4. **Test Backups**: Settings -> Export Backup (try Encrypted .authpro).

### 🔄 Making Updates

When you or your collaborator want to update the app:

1. **Make changes locally**.
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Updates"
   git push origin main
   ```
3. **Auto-Deploy**: Render detects the push and redeploys automatically.

### 💾 Backups

- **Database**: The SQLite DB is on the persistent disk. It survives redeployments.
- **Manual Backup**: Use the "Export Encrypted Backup" feature in the app regularly.

### 🐛 Troubleshooting

- **"Not Found" on Refresh**: Ensure the `/*` -> `/index.html` rewrite rule is set on the Frontend.
- **CORS Error**: Check `CORS_ORIGINS` in Backend env vars matches Frontend URL *exactly* (no trailing slash).
- **Google "Invalid Client"**: Check Google Console authorized origins and `VITE_GOOGLE_CLIENT_ID`.
- **Database Resetting**: Ensure Persistent Disk is mounted at `/opt/render/project/src/server/data`.

---

**Last Updated**: January 2026
