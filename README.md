# Kevlify Authenticator

A secure, open-source two-factor authentication (2FA) web application with Google OAuth, client-side encryption, and encrypted backups.

![Kevlify Logo](client/public/images/logos/logo.png)

## Features

- **🔐 Google OAuth** - Sign in with your Google account (no password required)
- **TOTP/HOTP Support** - Compatible with most 2FA providers
- **Client-Side Encryption** - Secrets encrypted in your browser using AES-256-GCM
- **🔒 Encrypted Backups** - Export `.authpro` files with password-based encryption (PBKDF2 + AES-GCM)
- **🔑 PIN/Password Gate** - Optional UI lock for additional security
- **QR Code Scanning** - Add accounts by scanning QR codes with your camera
- **300+ Service Icons** - Automatic brand icon matching for popular services
- **Theme System** - Choose between Light, Dark, or System Default themes
- **Categories** - Organize accounts into custom categories
- **Advanced Management** - Search, edit, and categorize your accounts easily
- **Scroll Animations** - Smooth reveal animations throughout the app
- **Role-Based Access** - Admin and user roles with different permissions
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite |
| Backend | Express.js |
| Database | SQLite (sql.js) |
| OTP Generation | otpauth |
| QR Scanning | html5-qrcode |
| Encryption | Web Crypto API (AES-GCM + PBKDF2) |
| Password Hashing | bcryptjs |
| Testing | Playwright |
| Deployment | Render |

## Quick Start

For detailed installation, configuration, and deployment instructions, please read [SETUP.md](SETUP.md).

```bash
# Quick Setup
npm run install:all
cp .env.example .env
npm run dev
```

## Project Structure

```
kevlify-authenticator/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components (Header, Footer, Modal, etc.)
│   │   ├── pages/          # Page components (Home, About, Authenticator, etc.)
│   │   ├── context/        # React contexts (AuthContext)
│   │   ├── services/       # API client
│   │   ├── utils/          # Encryption, icon utilities
│   │   └── styles/         # CSS files (variables, main, components, landing)
│   └── public/
│       └── images/
│           ├── icons/      # 300+ service brand icons
│           └── logos/      # Kevlify logos
├── server/                 # Express backend
│   ├── routes/             # API routes (auth, accounts, categories, backup, admin)
│   ├── middleware/         # Auth middleware with role support
│   └── db/                 # SQLite database (sql.js)
├── tests/                  # Playwright E2E tests
├── docs/                   # Documentation
│   ├── architecture.md     # System architecture
│   ├── api.md              # API documentation
│   └── security.md         # Security details
└── render.yaml             # Render deployment config
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features (redirects to `/app` if logged in) |
| About | `/about` | About Kevlify, features, security info |
| Contact | `/contact` | Team information and values |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Authenticator | `/app` | Main 2FA dashboard (protected) |
| Settings | `/settings` | User settings, backup/restore (protected) |

## API Endpoints

See [docs/api.md](docs/api.md) for full API documentation.

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Accounts
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Backup
- `GET /api/backup/export` - Export backup
- `POST /api/backup/import` - Import backup

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## Testing

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui
```

## Deployment to Render

This project is ready for deployment on [Render](https://render.com).

See [SETUP.md](SETUP.md#deployment-render) for full deployment instructions.

## Security

See [docs/security.md](docs/security.md) for detailed security information.

- **Password Hashing**: bcryptjs with 12 rounds
- **Session Management**: Secure, HTTP-only, SameSite cookies
- **Client-Side Encryption**: AES-256-GCM with PBKDF2 key derivation (100k iterations)
- **Role-Based Access Control**: Admin and user roles
- **Zero-Knowledge Architecture**: Server cannot decrypt your secrets

## Design

The UI is inspired by [Google Antigravity](https://antigravity.google/) featuring:
- Full-width hero sections with gradient backgrounds
- Scroll-reveal animations
- Numbered feature cards
- Modern, clean typography
- Blue accent color palette (#3b82f6)

## 🚀 Deployment

For production deployment to GitHub and Render:

1. **Prepare for Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step guide
2. **Configure Google OAuth**: Follow [AUTH_SETUP.md](AUTH_SETUP.md) to set up Google credentials
3. **Deploy to Render**: Push to GitHub and configure Render services
4. **Post-Deployment**: Follow [POST_DEPLOY.md](POST_DEPLOY.md) for testing and management

**Quick Deployment Checklist:**
- [ ] Push to GitHub repository
- [ ] Deploy backend (Express) to Render Web Service
- [ ] Deploy frontend (React) to Render Static Site
- [ ] Configure environment variables
- [ ] Set up persistent disk for SQLite database
- [ ] Update Google OAuth authorized origins
- [ ] Test deployed application

## Authors

- **B C H Benjamin** - Developer
- **C Yogeetha** - Developer

Built at Atria Institute of Technology.

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.
