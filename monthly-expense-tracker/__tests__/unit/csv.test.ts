import { describe, it, expect } from 'vitest';
import { formatCsvValue, serializeTransactionsToCsv } from '@/lib/utils/csv';
import type { Transaction } from '@/types/forms';

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx1',
    title: 'Test Transaction',
    amount: 100000,
    type: 'expense',
    date: new Date('2026-04-15'),
    notes: 'Test notes',
    categoryId: 'cat1',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('formatCsvValue', () => {
  it('escapes double quotes in strings', () => {
    const result = formatCsvValue('Value with "quotes"');
    expect(result).toBe('"Value with ""quotes"""');
  });

  it('wraps strings with commas in quotes', () => {
    const result = formatCsvValue('Value, with, commas');
    expect(result).toBe('"Value, with, commas"');
  });

  it('wraps strings with newlines in quotes', () => {
    const result = formatCsvValue('Value\nwith\nnewlines');
    expect(result).toBe('"Value\nwith\nnewlines"');
  });

  it('returns number as string', () => {
    expect(formatCsvValue(12345)).toBe('12345');
  });

  it('returns boolean as string', () => {
    expect(formatCsvValue(true)).toBe('true');
  });

  it('handles null and undefined', () => {
    expect(formatCsvValue(null)).toBe('');
    expect(formatCsvValue(undefined)).toBe('');
  });

  it('formats dates as ISO string', () => {
    const date = new Date('2026-04-15');
    const result = formatCsvValue(date);
    expect(result).toBe('2026-04-15');
  });
});

describe('serializeTransactionsToCsv', () => {
  it('includes CSV header row', () => {
    const txs = [makeTransaction()];
    const csv = serializeTransactionsToCsv(txs, {});
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Date');
    expect(lines[0]).toContain('Title');
    expect(lines[0]).toContain('Type');
  });

  it('serializes transaction rows', () => {
    const txs = [
      makeTransaction({
        title: 'Income',
        type: 'income',
        amount: 5000000,
        date: new Date('2026-04-10'),
      }),
      makeTransaction({
        title: 'Expense',
        type: 'expense',
        amount: 1000000,
        date: new Date('2026-04-15'),
      }),
    ];
    const csv = serializeTransactionsToCsv(txs, {});
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1]).toContain('2026-04-10');
    expect(lines[1]).toContain('Income');
  });

  it('handles missing category names', () => {
    const txs = [makeTransaction({ title: 'Test' })];
    const csv = serializeTransactionsToCsv(txs, {});
    expect(csv).toBeTruthy();
  });

  it('includes category names when provided', () => {
    const txs = [makeTransaction({ categoryId: 'cat1', title: 'Lunch' })];
    const categoryMap = { cat1: 'Ăn uống' };
    const csv = serializeTransactionsToCsv(txs, categoryMap);
    expect(csv).toContain('Ăn uống');
  });

  it('escapes special characters in values', () => {
    const txs = [makeTransaction({ title: 'Value with "quotes", commas, and\nnewlines' })];
    const csv = serializeTransactionsToCsv(txs, {});
    // The row should be properly escaped
    expect(csv).toContain('"Value with ""quotes"", commas, and\nnewlines"');
  });

  it('returns empty header-only CSV for empty transaction list', () => {
    const csv = serializeTransactionsToCsv([], {});
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Date');
  });
});
