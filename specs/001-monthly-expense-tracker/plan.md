# Implementation Plan: Monthly Expense Tracker

**Branch**: `001-monthly-expense-tracker` | **Date**: 2026-04-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-monthly-expense-tracker/spec.md`

**Note**: This plan includes technical decisions on tech stack, database schema, test strategy, and API contracts.

## Summary

Monthly expense tracker web application with user registration/approval workflow, transaction management
by category, monthly dashboard with charts, filtering/search/CSV export, and spending limit alerts.
Built with Next.js 16.x (TypeScript) for full-stack, Tailwind CSS for responsive UI (desktop/mobile),
SQLite with database migrations for schema management, and test-first implementation using Vitest
for unit/integration tests.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+, React 19-compatible via Next.js 16 App Router
**Primary Dependencies**: Next.js 16.x (App Router), Tailwind CSS 3+, shadcn/ui for components, Prisma ORM for SQLite, Vitest
**Storage**: SQLite (file-based, schema managed via Prisma migrations)
**Testing**: Vitest for unit tests, Testing Library for React component tests, MSW for API mocking
**Target Platform**: Web app (browser) — desktop and mobile responsive UI, no native apps in v1
**Project Type**: Web application (full-stack monorepo in single Next.js app)
**Constraints**: Responsive design breakpoints (mobile-first): 640px (sm), 768px (md), 1024px (lg), 1280px (xl); dashboard must render in <3s with 500 transactions
**Scale/Scope**: Single admin user (seeded at init), unlimited regular users, <50 UI screens/components, 6 core entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: ESLint (Next.js config), Prettier, TypeScript strict mode, Tailwind linting (via eslint-plugin-tailwindcss).
  All code must pass linting before merge; formatting automated via pre-commit hook or CI.
- **Test First**: Vitest for unit tests (business logic, API handlers, utilities), Testing Library for component rendering,
  integration tests for full user journeys (auth flow, transaction CRUD, dashboard data loading).
  Every API route and component receives a failing-first test; regression suite covers auth state,
  transaction calculations, and limit alert logic.

## Project Structure

### Documentation (this feature)

```text
specs/001-monthly-expense-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── auth.md
│   ├── transactions.md
│   ├── categories.md
│   ├── spending-limits.md
│   ├── admin.md
│   └── dashboard.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Next.js Single App)

