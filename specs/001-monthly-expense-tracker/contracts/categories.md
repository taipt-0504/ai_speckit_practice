# API Contracts: Categories

**Base URL**: `/api/categories`
**Auth**: Required (JWT token in header)

## GET / (List Categories)

List both system default categories and user's custom categories.

**Response** (200 OK):
```json
{
  "default": [
    {
      "id": "uuid-1",
      "name": "Ăn uống",
      "is_default": true,
      "is_custom": false
    },
    {
      "id": "uuid-2",
      "name": "Di chuyển",
      "is_default": true,
      "is_custom": false
    }
  ],
  "custom": [
    {
      "id": "uuid-cust1",
      "name": "Pet expenses",
      "is_default": false,
      "is_custom": true
    }
  ]
}
```

---

## POST / (Create Custom Category)

Create a new custom category for the user.

**Request Body**:
```json
{
  "name": "Pet expenses",
  "color": "#FF5733"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Pet expenses",
  "color": "#FF5733",
  "is_default": false,
  "is_custom": true,
  "created_at": "2026-04-15T14:00:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Category name already exists"
}
```

---

## PUT /[id] (Update Category)

Update a custom category (name, color). Only owner or admin can update.

**Request Body** (partial update):
```json
{
  "name": "My pets - updated",
  "color": "#FF0000"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "My pets - updated",
  "color": "#FF0000",
  "is_default": false,
  "updated_at": "2026-04-15T14:15:00Z"
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Cannot modify system default categories"
}
```

---

## DELETE /[id] (Delete Category)

Delete a custom category. Only owner or admin can delete.

**Response** (204 No Content): Empty response

**Error** (400 Bad Request):
```json
{
  "error": "Category has associated transactions. Please reassign them first."
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Cannot delete system default categories"
}
```
