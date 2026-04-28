import { beforeEach, describe, expect, it, vi } from 'vitest';

const user = { id: 'u1', role: 'user' };
const categories = [
  { id: 'cat_default', name: 'Food', isDefault: true, ownerId: null },
  { id: 'cat_custom', name: 'Pet', isDefault: false, ownerId: 'u1' },
  { id: 'cat_other', name: 'Other user', isDefault: false, ownerId: 'u2' },
];
const transactions: Array<{
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}> = [];

vi.mock('@/lib/auth/middleware', () => ({
  withActiveUserAuth: (handler: (req: { user: typeof user }) => Promise<Response>) => async () =>
    handler({ user }),
}));

vi.mock('@/lib/db/prisma', () => ({
  default: {
    category: {
      findUnique: vi.fn(async ({ where: { id } }) => categories.find((c) => c.id === id) || null),
      findMany: vi.fn(async ({ where }) =>
        categories.filter((c) => c.isDefault || c.ownerId === where.OR?.[1]?.ownerId)
      ),
      create: vi.fn(async ({ data }) => {
        const created = { id: `cat_${Date.now()}`, isDefault: false, ...data };
        categories.push(created);
        return created;
      }),
      update: vi.fn(async ({ where: { id }, data }) => {
        const idx = categories.findIndex((c) => c.id === id);
        categories[idx] = { ...categories[idx], ...data };
        return categories[idx];
      }),
      delete: vi.fn(async ({ where: { id } }) => {
        const idx = categories.findIndex((c) => c.id === id);
        const deleted = categories[idx];
        categories.splice(idx, 1);
        return deleted;
      }),
    },
    transaction: {
      findMany: vi.fn(async ({ where }) =>
        transactions.filter((t) => {
          if (where.userId && t.userId !== where.userId) return false;
          if (where.categoryId && t.categoryId !== where.categoryId) return false;
          return true;
        })
      ),
      count: vi.fn(
        async ({ where }) =>
          transactions.filter((t) => {
            if (where.userId && t.userId !== where.userId) return false;
            if (where.categoryId && t.categoryId !== where.categoryId) return false;
            return true;
          }).length
      ),
      create: vi.fn(async ({ data }) => {
        const created = {
          id: `tx_${transactions.length + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: null,
          ...data,
        };
        transactions.push(created);
        return created;
      }),
      findUnique: vi.fn(async ({ where: { id } }) => transactions.find((t) => t.id === id) || null),
      update: vi.fn(async ({ where: { id }, data }) => {
        const idx = transactions.findIndex((t) => t.id === id);
        transactions[idx] = { ...transactions[idx], ...data, updatedAt: new Date() };
        return transactions[idx];
      }),
      delete: vi.fn(async ({ where: { id } }) => {
        const idx = transactions.findIndex((t) => t.id === id);
        const deleted = transactions[idx];
        transactions.splice(idx, 1);
        return deleted;
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        let count = 0;
        for (const tx of transactions) {
          if (tx.userId === where.userId && tx.categoryId === where.categoryId) {
            tx.categoryId = data.categoryId;
            count += 1;
          }
        }
        return { count };
      }),
    },
  },
}));

import { GET as listTransactions, POST as createTransaction } from '@/app/api/transactions/route';
import {
  DELETE as deleteCategory,
  POST as reassignCategory,
} from '@/app/api/categories/[id]/route';

describe('transaction/category integration', () => {
  beforeEach(() => {
    transactions.length = 0;
  });

  it('covers create/list transactions and category delete policy', async () => {
    const createReq = new Request('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Lunch',
        amount: 50000,
        type: 'expense',
        date: '2026-04-20',
        categoryId: 'cat_custom',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const createdRes = await createTransaction(createReq);
    expect(createdRes.status).toBe(201);

    const listReq = new Request('http://localhost/api/transactions?type=expense');
    const listedRes = await listTransactions(listReq);
    const listedBody = (await listedRes.json()) as {
      transactions: Array<{ title: string }>;
      total: number;
    };

    expect(listedRes.status).toBe(200);
    expect(listedBody.total).toBe(1);
    expect(listedBody.transactions[0]?.title).toBe('Lunch');

    const deleteBlockedReq = new Request('http://localhost/api/categories/cat_custom', {
      method: 'DELETE',
    });
    const blockedRes = await deleteCategory(deleteBlockedReq, {
      params: Promise.resolve({ id: 'cat_custom' }),
    });

    expect(blockedRes.status).toBe(400);

    const reassignReq = new Request('http://localhost/api/categories/cat_custom', {
      method: 'POST',
      body: JSON.stringify({ targetCategoryId: 'cat_default' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const reassignRes = await reassignCategory(reassignReq, {
      params: Promise.resolve({ id: 'cat_custom' }),
    });

    expect(reassignRes.status).toBe(200);

    const deleteReq = new Request('http://localhost/api/categories/cat_custom', {
      method: 'DELETE',
    });
    const deletedRes = await deleteCategory(deleteReq, {
      params: Promise.resolve({ id: 'cat_custom' }),
    });

    expect(deletedRes.status).toBe(204);
  });
});