```text
monthly-expense-tracker/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── users/                # Admin endpoints
│   │   │   ├── pending/route.ts  # List pending sign-ups
│   │   │   └── [id]/
│   │   │       ├── approve/route.ts
│   │   │       └── reject/route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts         # GET (list, filter), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts     # GET (detail), PUT (update), DELETE
│   │   │       └── export-csv/route.ts
│   │   ├── categories/
│   │   │   ├── route.ts         # GET default, POST create custom
│   │   │   └── [id]/route.ts    # PUT (rename), DELETE
│   │   ├── spending-limits/
│   │   │   ├── route.ts         # GET, POST create
│   │   │   └── [id]/route.ts    # PUT, DELETE
│   │   └── dashboard/route.ts   # GET aggregate data for month/year
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── waiting/page.tsx      # Pending approval screen
│   │   └── error.tsx
│   ├── (protected)/
│   │   ├── layout.tsx            # Auth check wrapper
│   │   ├── page.tsx              # Redirect to dashboard
│   │   ├── dashboard/page.tsx    # Main dashboard with charts
│   │   ├── transactions/
│   │   │   ├── page.tsx         # List + filter + search
│   │   │   ├── new/page.tsx     # New transaction form
│   │   │   ├── [id]/page.tsx    # Detail view
│   │   │   └── [id]/edit/page.tsx
│   │   ├── categories/page.tsx  # List & manage categories
│   │   ├── limits/page.tsx      # Set/manage spending limits
│   │   ├── admin/
│   │   │   └── users/page.tsx   # Manage sign-ups (admin-only)
│   │   └── error.tsx
│   ├── layout.tsx               # Root layout, providers
│   └── page.tsx                 # Landing/Initial route
├── lib/
│   ├── db/                      # Database setup & migrations
│   │   ├── index.ts             # DB initialization
│   │   ├── prisma.ts            # Prisma client initialization
│   │   ├── migrations/          # SQL migration files
│   │   │   ├── 001_init.sql
│   │   │   ├── 002_add_constraints.sql
│   │   │   └── ...
│   │   └── seed.ts              # Seed default categories, admin
│   ├── auth/                    # Authentication logic
│   │   ├── hash.ts              # Password hashing (bcrypt)
│   │   ├── jwt.ts               # Token generation/verification
│   │   ├── middleware.ts        # Auth middleware for API routes
│   │   ├── session.ts           # Session management
│   │   └── constants.ts         # JWT_SECRET, TOKEN_EXPIRY
│   ├── utils/
│   │   ├── validation.ts        # Input validation (zod)
│   │   ├── csv.ts               # CSV export helper
│   │   ├── calculations.ts      # Total/limit calculations
│   │   ├── date.ts              # Date formatting, month extraction
│   │   └── errors.ts            # Custom error classes
│   └── hooks/
│       ├── useAuth.ts
│       ├── useTransactions.ts
│       ├── useCategories.ts
│       ├── useDashboard.ts
│       └── useSpendingLimits.ts
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── AuthFormLayout.tsx
│   ├── dashboard/
│   │   ├── MonthlyOverview.tsx  # Stats cards (total income, expense, balance)
│   │   ├── IncomeExpenseChart.tsx # Bar/line chart month vs month
│   │   ├── CategoryBreakdown.tsx  # Pie/Donut chart
│   │   └── LimitAlerts.tsx       # Alert banners when limit exceeded
│   ├── transactions/
│   │   ├── TransactionForm.tsx  # Reusable form (create/edit)
│   │   ├── TransactionList.tsx  # Table or card list
│   │   ├── TransactionRow.tsx   # Single row/card component
│   │   ├── FilterBar.tsx        # Date, category, type filters
│   │   └── SearchBox.tsx        # Free-text search
│   ├── admin/
│   │   └── PendingUsersList.tsx # Table, Approve/Reject buttons
│   ├── category/
│   │   ├── CategoryForm.tsx
│   │   └── CategoryList.tsx
│   ├── spending-limit/
│   │   ├── LimitForm.tsx
│   │   ├── LimitList.tsx
│   │   └── LimitProgressBar.tsx
│   └── common/
│       ├── Header.tsx           # Top nav, logout
│       ├── Sidebar.tsx          # Nav menu
│       ├── Navigation.tsx       # MainLayout wrapper
│       ├── AlertBanner.tsx      # Success/error notifications
│       ├── Loading.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── public/                       # Static assets
│   └── icons/
├── styles/
│   └── globals.css              # Tailwind directives, custom styles
├── __tests__/
│   ├── unit/
│   │   ├── auth.test.ts         # Hash, JWT, validation
│   │   ├── calculations.test.ts # Total, limit checks
│   │   ├── validation.test.ts   # Zod schemas
│   │   └── date.test.ts
│   ├── integration/
│   │   ├── auth-flow.test.ts    # Sign-up → pending → approve → login
│   │   ├── transaction-crud.test.ts
│   │   ├── dashboard.test.ts
│   │   ├── filter-export.test.ts
│   │   └── spending-limit.test.ts
│   ├── components/
│   │   ├── RegisterForm.test.tsx
│   │   ├── TransactionForm.test.tsx
│   │   ├── DashboardCharts.test.tsx
│   │   └── CategoryBreakdown.test.tsx
│   └── setup.ts                 # Vitest setup, mocks, MSW handlers
├── types/
│   ├── index.ts                 # Common types
│   ├── models.ts                # DB models/entities
│   ├── api.ts                   # API request/response types
│   └── forms.ts                 # Form validation schemas (Zod)
├── .env.example
├── .env.local                   # (local dev, gitignored)
├── .env.test                    # (test environment)
├── package.json
├── tsconfig.json                # Strict mode enabled
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.mjs
├── .prettierrc.json
├── vitest.config.ts
├── next.config.js
├── db.sqlite                    # (auto-created on first run)
└── README.md
```

**Responsive Design Implementation**:
- **Mobile-first approach**: Start with styles for 320px, then use Tailwind's responsive modifiers (sm:, md:, lg:, xl:)
- **Navigation**: Mobile: hamburger menu (sidebar drawer), Desktop: persistent sidebar (md:)
- **Forms**: Mobile: full-width inputs, padding/margin adjusted. Desktop: 2-col layout where applicable
- **Dashboard**: Mobile: stacked stats and charts. Tablet (md:): 2-col grid. Desktop (lg:): 3-col or flex layout
- **Tables/Lists**: Mobile: card grid (1 col). Tablet: 2 cols. Desktop: responsive table or 3-col grid
- **Dashboard charts**: Use recharts library with auto-responsive sizing

**Structure Decision**: Single Next.js 16.x application with App Router.
Frontend components and backend API routes colocated for simplicity. SQLite database with migrations 
managed through Prisma migrations. All responsive design handled via Tailwind's mobile-first approach and CSS Grid/Flexbox. 
TypeScript enforces type safety across the stack; Vitest runs unit and integration tests in CI.

## Complexity Tracking

No constitution violations. All code quality gates (ESLint, Prettier, TypeScript strict mode) are integrated 
into tooling and CI. Test-first strategy is clearly defined for each user story layer (auth, transactions, 
dashboard, admin, categories, spending limits). No architectural shortcuts required for MVP.
