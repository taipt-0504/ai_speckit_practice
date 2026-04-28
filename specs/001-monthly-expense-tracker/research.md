# Research: Monthly Expense Tracker

**Input**: Feature spec + planning decisions
**Decisions Informed**: Tech stack rationale, database design choices, API structure

## Technology Stack Decisions

### Frontend & Full-Stack Framework

**Decision**: Next.js 16.x with App Router + TypeScript
**Rationale**:
- App Router is the modern Next.js pattern (faster, better DX, built-in server components)
- TypeScript enforces type safety across frontend and backend
- Co-located API routes + pages simplify deployment and reduce infrastructure complexity
- Built-in API route auth, middleware support native to Next.js
- Server-side rendering can optimize dashboard performance if needed

**Alternatives Considered**:
- Separate frontend (React) + backend (Express/FastAPI): Rejected because v1 is MVP and single Next.js app is simpler to maintain
- SvelteKit: Feature-parity with Next.js but smaller ecosystem for charts/UI components

### Database & Schema Management

**Decision**: SQLite with Prisma ORM and Prisma-managed migrations
**Rationale**:
- SQLite is file-based, zero-config — ideal for v1 and small deployments
- No server needed; data persisted locally (can scale to cloud DB later)
- Prisma migrations provide version-controlled schema changes and a clear upgrade path
- Prisma provides a type-safe query API that matches the TypeScript-first stack

**Alternatives Considered**:
- PostgreSQL: Overkill for MVP; requires separate server
- MongoDB: Not ideal for relational data (users → transactions → categories)
- In-memory DB: Loses data on restart

### UI Framework & Styling

**Decision**: Tailwind CSS 3+ + shadcn/ui components
**Rationale**:
- Tailwind mobile-first breakpoints built-in for responsive design
- shadcn/ui provides pre-made accessible components (buttons, modals, forms)
- No CSS build complexity; Tailwind handles responsiveness automatically
- Rapid prototyping for dashboard and forms

**Alternatives Considered**:
- Material-UI: Heavier, less flexible for custom spacing
- Bootstrap: Less precise control, not mobile-first by default

### Testing Framework

**Decision**: Vitest for units + Testing Library for React components + MSW for API mocking
**Rationale**:
- Vitest is faster than Jest, native ESM support, Vite-native
- Testing Library encourages testing user behavior, not implementation
- MSW intercepts API calls for integration tests without running real server

**Deployment & Runtime**: Node.js 20.9.0+ (required by Next.js 16) — use active LTS line for stable toolchain behavior

## Database Schema Design

**Entities**:
1. User: email (unique), password_hash, role (user/admin), status (pending/active/rejected), created_at
2. Transaction: user_id, title, amount, date, type (income/expense), category_id, notes, created_at, updated_at
3. Category: name, color optional, is_default (bool), created_by_user_id (null if default)
4. SpendingLimit: user_id, month (YYYY-MM), amount, category_id (nullable), created_at, updated_at
5. Session: user_id, token, expires_at (for stateless JWT or session storage)

**Relationships**:
- User → many Transactions (1:N)
- User → many Categories (1:N, only for custom categories)
- User → many SpendingLimits (1:N)
- Transaction → Category (N:1)
- SpendingLimit → Category (N:1, nullable)

## API Structure

**Authentication Route**: POST /api/auth/register, GET /api/auth/me, POST /api/auth/login
**Transaction Routes**: CRUD operations on /api/transactions with query filtering
**Dashboard Route**: GET /api/dashboard?month=2026-04&user_id=X
**Admin Routes**: /api/users/pending (list), /api/users/{id}/approve (action)
All routes protected by middleware that checks JWT/session; admin routes checked for role

## Notes

- No external payment processing needed (v1 only tracks, not payments)
- No email notifications (v1 only in-app alerts)
- Session can be JWT or session cookies; JWT chosen for stateless architecture
- If scaling beyond SQLite, migrate to PostgreSQL via Prisma with the same migration workflow
