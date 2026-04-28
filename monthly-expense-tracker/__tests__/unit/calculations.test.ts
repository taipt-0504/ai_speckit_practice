import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  calculateCategoryBreakdown,
  calculateSpendingLimitStatus,
  filterTransactionsByKeyword,
  getBalance,
} from '@/lib/utils/calculations';
import type { Transaction } from '@/types/forms';

function makeTransaction(
  overrides: Partial<Transaction & { category?: { id: string; name: string } }>
): Transaction & { category?: { id: string; name: string } } {
  return {
    id: 'tx1',
    title: 'Test',
    amount: 100000,
    type: 'expense',
    date: new Date('2026-04-01'),
    notes: null,
    categoryId: 'cat1',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('calculateTotals', () => {
  it('sums income and expense separately', () => {
    const txs = [
      makeTransaction({ type: 'income', amount: 10000000 }),
      makeTransaction({ type: 'expense', amount: 3000000 }),
      makeTransaction({ type: 'expense', amount: 500000 }),
    ];
    const result = calculateTotals(txs);
    expect(result.income).toBe(10000000);
    expect(result.expense).toBe(3500000);
  });

  it('returns zeros for empty list', () => {
    const result = calculateTotals([]);
    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
  });

  it('handles all-income transactions', () => {
    const txs = [
      makeTransaction({ type: 'income', amount: 5000000 }),
      makeTransaction({ type: 'income', amount: 3000000 }),
    ];
    const result = calculateTotals(txs);
    expect(result.income).toBe(8000000);
    expect(result.expense).toBe(0);
  });
});

describe('getBalance', () => {
  it('returns income minus expense', () => {
    const txs = [
      makeTransaction({ type: 'income', amount: 10000000 }),
      makeTransaction({ type: 'expense', amount: 3500000 }),
    ];
    expect(getBalance(txs)).toBe(6500000);
  });

  it('returns negative balance when expenses exceed income', () => {
    const txs = [
      makeTransaction({ type: 'income', amount: 1000000 }),
      makeTransaction({ type: 'expense', amount: 2000000 }),
    ];
    expect(getBalance(txs)).toBe(-1000000);
  });
});

describe('calculateCategoryBreakdown', () => {
  it('returns empty array when no transactions', () => {
    expect(calculateCategoryBreakdown([])).toEqual([]);
  });

  it('returns empty array when no expense transactions', () => {
    const txs = [makeTransaction({ type: 'income', amount: 10000000 })];
    expect(calculateCategoryBreakdown(txs)).toEqual([]);
  });

  it('groups expenses by category with correct percentages', () => {
    const txs = [
      makeTransaction({
        type: 'expense',
        amount: 1500000,
        categoryId: 'cat1',
        category: { id: 'cat1', name: 'Ăn uống' },
      }),
      makeTransaction({
        type: 'expense',
        amount: 500000,
        categoryId: 'cat2',
        category: { id: 'cat2', name: 'Di chuyển' },
      }),
      makeTransaction({
        type: 'income',
        amount: 10000000,
        categoryId: 'cat3',
        category: { id: 'cat3', name: 'Thu nhập' },
      }),
    ];

    const result = calculateCategoryBreakdown(txs);
    expect(result).toHaveLength(2);

    const food = result.find((r) => r.categoryId === 'cat1');
    const transport = result.find((r) => r.categoryId === 'cat2');

    expect(food).toBeDefined();
    expect(food?.categoryName).toBe('Ăn uống');
    expect(food?.amount).toBe(1500000);
    expect(food?.percentage).toBe(75);

    expect(transport).toBeDefined();
    expect(transport?.amount).toBe(500000);
    expect(transport?.percentage).toBe(25);
  });

  it('accumulates amounts for same category', () => {
    const txs = [
      makeTransaction({
        type: 'expense',
        amount: 500000,
        categoryId: 'cat1',
        category: { id: 'cat1', name: 'Ăn uống' },
      }),
      makeTransaction({
        type: 'expense',
        amount: 500000,
        categoryId: 'cat1',
        category: { id: 'cat1', name: 'Ăn uống' },
      }),
    ];

    const result = calculateCategoryBreakdown(txs);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(1000000);
    expect(result[0].percentage).toBe(100);
  });
});

describe('calculateSpendingLimitStatus', () => {
  it('returns normal when spent < 80% of limit', () => {
    const result = calculateSpendingLimitStatus(700000, 1000000);
    expect(result.percentage).toBe(70);
    expect(result.status).toBe('normal');
  });

  it('returns warning when spent is 80–99% of limit', () => {
    const result = calculateSpendingLimitStatus(850000, 1000000);
    expect(result.percentage).toBe(85);
    expect(result.status).toBe('warning');
  });

  it('returns warning at exactly 80%', () => {
    const result = calculateSpendingLimitStatus(800000, 1000000);
    expect(result.status).toBe('warning');
  });

  it('returns exceeded when spent >= 100% of limit', () => {
    const result = calculateSpendingLimitStatus(1200000, 1000000);
    expect(result.percentage).toBe(120);
    expect(result.status).toBe('exceeded');
  });

  it('returns exceeded at exactly 100%', () => {
    const result = calculateSpendingLimitStatus(1000000, 1000000);
    expect(result.status).toBe('exceeded');
  });

  it('handles zero limit safely', () => {
    const result = calculateSpendingLimitStatus(500000, 0);
    expect(result.percentage).toBe(0);
    expect(result.status).toBe('normal');
  });
});

describe('filterTransactionsByKeyword', () => {
  const items = [
    { id: 'tx1', title: 'Lunch at restaurant', notes: 'Delicious meal' },
    { id: 'tx2', title: 'Salary', notes: null },
    { id: 'tx3', title: 'Uber trip', notes: 'To airport' },
    { id: 'tx4', title: 'Mua sắm', notes: 'Áo mới' },
  ];

  it('returns all items when keyword is empty', () => {
    expect(filterTransactionsByKeyword(items, '')).toHaveLength(4);
    expect(filterTransactionsByKeyword(items, undefined)).toHaveLength(4);
    expect(filterTransactionsByKeyword(items, '   ')).toHaveLength(4);
  });

  it('matches by title (case-insensitive)', () => {
    const result = filterTransactionsByKeyword(items, 'LUNCH');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx1');
  });

  it('matches by notes (case-insensitive)', () => {
    const result = filterTransactionsByKeyword(items, 'AIRPORT');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx3');
  });

  it('matches partial words', () => {
    const result = filterTransactionsByKeyword(items, 'trip');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx3');
  });

  it('matches items where keyword appears in notes but not title', () => {
    const result = filterTransactionsByKeyword(items, 'Delicious');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx1');
  });

  it('skips items with null notes without error', () => {
    const result = filterTransactionsByKeyword(items, 'salary');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx2');
  });

  it('returns empty array when no match found', () => {
    const result = filterTransactionsByKeyword(items, 'xyz_no_match');
    expect(result).toHaveLength(0);
  });

  it('matches Unicode / Vietnamese text', () => {
    const result = filterTransactionsByKeyword(items, 'sắm');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx4');
  });
});
