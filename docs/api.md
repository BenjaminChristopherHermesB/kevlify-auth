# API Documentation

Base URL: `/api`

All endpoints return JSON. Authentication is required for most endpoints (indicated by 🔒).

## Authentication

### Register
`POST /api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Logout 🔒
`POST /api/auth/logout`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User 🔒
`GET /api/auth/me`

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Accounts 🔒

### List Accounts
`GET /api/accounts`

**Response:** `200 OK`
```json
{
  "accounts": [
    {
      "id": 1,
      "type": 2,
      "issuer": "Google",
      "username": "user@gmail.com",
      "secret_encrypted": "encrypted_base64_string",
      "algorithm": 0,
      "digits": 6,
      "period": 30,
      "icon": null,
      "category_id": null,
      "ranking": 1
    }
  ]
}
```

### Create Account
`POST /api/accounts`

**Request Body:**
```json
{
  "issuer": "Google",
  "username": "user@gmail.com",
  "secret_encrypted": "encrypted_base64_string",
  "type": 2,
  "algorithm": 0,
  "digits": 6,
  "period": 30,
  "icon": "/icons/google.png",
  "category_id": "abc12345"
}
```

**Type Values:**
- 1 = HOTP
- 2 = TOTP
- 4 = Steam

**Algorithm Values:**
- 0 = SHA-1
- 1 = SHA-256
- 2 = SHA-512

**Response:** `201 Created`

### Update Account
`PUT /api/accounts/:id`

**Request Body:**
```json
{
  "issuer": "New Name",
  "icon": "/icons/updated.png"
}
```

**Response:** `200 OK`

### Delete Account
`DELETE /api/accounts/:id`

**Response:** `200 OK`
```json
{
  "message": "Account deleted"
}
```

## Categories 🔒

### List Categories
`GET /api/categories`

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": "abc12345",
      "name": "Social",
      "ranking": 1
    }
  ]
}
```

### Create Category
`POST /api/categories`

**Request Body:**
```json
{
  "name": "Social"
}
```

**Response:** `201 Created`

### Update Category
`PUT /api/categories/:id`

**Request Body:**
```json
{
  "name": "Updated Name"
}
```

### Delete Category
`DELETE /api/categories/:id`

Deleting a category will set `category_id` to null for all accounts in that category.

## Backup 🔒

### Export Backup
`GET /api/backup/export`

Returns a JSON file download with all accounts and categories.

**Response:** `200 OK` (application/json download)

### Import Backup
`POST /api/backup/import`

**Request Body:**
```json
{
  "backup": {
    "authenticators": [...],
    "categories": [...]
  },
  "replaceExisting": false
}
```

**Response:** `200 OK`
```json
{
  "message": "Import successful",
  "imported": 5,
  "categories": 2
}
```

## Admin 🔒 (admin role required)

### List Users
`GET /api/admin/users`

### Update User Role
`PUT /api/admin/users/:id/role`

**Request Body:**
```json
{
  "role": "admin"
}
```

### Delete User
`DELETE /api/admin/users/:id`

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
