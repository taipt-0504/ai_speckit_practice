# API Contracts: Spending Limits

**Base URL**: `/api/spending-limits`
**Auth**: Required (JWT token in header)

## GET / (List Spending Limits)

List all spending limits for the current user.

**Query Parameters**:
- `month` (optional): YYYY-MM format — defaults to current month

**Response** (200 OK):
```json
{
  "limits": [
    {
      "id": "uuid-1",
      "month": "2026-04",
      "amount": 20000000,
      "category_id": null,
      "category": null,
      "type": "monthly_total",
      "created_at": "2026-04-01T00:00:00Z"
    },
    {
      "id": "uuid-2",
      "month": "2026-04",
      "amount": 5000000,
      "category_id": "cat-uuid",
      "category": {
        "id": "cat-uuid",
        "name": "Giải trí"
      },
      "type": "per_category",
      "created_at": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

## POST / (Create Spending Limit)

Set a new spending limit.

**Request Body**:
```json
{
  "month": "2026-04",
  "amount": 20000000,
  "category_id": null
}
```

Or per-category:
```json
{
  "month": "2026-04",
  "amount": 5000000,
  "category_id": "uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "month": "2026-04",
  "amount": 20000000,
  "category_id": null,
  "type": "monthly_total",
  "created_at": "2026-04-15T15:00:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Limit for this month/category already exists. Update instead of creating."
}
```

---

## PUT /[id] (Update Spending Limit)

Update an existing spending limit.

**Request Body**:
```json
{
  "amount": 25000000
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "month": "2026-04",
  "amount": 25000000,
  "category_id": null,
  "updated_at": "2026-04-15T15:30:00Z"
}
```

---

## DELETE /[id] (Delete Spending Limit)

Delete a spending limit (removes the cap for that month/category).

**Response** (204 No Content): Empty response
