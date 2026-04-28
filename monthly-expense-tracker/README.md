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
