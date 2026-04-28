'use client';

import Link from 'next/link';
import type { TransactionItem } from '@/lib/hooks/useTransactions';

interface TransactionRowProps {
  item: TransactionItem;
  onDelete: (id: string) => Promise<void>;
}

export function TransactionRow({ item, onDelete }: TransactionRowProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500">
            {item.category.name} - {item.date}
          </p>
          {item.notes ? <p className="mt-1 text-sm text-gray-600">{item.notes}</p> : null}
        </div>
        <p
          className={`text-sm font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
        >
          {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/transactions/${item.id}`} className="text-sm text-blue-600 hover:underline">
          View
        </Link>
        <Link
          href={`/transactions/${item.id}/edit`}
          className="text-sm text-indigo-600 hover:underline"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => void onDelete(item.id)}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
