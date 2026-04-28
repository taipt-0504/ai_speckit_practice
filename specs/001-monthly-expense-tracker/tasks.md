# Tasks: Monthly Expense Tracker

**Input**: Design documents from `/specs/001-monthly-expense-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated test tasks are REQUIRED. Every user story and every shared foundation change includes failing-first test coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and demonstrated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, ...)
- Every task includes the exact file path to touch

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js 16 + TypeScript + Tailwind workspace and baseline quality tooling.

- [x] T001 Initialize the Next.js 16 app workspace and scripts in monthly-expense-tracker/package.json
- [x] T002 Configure TypeScript, Next.js, and environment templates in monthly-expense-tracker/tsconfig.json, monthly-expense-tracker/next.config.js, and monthly-expense-tracker/.env.example
- [x] T003 [P] Configure Tailwind, PostCSS, and global styles in monthly-expense-tracker/tailwind.config.ts, monthly-expense-tracker/postcss.config.js, and monthly-expense-tracker/styles/globals.css
- [x] T004 [P] Configure ESLint, Prettier, and Tailwind lint rules in monthly-expense-tracker/eslint.config.mjs and monthly-expense-tracker/.prettierrc.json
- [x] T005 [P] Configure Vitest, Testing Library, and MSW test bootstrap in monthly-expense-tracker/vitest.config.ts and monthly-expense-tracker/__tests__/setup.ts
- [x] T005A [P] Add Docker-based development/runtime setup in monthly-expense-tracker/Dockerfile, monthly-expense-tracker/docker-compose.yml, monthly-expense-tracker/.dockerignore, and monthly-expense-tracker/.nvmrc

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish database, auth, validation, shared layout, and base API primitives required by every story.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T006 Create the Prisma schema for User, Category, Transaction, SpendingLimit, and Session in monthly-expense-tracker/prisma/schema.prisma
- [x] T007 Generate the initial SQLite migration and migration config in monthly-expense-tracker/prisma/migrations/ and monthly-expense-tracker/prisma/migrations/migration_lock.toml
- [x] T008 [P] Seed the admin account and default categories in monthly-expense-tracker/prisma/seed.ts
- [x] T009 [P] Create the shared Prisma client and database bootstrap in monthly-expense-tracker/lib/db/prisma.ts and monthly-expense-tracker/lib/db/index.ts
- [x] T010 [P] Implement shared Zod validation schemas and domain types in monthly-expense-tracker/lib/utils/validation.ts and monthly-expense-tracker/types/forms.ts
- [x] T011 [P] Implement JWT, password hashing, auth constants, and session helpers in monthly-expense-tracker/lib/auth/hash.ts, monthly-expense-tracker/lib/auth/jwt.ts, monthly-expense-tracker/lib/auth/constants.ts, and monthly-expense-tracker/lib/auth/session.ts
- [x] T012 Implement auth and role guards for API routes and protected pages in monthly-expense-tracker/lib/auth/middleware.ts and monthly-expense-tracker/app/(protected)/layout.tsx
- [x] T013 [P] Build the shared application shell and notification primitives in monthly-expense-tracker/app/layout.tsx, monthly-expense-tracker/components/common/Header.tsx, monthly-expense-tracker/components/common/Sidebar.tsx, monthly-expense-tracker/components/common/Navigation.tsx, monthly-expense-tracker/components/common/AlertBanner.tsx, and monthly-expense-tracker/components/common/Loading.tsx

**Checkpoint**: Foundation ready. User story work can now proceed in priority order or in parallel where dependencies allow.

---

## Phase 3: User Story 1 - Đăng ký và phê duyệt tài khoản (Priority: P1) 🎯 MVP

**Goal**: Deliver registration, pending approval, admin review, approve/reject actions, and login/logout for active users.

**Independent Test**: Register a new account, verify it is blocked while pending, approve it as admin, then log in successfully with the approved account.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests first and confirm they fail before implementation.**

- [x] T014 [P] [US1] Add unit tests for password, token, and account-status rules in monthly-expense-tracker/__tests__/unit/auth.test.ts
- [x] T015 [P] [US1] Add component tests for signup/login form states in monthly-expense-tracker/__tests__/components/RegisterForm.test.tsx and monthly-expense-tracker/__tests__/components/LoginForm.test.tsx
- [x] T016 [P] [US1] Add integration tests for sign-up, pending login rejection, admin approval, and successful login in monthly-expense-tracker/__tests__/integration/auth-flow.test.ts
- [x] T017 [US1] Document the failing-first auth execution flow in monthly-expense-tracker/README.md

### Implementation for User Story 1

- [x] T018 [P] [US1] Implement the registration, login, logout, and current-user API routes in monthly-expense-tracker/app/api/auth/register/route.ts, monthly-expense-tracker/app/api/auth/login/route.ts, monthly-expense-tracker/app/api/auth/logout/route.ts, and monthly-expense-tracker/app/api/auth/me/route.ts
- [x] T019 [P] [US1] Implement the admin pending-users, approve, and reject API routes in monthly-expense-tracker/app/api/users/pending/route.ts, monthly-expense-tracker/app/api/users/[id]/approve/route.ts, and monthly-expense-tracker/app/api/users/[id]/reject/route.ts
- [x] T020 [P] [US1] Build the auth pages and reusable auth forms in monthly-expense-tracker/app/(auth)/register/page.tsx, monthly-expense-tracker/app/(auth)/login/page.tsx, monthly-expense-tracker/app/(auth)/waiting/page.tsx, monthly-expense-tracker/components/auth/RegisterForm.tsx, monthly-expense-tracker/components/auth/LoginForm.tsx, and monthly-expense-tracker/components/auth/AuthFormLayout.tsx
- [x] T021 [US1] Build the admin approval screen in monthly-expense-tracker/app/(protected)/admin/users/page.tsx and monthly-expense-tracker/components/admin/PendingUsersList.tsx
- [x] T022 [US1] Add auth state hooks, route redirects, and session wiring in monthly-expense-tracker/lib/hooks/useAuth.ts and monthly-expense-tracker/app/(protected)/page.tsx

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Quản lý khoản thu/chi và danh mục (Priority: P2)

**Goal**: Let approved users create, edit, delete, and list transactions with default or custom categories.

**Independent Test**: Log in, create income and expense transactions, add a custom category, edit one transaction, and delete another while validations hold.

### Tests for User Story 2 ⚠️

- [x] T023 [P] [US2] Add unit tests for transaction validation, category ownership, and amount/date rules in monthly-expense-tracker/__tests__/unit/validation.test.ts
- [x] T024 [P] [US2] Add component tests for transaction and category forms in monthly-expense-tracker/__tests__/components/TransactionForm.test.tsx and monthly-expense-tracker/__tests__/components/CategoryForm.test.tsx
- [x] T025 [P] [US2] Add integration tests for transaction CRUD, blocked category deletion when transactions exist, and successful deletion only after reassignment in monthly-expense-tracker/__tests__/integration/transaction-crud.test.ts
- [x] T026 [US2] Document the failing-first transaction/category workflow in monthly-expense-tracker/README.md

### Implementation for User Story 2

- [x] T027 [P] [US2] Implement transaction calculation and filtering helpers in monthly-expense-tracker/lib/utils/calculations.ts and monthly-expense-tracker/lib/utils/date.ts
- [x] T028 [P] [US2] Implement transaction list/create and detail/update/delete API routes in monthly-expense-tracker/app/api/transactions/route.ts and monthly-expense-tracker/app/api/transactions/[id]/route.ts
- [x] T029 [P] [US2] Implement category list/create/rename/delete API routes plus transaction-reassignment action before delete in monthly-expense-tracker/app/api/categories/route.ts and monthly-expense-tracker/app/api/categories/[id]/route.ts
- [x] T030 [P] [US2] Build transaction form, list, row, and search/filter UI primitives in monthly-expense-tracker/components/transactions/TransactionForm.tsx, monthly-expense-tracker/components/transactions/TransactionList.tsx, monthly-expense-tracker/components/transactions/TransactionRow.tsx, monthly-expense-tracker/components/transactions/FilterBar.tsx, and monthly-expense-tracker/components/transactions/SearchBox.tsx
- [x] T031 [P] [US2] Build category management UI with mandatory reassignment flow before delete in monthly-expense-tracker/components/category/CategoryForm.tsx, monthly-expense-tracker/components/category/CategoryList.tsx, and monthly-expense-tracker/app/(protected)/categories/page.tsx
- [x] T032 [US2] Build transaction pages and hooks in monthly-expense-tracker/app/(protected)/transactions/page.tsx, monthly-expense-tracker/app/(protected)/transactions/new/page.tsx, monthly-expense-tracker/app/(protected)/transactions/[id]/page.tsx, monthly-expense-tracker/app/(protected)/transactions/[id]/edit/page.tsx, monthly-expense-tracker/lib/hooks/useTransactions.ts, and monthly-expense-tracker/lib/hooks/useCategories.ts
- [x] T033 [US2] Enforce deletion policy: reject category deletion when related transactions exist, require reassignment target, then allow delete; include consistent error handling in monthly-expense-tracker/lib/utils/errors.ts and monthly-expense-tracker/app/api/categories/[id]/route.ts

**Checkpoint**: User Stories 1 and 2 should work independently, with users managing their own financial records.

---

## Phase 5: User Story 3 - Dashboard biểu đồ theo dõi hàng tháng (Priority: P3)

**Goal**: Show monthly totals, category breakdown, and trend charts for the authenticated user.

**Independent Test**: Seed transactions across categories and months, load the dashboard, verify totals and charts for the selected month, and confirm the empty-state behavior.

### Tests for User Story 3 ⚠️

- [x] T034 [P] [US3] Add unit tests for monthly aggregation and category breakdown logic in monthly-expense-tracker/__tests__/unit/calculations.test.ts
- [x] T035 [P] [US3] Add component tests for dashboard chart and overview rendering in monthly-expense-tracker/__tests__/components/DashboardCharts.test.tsx and monthly-expense-tracker/__tests__/components/CategoryBreakdown.test.tsx
- [x] T036 [P] [US3] Add integration tests for dashboard aggregates, month switching, and empty states in monthly-expense-tracker/__tests__/integration/dashboard.test.ts
- [x] T037 [US3] Document the failing-first dashboard validation flow in monthly-expense-tracker/README.md

### Implementation for User Story 3

- [x] T038 [P] [US3] Implement the dashboard aggregate API route in monthly-expense-tracker/app/api/dashboard/route.ts
- [x] T039 [P] [US3] Build the dashboard visualization components in monthly-expense-tracker/components/dashboard/MonthlyOverview.tsx, monthly-expense-tracker/components/dashboard/IncomeExpenseChart.tsx, and monthly-expense-tracker/components/dashboard/CategoryBreakdown.tsx
- [x] T040 [P] [US3] Implement dashboard data loading and month selection state in monthly-expense-tracker/lib/hooks/useDashboard.ts
- [x] T041 [US3] Build the responsive dashboard page and empty state in monthly-expense-tracker/app/(protected)/dashboard/page.tsx

**Checkpoint**: User Stories 1-3 now provide an MVP with auth, transaction capture, and monthly insight dashboard.

---

## Phase 6: User Story 4 - Lọc, tìm kiếm và export CSV (Priority: P4)

**Goal**: Let users filter and search transactions and export the active result set to CSV.

**Independent Test**: Apply combined filters and search terms to a populated transaction list, then export the exact result set to CSV and verify the file contents.

### Tests for User Story 4 ⚠️

- [x] T042 [P] [US4] Add unit tests for filter parsing and CSV serialization helpers in monthly-expense-tracker/__tests__/unit/date.test.ts and monthly-expense-tracker/__tests__/unit/csv.test.ts
- [x] T043 [P] [US4] Add integration tests for combined filters, search behavior, and CSV export in monthly-expense-tracker/__tests__/integration/filter-export.test.ts
- [x] T044 [US4] Document the failing-first filter/export workflow in monthly-expense-tracker/README.md

### Implementation for User Story 4

- [x] T045 [P] [US4] Implement CSV generation helpers in monthly-expense-tracker/lib/utils/csv.ts
- [x] T046 [P] [US4] Implement the filtered CSV export route in monthly-expense-tracker/app/api/transactions/export-csv/route.ts
- [x] T047 [P] [US4] Extend transaction query/filter behavior in monthly-expense-tracker/app/api/transactions/route.ts and monthly-expense-tracker/lib/hooks/useTransactions.ts
- [x] T048 [US4] Wire filter, search, and export interactions into the transaction list UI in monthly-expense-tracker/app/(protected)/transactions/page.tsx and monthly-expense-tracker/components/transactions/FilterBar.tsx

**Checkpoint**: Users can narrow transaction data quickly and export the current results without affecting earlier stories.

---

## Phase 7: User Story 5 - Hạn mức chi tiêu và cảnh báo (Priority: P5)

**Goal**: Let users define monthly or category spending limits and show threshold alerts on the dashboard.

**Independent Test**: Set a monthly limit, enter expenses to cross 80% and 100%, then verify warning/exceeded states and edit/delete limit behavior.

### Tests for User Story 5 ⚠️

- [ ] T049 [P] [US5] Add unit tests for limit-threshold and progress calculations in monthly-expense-tracker/__tests__/unit/calculations.test.ts
- [ ] T050 [P] [US5] Add component tests for limit forms and alert rendering in monthly-expense-tracker/__tests__/components/LimitForm.test.tsx and monthly-expense-tracker/__tests__/components/LimitAlerts.test.tsx
- [ ] T051 [P] [US5] Add integration tests for spending-limit CRUD and alert thresholds in monthly-expense-tracker/__tests__/integration/spending-limit.test.ts
- [ ] T052 [US5] Document the failing-first limit workflow in monthly-expense-tracker/README.md

### Implementation for User Story 5

- [ ] T053 [P] [US5] Implement spending-limit API routes in monthly-expense-tracker/app/api/spending-limits/route.ts and monthly-expense-tracker/app/api/spending-limits/[id]/route.ts
- [ ] T054 [P] [US5] Build limit management and alert components in monthly-expense-tracker/components/spending-limit/LimitForm.tsx, monthly-expense-tracker/components/spending-limit/LimitList.tsx, monthly-expense-tracker/components/spending-limit/LimitProgressBar.tsx, and monthly-expense-tracker/components/dashboard/LimitAlerts.tsx
- [ ] T055 [US5] Build the limits page and integrate limit data into dashboard hooks in monthly-expense-tracker/app/(protected)/limits/page.tsx and monthly-expense-tracker/lib/hooks/useSpendingLimits.ts

**Checkpoint**: All user stories are independently functional, including proactive spending alerts.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finish documentation, hardening, responsive cleanup, and full validation across the delivered stories.

- [ ] T056 [P] Update developer onboarding and run commands in monthly-expense-tracker/README.md
- [ ] T057 Refine shared responsive layout behavior and accessibility states in monthly-expense-tracker/components/common/Navigation.tsx, monthly-expense-tracker/components/common/Sidebar.tsx, and monthly-expense-tracker/styles/globals.css
- [ ] T058 Re-run and fix lint, type-check, and formatting issues via monthly-expense-tracker/eslint.config.mjs, monthly-expense-tracker/tsconfig.json, and monthly-expense-tracker/.prettierrc.json
- [ ] T059 [P] Add regression coverage for cross-story calculations and auth edge cases in monthly-expense-tracker/__tests__/integration/dashboard.test.ts and monthly-expense-tracker/__tests__/integration/auth-flow.test.ts
- [ ] T060 Harden auth/session error handling and unauthorized states in monthly-expense-tracker/lib/auth/middleware.ts, monthly-expense-tracker/app/(auth)/error.tsx, and monthly-expense-tracker/app/(protected)/error.tsx
- [ ] T061 Run the documented quickstart validation and update any drift in monthly-expense-tracker/README.md and specs/001-monthly-expense-tracker/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **User Stories (Phases 3-7)**: Depend on Phase 2 completion.
- **Polish (Phase 8)**: Depends on completion of all desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational; no dependency on other user stories.
- **US2 (P2)**: Depends on US1 auth/session flow being available.
- **US3 (P3)**: Depends on US2 transaction data and shared auth.
- **US4 (P4)**: Depends on US2 transaction list/query support.
- **US5 (P5)**: Depends on US2 transaction data and US3 dashboard surfaces.

### Within Each User Story

- Tests must be authored and failing before implementation.
- Shared calculations/validation logic should land before route handlers that depend on it.
- Route handlers should land before page-level integration.
- UI pages should finish only after hooks and API contracts are in place.
- Story sign-off requires regression, lint, and type-check verification.

### Parallel Opportunities

- T003-T005 can run in parallel after T001-T002.
- T008-T011 and T013 can run in parallel after T006-T007 begins.
- Within each story, unit tests, component tests, and integration tests marked `[P]` can be authored in parallel.
- API-route tasks and component tasks marked `[P]` can run in parallel once their shared helpers are ready.
- US4 can be developed in parallel with late-stage US3 stabilization after US2 is complete.

---

## Parallel Example: User Story 2

```bash
# Launch User Story 2 test authoring in parallel:
Task: "Add unit tests for transaction validation, category ownership, and amount/date rules in monthly-expense-tracker/__tests__/unit/validation.test.ts"
Task: "Add component tests for transaction and category forms in monthly-expense-tracker/__tests__/components/TransactionForm.test.tsx and monthly-expense-tracker/__tests__/components/CategoryForm.test.tsx"
Task: "Add integration tests for transaction CRUD, blocked category deletion when transactions exist, and successful deletion only after reassignment in monthly-expense-tracker/__tests__/integration/transaction-crud.test.ts"

