# 🎛️ Render Blueprint Deployment

You asked for a **terminal-based way** to control Render. This is it.

I have created a `render.yaml` file (Infrastructure as Code). This file tells Render exactly how to build and link your services.

## Why Manual Entry?
GitHub blocked the push because `render.yaml` contained secrets. This is a security feature. 
So, `render.yaml` now has placeholders (`sync: false`), and Render will ask you for the values.

## Steps to Deploy

1. **Commit & Push**:
   ```bash
   git add .
   git commit -m "Add render.yaml configuration"
   git push
   ```

2. **Go to Render Dashboard**:
   - Click **Blueprints** -> **New Blueprint Instance**.
   - Select `kevlify-auth`.

3. **Fill in the Secrets**:
   Render will show a form asking for:
   - `DATABASE_URL` (Use your Neon connection string)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `VITE_GOOGLE_CLIENT_ID`

4. Click **Apply Changes**.
