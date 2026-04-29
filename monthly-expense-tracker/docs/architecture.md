# Architecture

## Tech Stack

| Concern | Technology | Notes |
|---------|-----------|-------|
| Framework | Next.js 16.x (App Router) | Full-stack — pages + API routes in one app |
| Language | TypeScript 5+ (strict mode) | Shared types across frontend and backend |
| Styling | Tailwind CSS 4 | Mobile-first, custom breakpoints: sm/md/lg/xl |
| UI Components | shadcn/ui | Accessible component primitives |
| ORM | Prisma ORM | Type-safe DB client, migration runner |
| Database | SQLite (file: `prisma/dev.db`) | Single-file, no external DB server needed |
| Auth | JWT (RS256) + HttpOnly cookie | Session stored in DB for server-side invalidation |
| Passwords | bcryptjs | 12 rounds by default |
| Testing | Vitest 4 + Testing Library + MSW 2 | Unit, component, integration |
| Containerization | Docker + Docker Compose | Port 3000 exposed |

---

## Project Structure

```
monthly-expense-tracker/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── (auth)/                   # Public auth pages (no auth required)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── waiting/page.tsx      # Shown to pending users
│   │   └── error.tsx             # Auth error boundary
│   ├── (protected)/              # Protected area (requires active session)
│   │   ├── layout.tsx            # Auth check + Header/Sidebar shell
│   │   ├── page.tsx              # Redirect → /dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── spending-limits/page.tsx
│   │   ├── admin/page.tsx        # Admin-only: pending user management
│   │   └── error.tsx             # Protected error boundary
│   └── api/                      # REST API handlers
│       ├── auth/register/        # POST
│       ├── auth/login/           # POST
│       ├── auth/logout/          # POST
│       ├── auth/me/              # GET
│       ├── users/pending/        # GET (admin)
│       ├── users/[id]/approve/   # POST (admin)
│       ├── users/[id]/reject/    # POST (admin)
│       ├── transactions/         # GET, POST
│       ├── transactions/[id]/    # GET, PUT, DELETE
│       ├── transactions/export-csv/ # GET
│       ├── categories/           # GET, POST
│       ├── categories/[id]/      # PUT, DELETE
│       ├── spending-limits/      # GET, POST
│       ├── spending-limits/[id]/ # GET, PUT, DELETE
│       └── dashboard/            # GET
├── components/
│   ├── auth/                     # LoginForm, RegisterForm, AuthFormLayout
│   ├── admin/                    # PendingUsersList
│   ├── category/                 # CategoryForm, CategoryList
│   ├── common/                   # Header, Sidebar, Navigation, Loading, AlertBanner
│   ├── dashboard/                # CategoryBreakdown, IncomeExpenseChart, MonthlyOverview
│   └── transactions/             # TransactionForm, TransactionList, TransactionRow, FilterBar, SearchBox
├── lib/
│   ├── auth/                     # JWT, session, password hash, middleware, service
│   ├── db/                       # Prisma client singleton
│   ├── hooks/                    # React hooks (useAuth, useTransactions, etc.)
│   └── utils/                    # calculations, csv, date, validation, errors
├── prisma/
│   ├── schema.prisma             # DB schema
│   ├── seed.ts                   # Seeds admin user + default categories
│   └── migrations/               # Auto-generated migration files
├── __tests__/
│   ├── setup.ts                  # Vitest global setup (MSW server)
│   ├── unit/                     # Pure function and service tests
│   ├── components/               # React component rendering tests
│   └── integration/              # Full user-journey tests
├── types/
│   └── forms.ts                  # Shared TypeScript form types
└── styles/
    └── globals.css               # Tailwind base + custom globals
```

---

## Data Model

### Entity Relationship Diagram

```
User (1) ──────→ (N) Transaction
User (1) ──────→ (N) Category        (custom categories only)
User (1) ──────→ (N) SpendingLimit
User (1) ──────→ (N) Session
Category (1) ───→ (N) Transaction
Category (1) ───→ (N) SpendingLimit  (nullable — null = total monthly limit)
```

### Schema Summary

#### User
| Field | Type | Notes |
|-------|------|-------|
| id | CUID | Primary key |
| email | String | Unique, lowercase |
| password | String | bcrypt hash, never returned in responses |
| role | String | `"user"` \| `"admin"` |
| status | String | `"pending"` → `"active"` or `"rejected"` |
| createdAt / updatedAt | DateTime | Auto-managed |

#### Category
| Field | Type | Notes |
|-------|------|-------|
| id | CUID | |
| name | String | Unique per owner |
| isDefault | Boolean | `true` = system category (cannot be deleted) |
| ownerId | String? | `null` for default; user ID for custom |

