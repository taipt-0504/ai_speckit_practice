# Developer Guide

## Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Node.js | 20.19.0+ | Runtime |
| npm | 10+ | Package manager |
| Docker | 24+ | Containerized dev (optional) |
| Docker Compose | v2+ | Multi-service orchestration |

---

## Local Setup (No Docker)

### 1. Install dependencies

```bash
cd monthly-expense-tracker
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-strong-random-secret-here"
JWT_EXPIRY="7d"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> **Security**: `JWT_SECRET` must be a long random string (≥ 32 characters). Never commit `.env` to version control.

### 3. Run database migrations

```bash
npm run db:migrate
```

This creates `prisma/dev.db` and runs all pending migrations.

### 4. Seed the database

```bash
npm run db:seed
```

Seeds the database with:
- Admin user: `admin@example.com` / `admin123`
- 8 default categories: Ăn uống, Di chuyển, Nhà ở, Giải trí, Sức khỏe, Mua sắm, Thu nhập, Khác

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker Setup

### Build and start

```bash
docker-compose up --build
```

The app runs at [http://localhost:3000](http://localhost:3000). The Docker setup runs migrations and seed automatically on startup.

### Stop

```bash
docker-compose down
```

### Rebuild after dependency changes

```bash
docker-compose up --build --force-recreate
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js in development mode (hot reload) |
| Production build | `npm run build` | Build the app for production |
| Production server | `npm run start` | Start the built production app |
| Lint | `npm run lint` | Run ESLint on all `.ts` / `.tsx` files |
| Format | `npm run format` | Run Prettier on all files |
| Type check | `npm run type-check` | Run `tsc --noEmit` (no output files) |
| Tests | `npm run test` | Run all tests with Vitest |
| Tests (UI) | `npm run test:ui` | Open Vitest browser UI |
| DB migrate | `npm run db:migrate` | Apply pending Prisma migrations |
| DB seed | `npm run db:seed` | Seed admin user + default categories |
| Prisma generate | `npm run prisma:generate` | Regenerate Prisma client after schema change |

---

## Project Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config — strict mode, path aliases |
| `next.config.js` | Next.js config |
| `tailwind.config.ts` | Tailwind theme and content paths |
| `postcss.config.js` | PostCSS (Tailwind plugin) |
| `vitest.config.ts` | Vitest test runner config |
| `eslint.config.mjs` | ESLint flat config (Next.js + Prettier + Tailwind) |
| `prisma.config.ts` | Prisma configuration for migrations |
| `prisma/schema.prisma` | Database schema |

---

## Database Management

### Prisma workflow

```bash
# Edit prisma/schema.prisma, then:
npm run db:migrate        # Create and apply migration
npm run prisma:generate   # Regenerate Prisma client types
```

### View database

```bash
npx prisma studio
```

Opens a browser UI at `http://localhost:5555` to browse data.

### Reset database (destructive)

```bash
npx prisma migrate reset
npm run db:seed
```

> **Warning**: This drops all data and re-runs all migrations from scratch.

### Migration files

Migrations live in `prisma/migrations/`. Each is a folder with a timestamped name and a `migration.sql` file. Never edit applied migration files manually.

---

## Testing

### Test structure

```
__tests__/
├── setup.ts                    # Global setup: MSW server, testing-library/jest-dom
├── unit/
│   ├── auth.test.ts            # Auth service unit tests
│   ├── calculations.test.ts    # Pure calculation function tests
│   ├── csv.test.ts             # CSV serialization tests
│   └── validation.test.ts      # Zod schema validation tests
├── components/
│   ├── LoginForm.test.tsx       # LoginForm rendering + interaction
│   ├── RegisterForm.test.tsx    # RegisterForm rendering + interaction
│   ├── TransactionForm.test.tsx # Transaction form rendering + interaction
│   ├── CategoryForm.test.tsx    # Category form rendering
│   ├── CategoryBreakdown.test.tsx
│   └── DashboardCharts.test.tsx
└── integration/
    ├── auth-flow.test.ts        # Full register → login → logout journey
    ├── transaction-crud.test.ts # Create/read/update/delete transactions
    ├── filter-export.test.ts    # Filtering and CSV export
    └── dashboard.test.ts        # Dashboard data aggregation
```

### Run tests

```bash
# All tests
npm run test

# Watch mode
npx vitest

# Specific file
npx vitest __tests__/unit/calculations.test.ts

# Integration tests only
npx vitest __tests__/integration/ --run

# With coverage
npx vitest --coverage
```

### Test architecture

- **Unit tests**: Test pure functions in `lib/utils/` and `lib/auth/` in isolation.
- **Component tests**: Use `@testing-library/react` with `jsdom` to render components and assert on DOM output. HTTP calls are intercepted by MSW service workers.
- **Integration tests**: Test the full request→response cycle by importing Next.js route handlers directly, using an in-memory SQLite database.

### MSW (Mock Service Worker)

MSW is configured in `__tests__/setup.ts`. Handlers live per test file using `server.use(http.get(...))`. The MSW server is started before all tests and reset between test files.

### Writing a new test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('myFeature', () => {
  it('should do X when Y', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

For component tests, import from `@testing-library/react`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

it('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected text')).toBeInTheDocument();
});
```

---

## Code Quality

### Linting

```bash
npm run lint
```

ESLint uses a flat config (`eslint.config.mjs`) with:
- `eslint-config-next` base rules
- `eslint-plugin-tailwindcss` for class ordering
- `eslint-plugin-prettier` for format integration
- Global ignores: `node_modules/`, `.next/`, `dist/`, `prisma/migrations/`

### Formatting

```bash
npm run format
```

Prettier formats TypeScript, TSX, JSON, CSS, and Markdown. Configuration is in `.prettierrc` (if present) or defaults.

### Type checking

```bash
npm run type-check
```

Runs TypeScript compiler in no-emit mode. Must pass with zero errors before merging.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | SQLite file path: `file:./prisma/dev.db` |
| `JWT_SECRET` | Yes | — | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRY` | No | `7d` | Token expiry duration |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3000` | Base URL for client-side API calls |

---

## Adding New Features

### Add a new API endpoint

1. Create `app/api/<resource>/route.ts`
2. Wrap the handler with `withActiveUserAuth` (or `withAdminAuth` for admin endpoints)
3. Use Zod for request body validation
4. Add corresponding test in `__tests__/integration/`

```typescript
import { NextRequest } from 'next/server';
import { withActiveUserAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export const GET = withActiveUserAuth(async (req: NextRequest, user) => {
  const data = await prisma.myModel.findMany({ where: { userId: user.id } });
  return Response.json({ data });
});
```

### Add a new page

1. Create `app/(protected)/<page>/page.tsx`
2. Add navigation link to `components/common/Sidebar.tsx`
3. Create a custom hook in `lib/hooks/` if the page needs API data
4. Write component test in `__tests__/components/`

### Modify the database schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` — follow prompts to name the migration
3. Run `npm run prisma:generate` to update Prisma client
4. Update relevant types and tests
