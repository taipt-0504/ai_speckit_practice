# Data Model: Monthly Expense Tracker

**Input**: Feature spec + research.md
**Output**: Entities, relationships, validation rules, state transitions

## Core Entities & Attributes

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| email | STRING | UNIQUE, NOT NULL | Lowercase, validated format |
| password_hash | STRING | NOT NULL | bcrypt hash, never returned in API |
| role | ENUM | 'user' \| 'admin' | Default 'user' |
| status | ENUM | 'pending' \| 'active' \| 'rejected' | Default 'pending' at sign-up |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | |
| deleted_at | TIMESTAMP | NULL | Soft delete for audit trail |

**Validation Rules**:
- email: valid format, unique across system, required
- password_hash: never blank, always hashed before storage
- status transitions: pending → active or rejected (not reversible)
- role assignment: only admin can assign role to other users

### Transaction

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| user_id | FK(User.id) | NOT NULL | Owner of transaction |
| title | STRING | NOT NULL, max 255 | Brief description |
| amount | INTEGER | NOT NULL, > 0 | Stored in base currency unit (e.g., VND) |
| date | DATE | NOT NULL | Transaction occurrence date |
| type | ENUM | 'income' \| 'expense' | Determines +/− effect on balance |
| category_id | FK(Category.id) | NOT NULL | Must exist, owned by system or user |
| notes | TEXT | NULL | Optional long text |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | |

**Validation Rules**:
- amount: positive numeric, required, no nulls
- date: cannot be in future (optional constraint)
- category_id: references valid category (system or user's custom)
- user_id must match authenticated user (except admin)

**Calculation Rules**:
- Monthly total income = SUM(amount WHERE type='income' AND MONTH(date) = X)
- Monthly total expense = SUM(amount WHERE type='expense' AND MONTH(date) = X)
- Monthly balance = total income − total expense

### Category

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| name | STRING | NOT NULL, max 100 | |
| color | STRING | NULL | Hex color code (optional UI hint) |
| is_default | BOOL | DEFAULT FALSE | System vs user-created |
| created_by_user_id | FK(User.id) | NULL | NULL if system default |
| created_at | TIMESTAMP | DEFAULT NOW | |

**Default Categories (Seeded at Init)**:
- Ăn uống (Food)
- Di chuyển (Transportation)
- Nhà ở (Housing)
- Giải trí (Entertainment)
- Sức khỏe (Health)
- Mua sắm (Shopping)
- Thu nhập (Income) — for income transactions
- Khác (Other)

**Validation Rules**:
- name: required, unique per user (if custom), unique globally (if default)
- System categories (is_default=true) cannot be deleted or renamed
- User categories (is_default=false, created_by_user_id=X) can be deleted only if no transactions reference them

### SpendingLimit

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| user_id | FK(User.id) | NOT NULL | Owner |
| month | STRING | NOT NULL, format YYYY-MM | e.g., "2026-04" |
| amount | INTEGER | NOT NULL, > 0 | Limit in base currency |
| category_id | FK(Category.id) | NULL | NULL = total month limit, otherwise per-category |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | |

**Unique Constraint**: (user_id, month, category_id) — one limit per combination

**Validation Rules**:
- amount: positive numeric, required
- month: valid YYYY-MM format
- category_id: if specified, must be a valid category accessible to user
- Soft override: if limit for a month exists, editing updates it; deletion removes it

### Session (Optional, for JWT stateless auth)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| token_hash | STRING | PRIMARY KEY | Hash of JWT token |
| user_id | FK(User.id) | NOT NULL | |
| expires_at | TIMESTAMP | NOT NULL | Token expiry |
| created_at | TIMESTAMP | DEFAULT NOW | |

**Alternative**: Use JWT without session table for truly stateless auth.

## Entity Relationships

```
User (1) ──────→ (N) Transaction
User (1) ──────→ (N) Category (only custom, is_default=false)
User (1) ──────→ (N) SpendingLimit
Category (1) ───→ (N) Transaction
Category (1) ───→ (N) SpendingLimit (nullable)
```

## State Transitions & Business Logic

### User Status Transitions

```
pending ──(admin approve)──→ active ──[can login]
pending ──(admin reject)───→ rejected ──[cannot login]
```

### Transaction Calculation

**Dashboard Monthly Calculation**:
1. Total Income = SUM(transaction.amount WHERE type='income' AND MONTH(transaction.date)=X AND user_id=Y)
2. Total Expense = SUM(transaction.amount WHERE type='expense' AND MONTH(transaction.date)=X AND user_id=Y)
3. Balance = Total Income − Total Expense
4. Spending Limit Check:
   - For each SpendingLimit with month=X:
     - If category_id is NULL: check total_expense vs amount
     - If category_id is set: check SUM(expense WHERE category_id=Z AND month=X) vs amount
   - If 80% ≤ spent < 100%: show warning alert
   - If spent ≥ 100%: show critical alert

### Category Deletion Logic

If user deletes a custom category:
- Option A: Prevent deletion if transactions exist → require reassign first
- Option B: Soft-delete + show as "(Deleted)" in transaction history
- **Chosen**: Option A with error message guiding user to reassign

## Data Validation Schemas (Zod)

```typescript
// User
UserSignUpSchema: { email, password (min 8 chars, 1 uppercase, 1 number) }
UserLoginSchema: { email, password }

// Transaction
TransactionCreateSchema: { title (1-255 chars), amount (>0, numeric), date (not future), 
                           type ('income'|'expense'), category_id (valid), notes? }

// Category
CategoryCreateSchema: { name (1-100 chars, not reserved), color? (hex or null) }

// SpendingLimit
SpendingLimitSchema: { month (YYYY-MM), amount (>0), category_id? (nullable) }
```

## Notes

- All timestamps use ISO 8601 format in API responses
- All monetary values stored as integers (cents/base units) to avoid float precision issues
- Soft deletes (deleted_at) recommended for audit trail; hard delete is destructive
- Foreign key constraints enforced at DB level to maintain referential integrity
