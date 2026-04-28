import { beforeEach, describe, expect, it, vi } from 'vitest';

const user = { id: 'u1', role: 'user' };

const spendingLimits: Array<{
  id: string;
  userId: string;
  limitType: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string } | null;
}> = [];

vi.mock('@/lib/auth/middleware', () => ({
  withActiveUserAuth: (handler: (req: { user: typeof user }) => Promise<Response>) => async () =>
    handler({ user }),
}));

vi.mock('@/lib/db/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(async ({ where: { id } }) =>
        id === user.id ? { ...user, status: 'active' } : null
      ),
    },
    spendingLimit: {
      findMany: vi.fn(async ({ where }) =>
        spendingLimits.filter(
          (l) =>
            l.userId === where.userId &&
            (where.year === undefined || l.year === where.year) &&
            (where.month === undefined || l.month === where.month)
        )
      ),
      findFirst: vi.fn(
        async ({
          where,
        }: {
          where: {
            userId: string;
            year: number;
            month: number;
            categoryId: string | null | undefined;
          };
        }) =>
          spendingLimits.find(
            (l) =>
              l.userId === where.userId &&
              l.year === where.year &&
              l.month === where.month &&
              l.categoryId === (where.categoryId ?? null)
          ) ?? null
      ),
      findUnique: vi.fn(async ({ where: { id } }: { where: { id: string } }) =>
        spendingLimits.find((l) => l.id === id) ?? null
      ),
      create: vi.fn(
        async ({
          data,
        }: {
          data: {
            userId: string;
            limitType: string;
            amount: number;
            month: number;
            year: number;
            categoryId?: string | null;
          };
        }) => {
          const created = {
            id: `lim_${spendingLimits.length + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoryId: null,
            category: null,
            ...data,
          };
          spendingLimits.push(created);
          return created;
        }
      ),
      update: vi.fn(
        async ({ where: { id }, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const idx = spendingLimits.findIndex((l) => l.id === id);
          spendingLimits[idx] = { ...spendingLimits[idx], ...data, updatedAt: new Date() };
          return spendingLimits[idx];
        }
      ),
      delete: vi.fn(async ({ where: { id } }: { where: { id: string } }) => {
        const idx = spendingLimits.findIndex((l) => l.id === id);
        const deleted = spendingLimits[idx];
        spendingLimits.splice(idx, 1);
        return deleted;
      }),
    },
  },
}));

// Import routes after mocks
const getRoute = async () => await import('@/app/api/spending-limits/route');
const getIdRoute = async () => await import('@/app/api/spending-limits/[id]/route');

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Spending Limit API - CRUD', () => {
  beforeEach(() => {
    spendingLimits.length = 0;
  });

  it('GET /api/spending-limits returns empty list initially', async () => {
    const { GET } = await getRoute();
    const req = makeRequest('GET', 'http://localhost/api/spending-limits');
    const res = await GET(req as Parameters<typeof GET>[0]);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.limits).toEqual([]);
  });

  it('POST /api/spending-limits creates a monthly total limit', async () => {
    const { POST } = await getRoute();
    const req = makeRequest('POST', 'http://localhost/api/spending-limits', {
      limitType: 'monthly_total',
      amount: 5000000,
      month: 4,
      year: 2026,
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.amount).toBe(5000000);
    expect(data.limitType).toBe('monthly_total');
    expect(data.categoryId).toBeNull();
  });

  it('POST /api/spending-limits creates a category-specific limit', async () => {
    const { POST } = await getRoute();
    const req = makeRequest('POST', 'http://localhost/api/spending-limits', {
      limitType: 'category',
      amount: 2000000,
      month: 4,
      year: 2026,
      categoryId: 'cat1',
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.amount).toBe(2000000);
    expect(data.categoryId).toBe('cat1');
  });

  it('POST /api/spending-limits rejects invalid data', async () => {
    const { POST } = await getRoute();
    const req = makeRequest('POST', 'http://localhost/api/spending-limits', {
      limitType: 'monthly_total',
      amount: -100, // negative
      month: 4,
      year: 2026,
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });

  it('GET /api/spending-limits lists created limits', async () => {
    const { POST, GET } = await getRoute();

    // Create a limit first
    await POST(
      makeRequest('POST', 'http://localhost/api/spending-limits', {
        limitType: 'monthly_total',
        amount: 5000000,
        month: 4,
        year: 2026,
      }) as Parameters<typeof POST>[0]
    );

    const req = makeRequest('GET', 'http://localhost/api/spending-limits');
    const res = await GET(req as Parameters<typeof GET>[0]);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.limits).toHaveLength(1);
    expect(data.limits[0].amount).toBe(5000000);
  });

  it('PUT /api/spending-limits/[id] updates a limit', async () => {
    const { POST } = await getRoute();
    const createRes = await POST(
      makeRequest('POST', 'http://localhost/api/spending-limits', {
        limitType: 'monthly_total',
        amount: 5000000,
        month: 4,
        year: 2026,
      }) as Parameters<typeof POST>[0]
    );
    const created = await createRes.json();

    const { PUT } = await getIdRoute();
    const updateRes = await PUT(
      makeRequest('PUT', `http://localhost/api/spending-limits/${created.id}`, {
        amount: 7000000,
      }) as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: created.id }) }
    );
    const updated = await updateRes.json();

    expect(updateRes.status).toBe(200);
    expect(updated.amount).toBe(7000000);
  });

  it('DELETE /api/spending-limits/[id] removes a limit', async () => {
    const { POST, GET } = await getRoute();
    const createRes = await POST(
      makeRequest('POST', 'http://localhost/api/spending-limits', {
        limitType: 'monthly_total',
        amount: 5000000,
        month: 4,
        year: 2026,
      }) as Parameters<typeof POST>[0]
    );
    const created = await createRes.json();

    const { DELETE } = await getIdRoute();
    const deleteRes = await DELETE(
      makeRequest('DELETE', `http://localhost/api/spending-limits/${created.id}`) as Parameters<
        typeof DELETE
      >[0],
      { params: Promise.resolve({ id: created.id }) }
    );
    expect(deleteRes.status).toBe(200);

    // List should be empty after delete
    const listRes = await GET(
      makeRequest('GET', 'http://localhost/api/spending-limits') as Parameters<typeof GET>[0]
    );
    const data = await listRes.json();
    expect(data.limits).toHaveLength(0);
  });

  it('DELETE /api/spending-limits/[id] returns 404 for non-existent limit', async () => {
    const { DELETE } = await getIdRoute();
    const res = await DELETE(
      makeRequest('DELETE', 'http://localhost/api/spending-limits/nonexistent') as Parameters<
        typeof DELETE
      >[0],
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );
    expect(res.status).toBe(404);
  });
});

describe('Spending Limit threshold alerts', () => {
  beforeEach(() => {
    spendingLimits.length = 0;
  });

  it('calculateSpendingLimitStatus returns warning at 80%', async () => {
    const { calculateSpendingLimitStatus } = await import('@/lib/utils/calculations');
    const result = calculateSpendingLimitStatus(4000000, 5000000);
    expect(result.status).toBe('warning');
    expect(result.percentage).toBe(80);
  });

  it('calculateSpendingLimitStatus returns exceeded at 100%', async () => {
    const { calculateSpendingLimitStatus } = await import('@/lib/utils/calculations');
    const result = calculateSpendingLimitStatus(5000000, 5000000);
    expect(result.status).toBe('exceeded');
    expect(result.percentage).toBe(100);
  });

  it('calculateSpendingLimitStatus returns normal below 80%', async () => {
    const { calculateSpendingLimitStatus } = await import('@/lib/utils/calculations');
    const result = calculateSpendingLimitStatus(3000000, 5000000);
    expect(result.status).toBe('normal');
    expect(result.percentage).toBe(60);
  });
});
