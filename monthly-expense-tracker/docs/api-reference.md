# API Reference

All API routes are under `/api/`. Authentication is via an `auth_token` HttpOnly cookie set at login.

**Common error codes**:

| Code | Meaning |
|------|---------|
| 400 | Validation error or bad request |
| 401 | Missing or invalid token |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal server error |

---

## Authentication — `/api/auth`

### `POST /api/auth/register`

Register a new user account. New accounts start with status `"pending"` and must be approved by an admin before they can log in.

**Request body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation**:
- `email`: valid email format, not already registered
- `password`: minimum 8 characters, at least one uppercase letter, one number

**Response `201`**:
```json
{
  "id": "clxyz...",
  "email": "user@example.com",
  "status": "pending",
  "message": "Account created. Awaiting admin approval."
}
```

**Response `400`**:
```json
{ "error": "Email already registered" }
```

---

### `POST /api/auth/login`

Authenticate with email/password. On success, sets an `auth_token` HttpOnly cookie.

**Request body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response `200`**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "clxyz...",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Response `401`**:
```json
{ "error": "Invalid email or password" }
```

**Response `403`** (pending or rejected account):
```json
{ "error": "Account status is pending. Please wait for admin approval." }
```

---

### `POST /api/auth/logout`

Invalidate the current session and clear the auth cookie. Requires a valid session.

**Response `200`**:
```json
{ "message": "Logged out successfully" }
```

---

### `GET /api/auth/me`

Return the currently authenticated user's profile. Requires valid auth cookie.

**Response `200`**:
```json
{
  "id": "clxyz...",
  "email": "user@example.com",
  "role": "user",
  "status": "active"
}
```

**Response `401`**:
```json
{ "error": "Unauthorized" }
```

---

## Admin — `/api/users`

All admin endpoints require `role === "admin"`.

### `GET /api/users/pending`

List all user accounts with status `"pending"`.

**Response `200`**:
```json
{
  "pending_users": [
    {
      "id": "clxyz...",
      "email": "newuser@example.com",
      "status": "pending",
      "created_at": "2026-04-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/users/[id]/approve`

Approve a pending user account. Transitions status: `pending → active`.

**Request body**: empty `{}`

**Response `200`**:
```json
{
  "id": "clxyz...",
  "email": "newuser@example.com",
  "status": "active",
  "message": "User account approved successfully."
}
```

**Response `400`**: User is not in `pending` status.  
**Response `404`**: User not found.

---

### `POST /api/users/[id]/reject`

Reject a pending user account. Transitions status: `pending → rejected`.

**Request body** (optional):
```json
{ "reason": "Email domain not allowed" }
```

**Response `200`**:
```json
{
  "id": "clxyz...",
  "email": "newuser@example.com",
  "status": "rejected",
  "message": "User account rejected."
}
```

---

## Transactions — `/api/transactions`

All endpoints require an active user session (`withActiveUserAuth`). Users only see their own transactions.

### `GET /api/transactions`

List transactions for the current user with optional filters.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `month` | `YYYY-MM` | current month | Filter by month |
| `type` | `income` \| `expense` | — | Filter by transaction type |
| `category_id` | UUID | — | Filter by category |
| `search` | string | — | Full-text search on title/notes |
| `start_date` | `YYYY-MM-DD` | — | Range start (inclusive) |
| `end_date` | `YYYY-MM-DD` | — | Range end (inclusive) |
| `limit` | number | `50` | Page size |
| `offset` | number | `0` | Pagination offset |

