# Architecture

This document describes the architecture of the Kevlify Authenticator application.

## Overview

Kevlify is a full-stack web application with:
- **Frontend**: React 18 + Vite SPA with Antigravity-inspired design
- **Backend**: Express.js REST API
- **Database**: SQLite (sql.js - pure JavaScript, no native dependencies)

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
├─────────────────────────────────────────────────────────────┤
│  React App (Vite)                                            │
│  ├── Pages                                                   │
│  │   ├── Landing (Home, About, Contact)                     │
│  │   ├── Auth (Login, Register)                             │
│  │   └── Protected (Authenticator, Settings)                │
│  ├── Components (Header, Modal, AccountBox, etc.)           │
│  ├── Context (AuthContext)                                   │
│  └── Utils                                                   │
│      ├── Encryption (Web Crypto API)                        │
│      └── Icons (300+ service brand icons)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      │ (Sessions with cookies)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Backend                       │
├─────────────────────────────────────────────────────────────┤
│  Middleware                                                  │
│  ├── auth.js (requireAuth, requireRole)                     │
│  ├── express-session (session management)                   │
│  └── helmet, cors, morgan                                   │
├─────────────────────────────────────────────────────────────┤
│  Routes                                                      │
│  ├── /api/auth (register, login, logout, me)                │
│  ├── /api/accounts (CRUD)                                   │
│  ├── /api/categories (CRUD)                                 │
│  ├── /api/backup (export, import)                           │
│  └── /api/admin (user management - admin only)              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database (sql.js)                  │
├─────────────────────────────────────────────────────────────┤
│  Tables                                                      │
│  ├── users (id, email, password_hash, role, created_at)     │
│  ├── accounts (id, user_id, issuer, secret_encrypted, ...)  │
│  └── categories (id, user_id, name, ranking, created_at)    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
1. User enters email/password
2. Frontend sends POST /api/auth/login
3. Backend validates credentials with bcryptjs
4. Backend creates session, stores userId/role in session
5. Frontend receives user data, updates AuthContext
6. Subsequent requests include session cookie (SameSite: lax)
7. Protected routes check auth status via AuthContext
```

### OTP Generation Flow

```
1. User views Authenticator page
2. Frontend fetches accounts from /api/accounts
3. For each account:
   a. Frontend uses secret_encrypted directly (stored as-is for now)
   b. Frontend generates TOTP code using otpauth library
   c. Code refreshes every second, countdown shows remaining time
4. User clicks account to copy code to clipboard
5. Dynamic icon loaded from /images/icons/{issuer}.png
```

### Icon Loading Flow

```
1. Account issuer name is normalized (lowercase, no spaces)
2. Frontend tries to load /images/icons/{normalized}.png
3. If icon exists (300+ available), it displays
4. If icon fails to load, falls back to Kevlify logo
```

### Encryption Flow (Future Enhancement)

```
Client-Side Encryption (Adding Account):
1. User enters secret key
2. User provides encryption password
3. Frontend derives AES key using PBKDF2 (100k iterations)
4. Frontend encrypts secret with AES-GCM
5. Encrypted data sent to backend
6. Backend stores encrypted blob (cannot decrypt)

Client-Side Decryption (Viewing):
1. User provides encryption password
2. Frontend derives same AES key
3. Frontend decrypts stored secret
4. Frontend generates OTP codes
```

## Security Layers

1. **Transport**: HTTPS (required in production)
2. **Authentication**: Session-based with secure cookies (SameSite: lax)
3. **Authorization**: Role-based (admin/user) via middleware
4. **Password Storage**: bcryptjs (12 rounds)
5. **Secret Storage**: Client-side AES-GCM encryption (optional)
6. **Headers**: Helmet.js for security headers
7. **Input Validation**: express-validator on all inputs

## File Organization

### Frontend (`client/src/`)
- `pages/` - Route components (7 pages)
  - `Home.jsx` - Landing page (redirects if logged in)
  - `About.jsx` - Features and security info
  - `Contact.jsx` - Team information
  - `Login.jsx`, `Register.jsx` - Authentication
  - `Authenticator.jsx` - Main 2FA dashboard
  - `Settings.jsx` - User settings, backup/restore
- `components/` - Reusable UI components
  - `Header.jsx`, `Footer.jsx` - Layout
  - `Modal.jsx`, `Spinner.jsx` - UI utilities
  - `AccountBox.jsx` - OTP display card
  - `AddAccountForm.jsx`, `QRScanner.jsx` - Account adding
  - `ErrorBoundary.jsx` - Error handling
- `context/` - React contexts
  - `AuthContext.jsx` - Global auth state
- `services/` - API client
  - `api.js` - Fetch wrapper with credentials
- `utils/` - Utilities
  - `encryption.js` - Web Crypto API helpers
  - `icons.js` - Dynamic icon loading
- `styles/` - CSS files
  - `variables.css` - CSS custom properties
  - `main.css` - Global styles, animations
  - `components.css` - Component styles
  - `pages.css` - Page-specific styles
  - `landing.css` - Landing page styles

### Backend (`server/`)
- `server.js` - Express app setup
- `routes/` - API route handlers
  - `auth.js` - Authentication endpoints
  - `accounts.js` - Account CRUD
  - `categories.js` - Category CRUD
  - `backup.js` - Export/import
  - `admin.js` - Admin-only endpoints
- `middleware/` - Middleware functions
  - `auth.js` - requireAuth, requireRole
- `db/` - Database
  - `database.js` - sql.js initialization

### Assets (`client/public/`)
- `images/icons/` - 300+ service brand icons (PNG)
- `images/logos/` - Kevlify logos

## Design System

### Colors (CSS Variables)
- `--color-primary`: #3b82f6 (Blue)
- `--color-bg-dark`: #0a0e1a
- `--color-bg-card`: #111827
- `--color-text-primary`: #ffffff
- `--color-text-accent`: #60a5fa

### Animations
- Scroll-reveal: Elements fade in as they enter viewport
- Hover effects: Cards lift and glow on hover
- Transitions: 0.15s-0.4s ease timing
