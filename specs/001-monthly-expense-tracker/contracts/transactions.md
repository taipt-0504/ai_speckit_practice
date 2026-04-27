# API Contracts: Transactions

**Base URL**: `/api/transactions`
**Auth**: Required (JWT token in header)

## GET / (List Transactions)

List all transactions for the authenticated user with optional filtering.

**Query Parameters**:
- `month` (optional): YYYY-MM format (e.g., "2026-04") — defaults to current month
- `type` (optional): "income" or "expense"
- `category_id` (optional): UUID of category to filter
- `search` (optional): Free-text search in title/notes
- `start_date` (optional): YYYY-MM-DD format
- `end_date` (optional): YYYY-MM-DD format
- `limit` (optional, default 50): Number of records
- `offset` (optional, default 0): Pagination offset

**Response** (200 OK):
```json
{
  "transactions": [
    {
      "id": "uuid",
      "title": "Lunch",
      "amount": 150000,
      "date": "2026-04-15",
      "type": "expense",
      "category": {
        "id": "uuid",
        "name": "Ăn uống"
      },
      "notes": "With colleagues",
      "created_at": "2026-04-15T12:00:00Z",
      "updated_at": "2026-04-15T12:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

## POST / (Create Transaction)

Create a new transaction.

**Request Body**:
```json
{
  "title": "Grocery shopping",
  "amount": 500000,
  "date": "2026-04-15",
  "type": "expense",
  "category_id": "uuid",
  "notes": "Weekly groceries"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "title": "Grocery shopping",
  "amount": 500000,
  "date": "2026-04-15",
  "type": "expense",
  "category": {
    "id": "uuid",
    "name": "Mua sắm"
  },
  "notes": "Weekly groceries",
  "created_at": "2026-04-15T13:00:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Invalid amount or missing required fields"
}
```

---

## GET /[id] (Get Transaction Detail)

Retrieve a single transaction by ID.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Grocery shopping",
  "amount": 500000,
  "date": "2026-04-15",
  "type": "expense",
  "category": { "id": "uuid", "name": "Mua sắm" },
  "notes": "Weekly groceries",
  "created_at": "2026-04-15T13:00:00Z",
  "updated_at": "2026-04-15T13:00:00Z"
}
```

---

## PUT /[id] (Update Transaction)

Update an existing transaction.

**Request Body** (partial update allowed):
```json
{
  "title": "Weekly groceries",
  "amount": 520000,
  "date": "2026-04-15"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Weekly groceries",
  "amount": 520000,
  "date": "2026-04-15",
  "type": "expense",
  "category": { "id": "uuid", "name": "Mua sắm" },
  "notes": "Weekly groceries",
  "updated_at": "2026-04-15T13:30:00Z"
}
```

---

## DELETE /[id] (Delete Transaction)

Delete a transaction permanently.

**Response** (204 No Content): Empty response

**Error** (404 Not Found):
```json
{
  "error": "Transaction not found"
}
```

---

## GET /export-csv

Export filtered transactions as CSV file.

**Query Parameters**: Same as GET / (supports all filters)

**Response** (200 OK):
```
Content-Type: text/csv
Attachment: transactions-2026-04.csv

date,title,type,category,amount,notes
2026-04-15,Lunch,expense,Ăn uống,150000,With colleagues
2026-04-20,Salary,income,Thu nhập,10000000,Monthly salary
```
