# Authentication Setup Guide

This guide explains how to set up and use **Google OAuth 2.0** and **PIN/Password Gate** features in the Kevlify Authenticator project.

---

## Table of Contents

- [Google OAuth 2.0 Setup](#google-oauth-20-setup)
- [Backend Integration](#backend-integration)
- [Frontend Integration](#frontend-integration)
- [Dynamic Configuration](#dynamic-configuration)
- [PIN/Password Gate](#pinpassword-gate)
- [Backup & Restore](#backup--restore)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Google OAuth 2.0 Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. Choose **Web application** as the application type
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (for local development)
   - `https://kevlify.onrender.com` (for production)
7. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (for local development)
   - `https://kevlify.onrender.com` (for production)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

> **Note**: You can add multiple origins and redirect URIs to support both local and production environments.

### Step 2: Enable Google OAuth API

1. In the Google Cloud Console, navigate to **APIs & Services > Library**
2. Search for "Google+ API" or "People API"
3. Click **Enable**

---

##Backend Integration

### Environment Variables

Add the following environment variables to your `server/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,https://kevlify.onrender.com
```

### Backend Routes

The Google OAuth route is already implemented in `server/routes/google-auth.js`:

- **POST `/api/auth/google`** - Verifies Google ID token and creates/logs in user

### How It Works

1. User clicks "Sign in with Google" button
2. Google Identity Services SDK handles OAuth flow in the browser
3. Google returns an ID token (JWT)
4. Frontend sends ID token to `/api/auth/google`
5. Backend verifies token using `google-auth-library`
6. Backend creates a new user (if first time) or logs in existing user
7. Backend sets session cookie
8. User is authenticated

### Database Schema

The `users` table includes OAuth support:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- nullable for OAuth users
  oauth_provider TEXT DEFAULT 'local' CHECK(oauth_provider IN ('local', 'google')),
  google_id TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Integration

### Environment Variables

Create `client/.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Google Identity Services SDK

The Login page (`client/src/pages/Login.jsx`) automatically loads the Google Identity Services SDK and initializes it:

```jsx
useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
        if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
            );
        }
    };
}, []);
```

### AuthContext

The `AuthContext` (`client/src/context/AuthContext.jsx`) includes a `loginWithGoogle` method:

```jsx
async function loginWithGoogle(credential) {
    const response = await api.post('/auth/google', { credential });
    setUser(response.user);
    return response;
}
```

---

## Dynamic Configuration

### How It Works

The application **automatically detects** the current origin using `window.location.origin` and uses it for:

- **CORS**: Backend accepts requests from origins listed in `CORS_ORIGINS` environment variable
- **Google OAuth**: Frontend SDK uses current origin for redirect URIs

### No Hardcoding Required

You don't need to manually configure URLs for different environments. The app dynamically adapts based on:

- **Local development**: `http://localhost:5173`
- **Production**: `https://kevlify.onrender.com`

### Example: CORS Configuration

Server (`server/server.js`):

```javascript
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173'];
    
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
```

---

## PIN/Password Gate

### What Is It?

The PIN/password gate is a **local UI lock** that prevents casual access to your OTP codes. It is **NOT used for encryption**.

> **Important**: The PIN is stored as a SHA-256 hash in `localStorage`. It does NOT encrypt your data. Encryption uses your main account password.

### How to Set Up a PIN

1. Log in to your account
2. Navigate to **Settings**
3. Scroll to "PIN Lock" section
4. Click **"Set PIN"**
5. Enter a 4-8 digit PIN
6. Confirm your PIN
7. Click **"Set PIN"**

### How It Works

- **PIN Storage**: Hashed using SHA-256 and stored in `localStorage`
- **UI Lock**: When locked, the authenticator page shows a PIN unlock modal
- **Session Persistence**: Lock state persists across browser sessions

### Lock/Unlock Flow

1. Set a PIN in Settings
2. Click "Lock" button in the Authenticator page header
3. Page is locked - OTP codes are hidden
4. Enter your PIN to unlock
5. Access restored

### Clear PIN

To remove the PIN lock:

1. Go to **Settings**
2. Click **"Remove PIN"**
3. Confirm the action

---

## Backup & Restore

### Why Backups Are Critical

Your **encryption keys** are stored locally in your browser. If you:

- Clear browser data
- Switch browsers
- Use a different device

...you will **lose access to your OTP secrets** unless you have a backup.

### How to Create a Backup

1. Log in to Kevlify Authenticator
2. Navigate to **Settings**
3. Scroll to "Backup & Restore" section
4. Click **"Export Backup"**
5. Save the JSON file securely

> The backup file contains encrypted OTP data. You'll need your **main password** to restore it.

### How to Restore from Backup

#### Option 1: From Login Page

1. Navigate to `/login`
2. Click **"Restore from Backup"** link
3. Upload your backup JSON file
4. Enter your main password
5. Your account and OTPs will be restored

#### Option 2: From Settings

1. Log in (if you still have access)
2. Navigate to **Settings**
3. Click **"Import Backup"**
4. Upload backup file
5. Confirm import

### Backup Metadata

Backups include:

- `backup_date`: Timestamp of backup creation
- `user_email`: Email associated with the backup
- `version`: Backup format version
- `accounts`: Encrypted OTP accounts
- `categories`: Custom categories

---

## Testing

### Local Testing

1. **Set up environment variables**:
   ```bash
   # Server
   cd server
   cp ../.env.example .env
   # Add your Google credentials
   
   # Client
   cd ../client
   cp .env.example .env
   # Add your Google Client ID
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

3. **Test Google OAuth**:
   - Navigate to `http://localhost:5173/login`
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify redirect to `/app`
   - Check that user is created in database

4. **Test PIN Lock**:
   - Navigate to Settings
   - Set a PIN
   - Go to Authenticator page
   - Click "Lock" button
   - Verify PIN unlock modal appears
   - Enter correct PIN - verify unlock
   - Enter incorrect PIN - verify error

5. **Test Backup/Restore**:
   - Add 2-3 OTP accounts
   - Create a backup
   - Clear `localStorage`
   - Restore from backup using login page

---

## Deployment

### Deploy to Render

1. **Push code to GitHub**

2. **Create a new Web Service** on [Render](https://render.com)

3. **Connect your repository**

4. **Configure build settings**:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`

5. **Add environment variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   SESSION_SECRET=<generate using: openssl rand -base64 32>
   DATABASE_PATH=./data/kevlify.db
   CORS_ORIGINS=https://kevlify.onrender.com
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

6. **Deploy**

7. **Update Google OAuth credentials**:
   - Add `https://your-app.onrender.com` to authorized origins and redirect URIs

### Environment-Specific Notes

- **HTTPS**: Render provides HTTPS by default (required for secure cookies and camera access)
- **Session Cookies**: Configured to use `secure: true` in production
- **SameSite**: Set to `'lax'` for cross-site compatibility

---

## Troubleshooting

### Google Sign-In Button Not Appearing

**Cause**: Missing `VITE_GOOGLE_CLIENT_ID` environment variable

**Solution**:
1. Create `client/.env` file
2. Add `VITE_GOOGLE_CLIENT_ID=your-client-id`
3. Restart development server

---

### Google OAuth Error: "Invalid Client"

**Cause**: Client ID mismatch or unauthorized origin

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` matches Google Cloud Console
2. Ensure current origin is added to "Authorized JavaScript origins"
3. Check for typos in environment variables

---

### PIN Lock Not Working

**Cause**: Browser does not support `crypto.subtle` (requires HTTPS in production)

**Solution**:
- Use HTTPS in production (Render provides this)
- Use `http://localhost` (not `http://127.0.0.1`) in development

---

### Session Not Persisting

**Cause**: Cookie settings or CORS misconfiguration

**Solution**:
1. Ensure `CORS_ORIGINS` includes your frontend origin
2. Check `credentials: true` in CORS config
3. Verify `httpOnly: true` and `sameSite: 'lax'` in session config

---

### Lost Access After Clearing Browser Data

**Cause**: Encryption keys stored locally were cleared

**Solution**:
1. Use "Restore from Backup" on login page
2. Upload backup file
3. Enter main password
4. Access will be restored

---

## Security Best Practices

### 1. Google OAuth

- ✅ ID tokens are verified server-side using `google-auth-library`
- ✅ Google ID is stored separately from email
- ✅ Tokens are never stored - only session cookies are used

### 2. PIN Lock

- ✅ PIN is hashed using SHA-256 before storage
- ✅ PIN is stored in `localStorage` (not sent to server)
- ✅ PIN is UI-only - does NOT encrypt data
- ❌ **Do not** rely on PIN for security - it's only a convenience lock

### 3. Encryption

- ✅ OTP secrets are encrypted using main password
- ✅ Encryption happens client-side (Web Crypto API)
- ✅ Server cannot decrypt secrets (zero-knowledge architecture)
- ❌ **Do not** forget your main password - it cannot be recovered

### 4. Backups

- ✅ Create backups regularly
- ✅ Store backups securely (encrypted file)
- ✅ Test restore process periodically
- ❌ **Do not** share backup files - they contain encrypted data

### 5. Session Management

- ✅ Sessions expire after 24 hours
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ SameSite cookies prevent CSRF attacks
- ❌ **Do not** share session cookies

---

## Summary

- **Google OAuth**: Enables sign-in with Google account
- **PIN Lock**: Local UI gate for convenience (not encryption)
- **Backup/Restore**: Critical for data recovery
- **Dynamic Config**: Automatic environment detection
- **Zero-Knowledge**: Server cannot decrypt your OTP secrets

For questions or issues, please refer to the main [README.md](README.md) or contact the development team.
