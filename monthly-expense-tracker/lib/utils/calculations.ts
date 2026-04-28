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
