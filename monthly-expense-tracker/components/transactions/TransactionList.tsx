'use client';

import type { TransactionItem } from '@/lib/hooks/useTransactions';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  items: TransactionItem[];
  onDelete: (id: string) => Promise<void>;
}

export function TransactionList({ items, onDelete }: TransactionListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <TransactionRow key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