**Response `200`**:
```json
{
  "transactions": [
    {
      "id": "clxyz...",
      "title": "Lunch",
      "amount": 150000,
      "date": "2026-04-15",
      "type": "expense",
      "category": { "id": "cat1", "name": "Ăn uống" },
      "notes": "With colleagues",
      "created_at": "2026-04-15T12:00:00Z",
      "updated_at": "2026-04-15T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### `POST /api/transactions`

Create a new transaction.

**Request body**:
```json
{
  "title": "Grocery shopping",
  "amount": 500000,
  "date": "2026-04-15",
  "type": "expense",
  "category_id": "cat-uuid",
  "notes": "Weekly groceries"
}
```

**Validation**:
- `title`: required, max 255 chars
- `amount`: required, integer > 0
- `date`: required, ISO date string
- `type`: required, `"income"` or `"expense"`
- `category_id`: required, must be a valid category accessible to the user
- `notes`: optional

**Response `201`**:
```json
{
  "id": "clxyz...",
  "title": "Grocery shopping",
  "amount": 500000,
  "date": "2026-04-15",
  "type": "expense",
  "category": { "id": "cat-uuid", "name": "Mua sắm" },
  "notes": "Weekly groceries",
  "created_at": "2026-04-15T13:00:00Z"
}
```

---

### `GET /api/transactions/[id]`

Get a single transaction by ID.

**Response `200`**: Full transaction object (same shape as list item).  
**Response `404`**: `{ "error": "Transaction not found" }`

---

### `PUT /api/transactions/[id]`

Update an existing transaction. Supports partial updates.

**Request body** (all fields optional):
```json
{
  "title": "Weekly groceries",
  "amount": 520000,
  "date": "2026-04-15",
  "type": "expense",
  "category_id": "cat-uuid",
  "notes": "Updated note"
}
```

**Response `200`**: Updated transaction object.  
**Response `404`**: Transaction not found.

---

### `DELETE /api/transactions/[id]`

Permanently delete a transaction.

**Response `204`**: No content.  
**Response `404`**: `{ "error": "Transaction not found" }`

---

### `GET /api/transactions/export-csv`

Export transactions as a CSV file. Accepts the same query parameters as `GET /api/transactions`.

**Response `200`**:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="transactions-2026-04.csv"

date,title,type,category,amount,notes
2026-04-15,Lunch,expense,Ăn uống,150000,With colleagues
2026-04-20,Salary,income,Thu nhập,10000000,Monthly salary
```

---

## Categories — `/api/categories`

### `GET /api/categories`

List all categories available to the current user: system defaults + the user's own custom categories.

**Response `200`**:
```json
{
  "default": [
    { "id": "d1", "name": "Ăn uống", "is_default": true, "is_custom": false },
    { "id": "d2", "name": "Di chuyển", "is_default": true, "is_custom": false },
    { "id": "d3", "name": "Nhà ở", "is_default": true, "is_custom": false },
    { "id": "d4", "name": "Giải trí", "is_default": true, "is_custom": false },
    { "id": "d5", "name": "Sức khỏe", "is_default": true, "is_custom": false },
    { "id": "d6", "name": "Mua sắm", "is_default": true, "is_custom": false },
    { "id": "d7", "name": "Thu nhập", "is_default": true, "is_custom": false },
    { "id": "d8", "name": "Khác", "is_default": true, "is_custom": false }
  ],
  "custom": [
    { "id": "c1", "name": "Pet expenses", "is_default": false, "is_custom": true }
  ]
}
```

---

### `POST /api/categories`

Create a new custom category.

**Request body**:
```json
{
  "name": "Pet expenses",
  "color": "#FF5733"
}
```

**Validation**:
- `name`: required, unique for the current user
- `color`: optional hex color string

**Response `201`**:
```json
{
  "id": "c-new",
  "name": "Pet expenses",
  "color": "#FF5733",
  "is_default": false,
  "is_custom": true,
  "created_at": "2026-04-15T14:00:00Z"
}
```

**Response `400`**: `{ "error": "Category name already exists" }`

---

### `PUT /api/categories/[id]`

Update a custom category (name and/or color). Cannot modify default system categories.

**Request body** (partial):
```json
{ "name": "My Pets", "color": "#FF0000" }
```

