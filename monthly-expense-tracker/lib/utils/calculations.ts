import type { Transaction } from '@/types/forms';

export function calculateTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, item) => {
      if (item.type === 'income') {
        acc.income += item.amount;
      } else {
        acc.expense += item.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export function calculateCategoryBreakdown(
  transactions: (Transaction & { category?: { id: string; name: string } })[]
): CategoryBreakdownItem[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpense === 0) return [];

  const byCategory = new Map<string, { name: string; amount: number }>();
  for (const t of expenses) {
    const catId = t.categoryId;
    const catName = t.category?.name ?? catId;
    const existing = byCategory.get(catId);
    if (existing) {
      existing.amount += t.amount;
    } else {
      byCategory.set(catId, { name: catName, amount: t.amount });
    }
  }

  return Array.from(byCategory.entries()).map(([id, { name, amount }]) => ({
    categoryId: id,
    categoryName: name,
    amount,
    percentage: Math.round((amount / totalExpense) * 100),
  }));
}

export type LimitStatus = 'normal' | 'warning' | 'exceeded';

export function calculateSpendingLimitStatus(
  spent: number,
  limit: number
): { percentage: number; status: LimitStatus } {
  if (limit <= 0) return { percentage: 0, status: 'normal' };
  const percentage = Math.round((spent / limit) * 100);
  let status: LimitStatus = 'normal';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  }
  return { percentage, status };
}

export function getBalance(transactions: Transaction[]): number {
  const totals = calculateTotals(transactions);
  return totals.income - totals.expense;
}

export function filterTransactionsByKeyword<T extends { title: string; notes?: string | null }>(
  items: T[],
  keyword?: string
): T[] {
  if (!keyword?.trim()) {
    return items;
  }

  const query = keyword.trim().toLowerCase();
  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const notesMatch = (item.notes ?? '').toLowerCase().includes(query);
    return titleMatch || notesMatch;
  });
}
