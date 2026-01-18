# Deployment Documentation

This folder contains all deployment-related documentation for Kevlify Authenticator.

## Quick Start

1. **[Render Blueprint Guide](render-blueprint.md)** - Deploy using Render's Blueprint feature (recommended)
2. **[Google OAuth Setup](auth-setup.md)** - Configure Google Sign-In
3. **[Post-Deployment Guide](post-deploy.md)** - Testing and maintenance after deployment
4. **[Frontend Configuration](frontend-config.md)** - Environment variables and build settings

## Deployment Options

### Option 1: Render Blueprint (Recommended)

The easiest way to deploy is using our `render.yaml` Blueprint:

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically create both services (backend + frontend)
4. Follow [render-blueprint.md](render-blueprint.md) for detailed instructions

### Option 2: Manual Deployment

For manual deployment to Render or other platforms:

1. Deploy backend as a Web Service (Node.js)
2. Deploy frontend as a Static Site (Vite build)
3. Configure environment variables
4. Set up database (PostgreSQL for production)

## Environment Variables

### Backend (Web Service)
```env
DATABASE_URL=postgresql://...           # PostgreSQL connection string
GOOGLE_CLIENT_ID=...                    # Google OAuth Client ID
GOOGLE_CLIENT_SECRET=...                # Google OAuth Client Secret
SESSION_SECRET=...                      # Random secret for sessions
NODE_ENV=production
PORT=10000
```

### Frontend (Static Site)
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=...              # Same as backend
```

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure backend CORS is configured to allow your frontend domain
- Check that `VITE_API_URL` includes `/api` suffix

**Authentication Not Persisting**
- Verify `SameSite=None` and `Secure=true` are set for production cookies
- Ensure `trust proxy` is enabled in Express

**Database Connection Errors**
- Verify `DATABASE_URL` is correctly formatted
- Check that SSL is enabled for cloud databases

See [post-deploy.md](post-deploy.md) for detailed troubleshooting steps.

## Additional Resources

- [Main README](../../README.md)
- [Architecture Documentation](../architecture.md)
- [API Documentation](../api.md)
- [Security Documentation](../security.md)
