# Monthly Expense Tracker

## Phase 3 (US1) Failing-First Auth Flow

The auth/admin approval flow is implemented test-first with these checkpoints:

1. Unit tests validate password hashing, JWT verification, and account status login policy.
2. Component tests cover register/login form validation, submission states, and error handling.
3. Integration test verifies the critical path:
   - Register account (status pending)
   - Reject login while pending
   - Admin approves account
   - Login succeeds for active account

Run the suite:

```bash
npm run test
```

Run only auth-flow related tests:

```bash
npx vitest __tests__/unit/auth.test.ts __tests__/components/RegisterForm.test.tsx __tests__/components/LoginForm.test.tsx __tests__/integration/auth-flow.test.ts
```

## Phase 4 (US2) Failing-First Transaction/Category Flow

US2 is also implemented test-first with these checkpoints:

1. Unit tests validate amount/date constraints and category ownership rules.
2. Component tests validate transaction form and category form behavior.
3. Integration test verifies core lifecycle:
   - Create and list transactions with filters
   - Block category deletion when related transactions exist
   - Reassign transactions to another category
   - Delete category successfully after reassignment

Run US2 focused tests:

```bash
npx vitest __tests__/unit/validation.test.ts __tests__/components/TransactionForm.test.tsx __tests__/components/CategoryForm.test.tsx __tests__/integration/transaction-crud.test.ts --run
```

## Phase 5 (US3) Failing-First Dashboard Flow

US3 follows the same failing-first approach for the monthly dashboard:

1. Unit tests verify `calculateCategoryBreakdown` and `calculateSpendingLimitStatus` logic.
2. Component tests verify `MonthlyOverview` renders income/expense/balance and `CategoryBreakdown` renders category names and percentages.
3. Integration tests mock the `/api/dashboard` endpoint and verify month switching, category breakdown, monthly trend, and empty states.

Dashboard features:
- Summary cards: total income, total expense, balance, transaction count
- Bar chart: last 3 months income vs expense trend (recharts)
- Pie chart: expense breakdown by category (recharts)
- Spending limit alerts: warning (≥80%) and exceeded (≥100%) badges

Run US3 focused tests:

```bash
npx vitest __tests__/unit/calculations.test.ts __tests__/components/DashboardCharts.test.tsx __tests__/components/CategoryBreakdown.test.tsx __tests__/integration/dashboard.test.ts --run
```

## Phase 6 (US4) Failing-First Filter & CSV Export Flow

US4 completes the filtering and export workflow with tests first:

1. Unit tests verify CSV formatting (`formatCsvValue`) and transaction serialization (`serializeTransactionsToCsv`).
2. Integration tests verify combined filters, search behavior, and CSV export with multiple filter combinations.
3. API route `/api/transactions/export-csv` accepts all transaction filters and returns CSV attachment.

Filter/export features:
- Advanced filters: month, type, date range, category, search
- Export button on transactions list (disabled when no results)
- CSV includes: Date, Title, Type, Amount, Category, Notes
- CSV properly escapes special characters and multiline text

Run US4 focused tests:

```bash
npx vitest __tests__/unit/csv.test.ts __tests__/integration/filter-export.test.ts --run
```

## Phase 7 (US5) Failing-First Spending Limits & Alerts Flow

US5 adds monthly and per-category spending limits with threshold-based alerts, implemented test-first:

1. Unit tests verify `calculateSpendingLimitStatus` returns `normal` / `warning` (≥80%) / `exceeded` (≥100%) correctly.
2. Component tests validate `LimitForm` submission, validation errors, and `LimitAlerts` renders warning/exceeded states with correct colors and labels.
3. Integration tests verify full CRUD for `/api/spending-limits` and `/api/spending-limits/[id]`: create, list, update, delete, and 404 for missing records.

Spending limit features:
- Monthly total limit: alert when overall expense for the month nears or exceeds the cap.
- Per-category limit: alert when expense in a specific category nears or exceeds the cap.
- Dashboard `LimitAlerts` component shows inline yellow (warning) / red (exceeded) banners.
- `/limits` page lets users manage limits by month with an add form and delete actions.

Run US5 focused tests:

```bash
npx vitest __tests__/unit/calculations.test.ts __tests__/components/LimitForm.test.tsx __tests__/components/LimitAlerts.test.tsx __tests__/integration/spending-limit.test.ts --run
```