# Launch User Story 2 implementation slices in parallel after helpers are ready:
Task: "Implement transaction list/create and detail/update/delete API routes in monthly-expense-tracker/app/api/transactions/route.ts and monthly-expense-tracker/app/api/transactions/[id]/route.ts"
Task: "Implement category list/create/rename/delete API routes plus transaction-reassignment action before delete in monthly-expense-tracker/app/api/categories/route.ts and monthly-expense-tracker/app/api/categories/[id]/route.ts"
Task: "Build transaction form, list, row, and search/filter UI primitives in monthly-expense-tracker/components/transactions/TransactionForm.tsx, monthly-expense-tracker/components/transactions/TransactionList.tsx, monthly-expense-tracker/components/transactions/TransactionRow.tsx, monthly-expense-tracker/components/transactions/FilterBar.tsx, and monthly-expense-tracker/components/transactions/SearchBox.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate registration, pending state, admin approval, and active login end-to-end.
5. Demo the auth/admin workflow before expanding scope.

### Incremental Delivery

1. Deliver Setup + Foundational once and keep them stable.
2. Add US1 for secure access control.
3. Add US2 for transaction capture and category management.
4. Add US3 for monthly insight dashboard.
5. Add US4 for data retrieval/export convenience.
6. Add US5 for proactive spending alerts.
7. Finish with Phase 8 polish and full quickstart validation.

### Parallel Team Strategy

1. One developer completes setup/tooling while another prepares Prisma schema and tests.
2. After Foundational, Developer A can drive US1 while Developer B prepares US2 component/test shells.
3. Once US2 lands, dashboard and export/limit work can split across separate developers with minimal overlap.

---

## Notes

- `[P]` tasks touch separate files and are safe to parallelize.
- `[US#]` labels preserve traceability from task to user story.
- Every story includes failing-first tests plus regression expectations.
- File paths assume the implementation workspace root is `monthly-expense-tracker/` as defined in the plan.
- Avoid bundling unrelated cross-story changes into a single task; keep each increment independently testable.