**Default categories (seeded)**: Ăn uống, Di chuyển, Nhà ở, Giải trí, Sức khỏe, Mua sắm, Thu nhập, Khác

#### Transaction
| Field | Type | Notes |
|-------|------|-------|
| id | CUID | |
| title | String | Max 255 chars |
| amount | Int | Base currency (e.g., VND), must be > 0 |
| type | String | `"income"` \| `"expense"` |
| date | DateTime | Transaction date |
| notes | String? | Optional |
| categoryId | CUID | FK → Category |
| userId | CUID | FK → User |

#### SpendingLimit
| Field | Type | Notes |
|-------|------|-------|
| id | CUID | |
| limitType | String | `"monthly_total"` \| `"category"` |
| amount | Int | Limit value in base currency |
| month | Int | 1–12 |
| year | Int | e.g., 2026 |
| categoryId | String? | `null` for total monthly limit |
| userId | CUID | FK → User |

#### Session
| Field | Type | Notes |
|-------|------|-------|
| id | CUID | |
| token | String | Raw JWT token (unique) |
| userId | CUID | FK → User |
| expiresAt | DateTime | Token expiry timestamp |

---

## Authentication Flow

### Registration & Approval

```
User registers (POST /api/auth/register)
  → Status set to "pending"
  → User sees /waiting page
  → Admin reviews at /admin
  → Admin approves (POST /api/users/[id]/approve)
    → Status set to "active"
    → User can now login
  OR
  → Admin rejects (POST /api/users/[id]/reject)
    → Status set to "rejected"
    → Login attempt returns 403
```

### Session Lifecycle

```
Login (POST /api/auth/login)
  → Validates email/password
  → Checks user is "active"
  → Creates JWT (payload: userId, email, role)
  → Stores token in Session table (for server-side invalidation)
  → Sets HttpOnly cookie: auth_token=<jwt>

Every protected request
  → Cookie parsed by middleware (withAuth / withAdminAuth / withActiveUserAuth)
  → JWT verified (signature + expiry)
  → Session record checked in DB
  → User loaded from DB — confirms still active

Logout (POST /api/auth/logout)
  → Deletes Session record from DB
  → Clears auth_token cookie
```

### Route Protection

| Middleware | Used On | Guards |
|-----------|---------|--------|
| `withActiveUserAuth` | All data endpoints | Valid JWT + active user status |
| `withAdminAuth` | `/api/users/*` | Valid JWT + role === `"admin"` |
| App Router layout check | `(protected)` routes | Redirects to `/login` if no session |

---

## Key Library Modules

### `lib/auth/`

| File | Purpose |
|------|---------|
| `jwt.ts` | `signToken(payload)`, `verifyToken(token)` — JWT creation/validation |
| `hash.ts` | `hashPassword(plain)`, `verifyPassword(plain, hash)` — bcrypt helpers |
| `session.ts` | `createSession()`, `getSession()`, `deleteSession()` — DB session CRUD |
| `middleware.ts` | `withAuth`, `withAdminAuth`, `withActiveUserAuth` — route guards |
| `service.ts` | High-level auth operations: register, login, logout, approve, reject |
| `constants.ts` | Auth constants: cookie name, token expiry |

### `lib/utils/`

| File | Purpose |
|------|---------|
| `calculations.ts` | `calculateTotals()`, `calculateCategoryBreakdown()`, `calculateSpendingLimitStatus()`, `getBalance()`, `filterTransactionsByKeyword()` |
| `validation.ts` | Zod schemas: `RegisterSchema`, `LoginSchema`, `TransactionSchema`, `CategorySchema`, `SpendingLimitSchema` |
| `csv.ts` | `formatCsvValue()`, `serializeTransactionsToCsv()` |
| `date.ts` | Date formatting and month parsing helpers |
| `errors.ts` | Typed error classes for API handlers |

### `lib/hooks/` (React client hooks)

| Hook | Purpose |
|------|---------|
| `useAuth` | `user`, `loading`, `logout`, `isAuthenticated` |
| `useTransactions` | Transaction list, CRUD operations, CSV export |
| `useCategories` | Category list, create, update, delete (with reassign) |
| `useDashboard` | Dashboard data, month selector |
| `useSpendingLimits` | Spending limit CRUD + status calculation |

---

## Spending Limit Alert Logic

Alert status is computed by `calculateSpendingLimitStatus()`:

| Condition | Status | Visual |
|-----------|--------|--------|
| spent < 80% of limit | `normal` | Green |
| 80% ≤ spent ≤ 100% | `warning` | Yellow / Orange |
| spent > 100% | `exceeded` | Red |

The dashboard API (`GET /api/dashboard`) returns pre-computed `status`, `spent_amount`, and `percentage` for each limit.
