# API Contracts: Authentication

**Base URL**: `/api/auth`

## POST /register

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "status": "pending",
  "message": "Account created. Awaiting admin approval."
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Email already registered" // or "Password too weak"
}
```

---

## POST /login

Authenticate and receive JWT token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Account status is pending. Please wait for admin approval."
}
```

---

## POST /logout

Invalidate JWT token (client-side: remove from localStorage/cookie).

**Request**: Authorization header with token

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## GET /me

Get current authenticated user info.

**Request**: Authorization header with JWT token

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "status": "active"
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "Unauthorized"
}
```
