import { describe, expect, it } from 'vitest';
import { CategorySchema, TransactionSchema, canAccessCategory } from '@/lib/utils/validation';

describe('transaction validation', () => {
  it('rejects non-positive amount', () => {
    const parsed = TransactionSchema.safeParse({
      title: 'Lunch',
      amount: 0,
      type: 'expense',
      date: '2026-04-28',
      categoryId: 'cat_1',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/positive/i);
    }
  });

  it('rejects future date', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const parsed = TransactionSchema.safeParse({
      title: 'Future expense',
      amount: 10000,
      type: 'expense',
      date: tomorrow,
      categoryId: 'cat_1',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/future/i);
    }
  });
});

describe('category ownership', () => {
  it('allows default category for normal user', () => {
    expect(canAccessCategory(true, null, 'u1', 'user')).toBe(true);
  });

  it('allows owned custom category for user', () => {
    expect(canAccessCategory(false, 'u1', 'u1', 'user')).toBe(true);
  });

  it('rejects other user custom category for user role', () => {
    expect(canAccessCategory(false, 'u2', 'u1', 'user')).toBe(false);
  });

  it('allows admin to access any custom category', () => {
    expect(canAccessCategory(false, 'u2', 'admin_1', 'admin')).toBe(true);
  });
});

describe('category validation', () => {
  it('rejects empty category name', () => {
    const parsed = CategorySchema.safeParse({ name: '' });
    expect(parsed.success).toBe(false);
  });
});
