# API Contracts: Admin

**Base URL**: `/api/users`
**Auth**: Required (JWT token in header + admin role)

## GET /pending

List all pending (awaiting approval) user sign-up requests.

**Response** (200 OK):
```json
{
  "pending_users": [
    {
      "id": "uuid-1",
      "email": "newuser1@example.com",
      "status": "pending",
      "created_at": "2026-04-15T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "email": "newuser2@example.com",
      "status": "pending",
      "created_at": "2026-04-15T11:30:00Z"
    }
  ],
  "total": 2
}
```

---

## POST /[id]/approve

Approve a pending user account (transition status to "active").

**Request Body** (empty):
```json
{}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "status": "active",
  "message": "User account approved successfully."
}
```

**Error** (400 Bad Request):
```json
{
  "error": "User is not in pending status"
}
```

**Error** (404 Not Found):
```json
{
  "error": "User not found"
}
```

---

## POST /[id]/reject

Reject a pending user account (transition status to "rejected").

**Request Body** (optional reason):
```json
{
  "reason": "Email domain not allowed"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "status": "rejected",
  "message": "User account rejected."
}
```

**Error** (400 Bad Request):
```json
{
  "error": "User is not in pending status"
}
```
