# Deployment Quick Reference

## ✅ Your Code is Already Configured!

Your frontend is already set up to use `VITE_API_URL` for production deployments.

### How It Works

1. **`client/src/services/api.js`**:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_URL || '/api';
   ```
   - In **development**: Uses `/api` (proxied by Vite to `localhost:3001`)
   - In **production**: Uses the full backend URL from `VITE_API_URL`

2. **All API calls** go through this centralized service, so one environment variable controls everything.

### What You Need to Do on Render

1. Go to your **`kevlify-client`** Static Site on Render
2. Go to **Environment** tab
3. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://kevlify-backend.onrender.com` (your actual backend URL)
4. Save (triggers rebuild)

That's it! No code changes needed.

### Local Development

Copy `.env.example` to `.env` and leave `VITE_API_URL` blank:
```bash
cp .env.example .env
```

The proxy in `vite.config.js` will automatically forward requests to your local backend.
