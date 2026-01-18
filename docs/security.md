# Security

This document explains the security measures implemented in Kevlify Authenticator.

## Overview

Kevlify uses a defense-in-depth approach with multiple security layers:

1. Client-side encryption for secrets
2. Secure password hashing
3. Session-based authentication
4. Role-based access control
5. Input validation
6. Security headers

## Client-Side Encryption

### Why Client-Side?

Your 2FA secrets are encrypted **in your browser** before being sent to the server. This means:
- The server never sees your unencrypted secrets
- Even if the database is compromised, secrets remain protected
- You control access with your encryption password

### How It Works

```javascript
// Key Derivation
PBKDF2(password, salt, {
  iterations: 100000,
  hash: 'SHA-256',
  keyLength: 256
}) → AES Key

// Encryption
AES-GCM(plaintext, key, iv) → ciphertext + tag

// Storage Format
base64(salt || iv || ciphertext || tag)
```

**Algorithm Details:**
| Component | Specification |
|-----------|---------------|
| Key Derivation | PBKDF2 with SHA-256 |
| Iterations | 100,000 |
| Encryption | AES-256-GCM |
| Salt Length | 16 bytes |
| IV Length | 12 bytes |
| Tag Length | 16 bytes |

### Important Notes

- **Encryption password is not stored** - if you forget it, encrypted data cannot be recovered
- Each account secret is encrypted independently
- Encryption happens entirely in the browser using Web Crypto API

## Password Hashing

User passwords are hashed using bcrypt:

```javascript
bcrypt.hash(password, 12) // 12 rounds = ~250ms per hash
```

**Why bcrypt?**
- Designed specifically for password hashing
- Automatically includes salt
- Adjustable cost factor for future-proofing
- Resistant to GPU-based attacks

## Session Management

Sessions are managed with express-session:

| Setting | Value | Purpose |
|---------|-------|---------|
| `httpOnly` | true | Prevents XSS access to cookie |
| `secure` | true (prod) | HTTPS only in production |
| `maxAge` | 24 hours | Auto-expiry |
| `sameSite` | lax | CSRF protection |

**Session Data Stored:**
- `userId` - User's database ID
- `email` - User's email
- `role` - User's role (admin/user)

## Role-Based Access Control

Two roles are supported:

| Role | Permissions |
|------|-------------|
| `user` | Own accounts, categories, backups |
| `admin` | All user permissions + user management |

Role is checked via middleware:
```javascript
router.use(requireAuth);        // Must be logged in
router.use(requireRole('admin')); // Must be admin
```

## Input Validation

All inputs are validated using express-validator:

- Email format validation
- Password minimum length (8 characters)
- Required field checks
- Type coercion (numbers, strings)
- SQL injection prevention (parameterized queries)

## Security Headers

Helmet.js provides security headers:

| Header | Purpose |
|--------|---------|
| `X-Content-Type-Options` | Prevent MIME sniffing |
| `X-Frame-Options` | Prevent clickjacking |
| `X-XSS-Protection` | XSS filter (legacy browsers) |
| `Strict-Transport-Security` | Force HTTPS |
| `Content-Security-Policy` | Script/style sources |

## CORS Configuration

Cross-Origin Resource Sharing is configured per environment:

- **Development**: Allow localhost:5173
- **Production**: Allow specified CORS_ORIGINS

## Database Security

- SQLite database stored outside web root
- Parameterized queries prevent SQL injection
- Foreign key constraints enforce data integrity
- WAL mode for better concurrency

## HTTPS Requirements

**Production requires HTTPS** for:
- Secure cookie transmission
- Camera access (QR scanning)
- Web Crypto API (some browsers)
- Man-in-the-middle prevention

Render.com provides free HTTPS automatically.

## Security Checklist

Before deploying:

- [ ] Set strong `SESSION_SECRET` (32+ random bytes)
- [ ] Enable HTTPS
- [ ] Configure `CORS_ORIGINS` for your domain
- [ ] Review admin accounts
- [ ] Set up database backups
- [ ] Enable logging (`LOG_LEVEL=info`)

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. Email the maintainers directly
3. Allow time for a fix before disclosure

## Limitations

- **No end-to-end encryption** - Server can see metadata (issuer names, categories)
- **Session-based** - Requires cookies, not suitable for API-only usage
- **Single encryption password** - All accounts use same password
