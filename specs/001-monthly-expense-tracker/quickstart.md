# Quickstart: Monthly Expense Tracker Implementation

**Purpose**: Step-by-step guide to bootstrap the existing repository, validate the local environment, and run core checks.
**Target**: Backend/frontend developers onboarding to the current project workspace.

## Prerequisites

- Node.js 20.19.0+ (matches `package.json` engines)
- npm or yarn
- Docker Engine + Docker Compose plugin (recommended for cross-environment setup)
- Git (for version control)

**Target runtime baseline**:
- Next.js 16.x (current stable line)
- App Router enabled
- React version managed by Next.js 16 App Router compatibility

Quick runtime verification:

```bash
node -v   # must be >= 20.19.0
npm -v
```

## Phase 1: Existing Project Setup (5 mins)

The repository is already scaffolded. Use these commands instead of re-running `create-next-app` or `prisma init`.

### 1. Install and configure local environment

```bash
cd monthly-expense-tracker
cp .env.example .env.local
npm install
npx prisma generate
```

### 2. Prepare local database

```bash
npm run db:migrate
npm run db:seed
```

Seed result includes:

- Admin user: `admin@example.com`
- Admin password: `admin123`
- Default categories for income/expense tracking

### 3. Start the application

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Optional Docker runtime

```bash
docker compose up --build
```

Useful one-off container commands:

```bash
docker compose run --rm app npm run db:migrate
docker compose run --rm app npm run db:seed
docker compose run --rm app npm run test
```

## Phase 2: Project Structure Verification (5 mins)

Expected folders after setup:

```
monthly-expense-tracker/
├── app/
│   ├── api/
│   │   └── (routes per contracts/)
│   ├── (auth)/
│   │   ├── register/
│   │   ├── login/
│   │   └── waiting/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── limits/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   └── common/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── components/
├── types/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── styles/
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
└── next.config.js
```

## Phase 3: Validation Commands (10 mins)

Run these before starting new work:

```bash
npm run lint
npm run type-check
npm run test
```

Focused validation used during current implementation:

```bash
npx vitest __tests__/integration/auth-flow.test.ts __tests__/components/ProtectedShell.test.tsx --run
npx vitest __tests__/integration/dashboard.test.ts __tests__/integration/filter-export.test.ts __tests__/integration/spending-limit.test.ts --run
```

## Phase 4: Authentication Setup (15 mins)

### 1. Implement Password Hashing (`lib/auth/hash.ts`)

```typescript
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 2. Implement JWT (`lib/auth/jwt.ts`)

```typescript
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}
```

### 3. Auth Middleware (`lib/auth/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    (request as any).user = payload;
    return handler(request);
  };
}
```

## Phase 5: First Failing Test (20 mins)

### 1. Create Unit Test for Auth

Create `__tests__/unit/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";

describe("Authentication", () => {
  it("should hash and verify password correctly", async () => {
    const password = "SecurePass123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });
});
```

### 2. Run Test (expect FAIL first)

```bash
npm run test

# Test should FAIL because hash.ts doesn't exist yet
# This is the failing-first approach
```

### 3. Implement `lib/auth/hash.ts` to Make Test PASS

```bash
npm run test

# Test should now PASS ✅
```

## Phase 6: Database Query Test (20 mins)

### 1. Create Integration Test

Create `__tests__/integration/user-signup.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/hash";

const prisma = new PrismaClient();

describe("User Sign-up", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should create user in pending status", async () => {
    const email = "testuser@example.com";
    const password = "SecurePass123";
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "user",
        status: "pending",
      },
    });

    expect(user.email).toBe(email);
    expect(user.status).toBe("pending");
    expect(user.role).toBe("user");
  });
});
```

### 2. Configure Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### 3. Run Test

```bash
npm run test

# Should PASS if DB is properly set up
```

## Phase 7: Development Server (5 mins)

### 1. Start Dev Server

```bash
npm run dev

# Server starts at http://localhost:3000
```

### 2. Verify Basic Routes

- Navigate to `http://localhost:3000` (should show landing page)
- Navigate to `http://localhost:3000/register` (should show signup form)
- Navigate to `http://localhost:3000/login` (should show login form)

## Phase 8: API Testing with MSW (15 mins)

### 1. Set Up Mock Service Worker (`__tests__/setup.ts`)

```typescript
import { rest } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
  rest.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
    (req, res, ctx) => {
      return res(ctx.status(201), ctx.json({ id: "uuid", status: "pending" }));
    }
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 2. Write API Test

```typescript
import { render, screen } from "@testing-library/react";
import RegisterForm from "@/components/auth/RegisterForm";

it("should submit registration form and show success", async () => {
  render(<RegisterForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole("button", { name: /register/i });

  // Type email and submit
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.click(submitButton);

  // Should show pending message
  expect(await screen.findByText(/awaiting approval/i)).toBeInTheDocument();
});
```

## Checklist: What to Do Next

After this quickstart:

- [ ] Run `npm run dev` and verify app starts at localhost:3000
- [ ] Run `npm run test` and verify all tests pass
- [ ] Run `npm run type-check`
- [ ] Explore `specs/001-monthly-expense-tracker/contracts/` for API endpoint specs
- [ ] Read `data-model.md` and understand entities
- [ ] Implement first P1 user story (Auth & Approval)
- [ ] Write failing test for each API endpoint before implementation
- [ ] Run linting: `npm run lint`
- [ ] Format code: `npm run format`

## Troubleshooting

**Database error**: Ensure `.env.local` has `DATABASE_URL="file:./prisma/dev.db"` and migrations are applied via `npm run db:migrate`.

**Test fails**: Check that `vitest.config.ts` is configured and Prisma is properly initialized.

**API 401 Unauthorized**: Ensure auth cookie is set and the seeded admin account has been created via `npm run db:seed`.

**Port 3000 in use**: Run on different port via `npm run dev -- -p 3001`.

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