**Response `200`**: Updated category object.  
**Response `403`**: `{ "error": "Cannot modify system default categories" }`

---

### `DELETE /api/categories/[id]`

Delete a custom category. Fails if transactions still reference it.

**Response `204`**: No content.  
**Response `400`**: `{ "error": "Category has associated transactions. Please reassign them first." }`  
**Response `403`**: `{ "error": "Cannot delete system default categories" }`

---

## Spending Limits — `/api/spending-limits`

### `GET /api/spending-limits`

List the current user's spending limits.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `month` | `YYYY-MM` | current month | Filter by month |

**Response `200`**:
```json
{
  "limits": [
    {
      "id": "lim1",
      "month": "2026-04",
      "amount": 20000000,
      "category_id": null,
      "category": null,
      "type": "monthly_total",
      "created_at": "2026-04-01T00:00:00Z"
    },
    {
      "id": "lim2",
      "month": "2026-04",
      "amount": 5000000,
      "category_id": "d4",
      "category": { "id": "d4", "name": "Giải trí" },
      "type": "per_category",
      "created_at": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /api/spending-limits`

Create a new spending limit.

**Request body** (total monthly limit):
```json
{ "month": "2026-04", "amount": 20000000, "category_id": null }
```

**Request body** (per-category limit):
```json
{ "month": "2026-04", "amount": 5000000, "category_id": "cat-uuid" }
```

**Validation**:
- `month`: required, format `YYYY-MM`
- `amount`: required, integer > 0
- `category_id`: optional; if provided must be a valid category accessible to user
- Duplicate `(month, category_id)` returns 400

**Response `201`**: Created limit object.  
**Response `400`**: `{ "error": "Limit for this month/category already exists. Update instead of creating." }`

---

### `PUT /api/spending-limits/[id]`

Update an existing spending limit amount.

**Request body**:
```json
{ "amount": 25000000 }
```

**Response `200`**: Updated limit object.

---

### `DELETE /api/spending-limits/[id]`

Remove a spending limit (removes the cap entirely for that month/category).

**Response `204`**: No content.

---

## Dashboard — `/api/dashboard`

### `GET /api/dashboard`

Return aggregated data for the dashboard: summary, spending limit status, category breakdown, and monthly trend.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `month` | `YYYY-MM` | current month | Target month |

**Response `200`**:
```json
{
  "month": "2026-04",
  "summary": {
    "total_income": 10000000,
    "total_expense": 3500000,
    "balance": 6500000,
    "transaction_count": 25
  },
  "spending_limits": [
    {
      "id": "lim1",
      "type": "monthly_total",
      "limit_amount": 5000000,
      "spent_amount": 3500000,
      "percentage": 70,
      "status": "warning",
      "category": null
    },
    {
      "id": "lim2",
      "type": "per_category",
      "limit_amount": 1000000,
      "spent_amount": 1200000,
      "percentage": 120,
      "status": "exceeded",
      "category": { "id": "d4", "name": "Giải trí" }
    }
  ],
  "category_breakdown": [
    {
      "category_id": "d1",
      "category_name": "Ăn uống",
      "amount": 1500000,
      "percentage": 43
    }
  ],
  "monthly_trend": [
    { "month": "2026-02", "income": 10000000, "expense": 3000000 },
    { "month": "2026-03", "income": 10000000, "expense": 3200000 },
    { "month": "2026-04", "income": 10000000, "expense": 3500000 }
  ]
}
```

**Field notes**:
- `balance` = `total_income − total_expense`
- `spending_limits[].status`: `"normal"` (< 80%), `"warning"` (80–100%), `"exceeded"` (> 100%)
- `spending_limits[].percentage`: `(spent_amount / limit_amount) × 100`
- `category_breakdown`: expense-only; `percentage` = share of total expenses
- `monthly_trend`: last 3 full months of data
- All monetary values are in base currency (e.g., VND integer)
