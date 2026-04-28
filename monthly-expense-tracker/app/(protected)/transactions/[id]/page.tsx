'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTransactions, type TransactionItem } from '@/lib/hooks/useTransactions';

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { getTransactionById } = useTransactions();
  const [item, setItem] = useState<TransactionItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { id } = await params;
        const data = await getTransactionById(id);
        if (mounted) {
          setItem(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load transaction');
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [getTransactionById, params]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-gray-500">Loading transaction...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-gray-900">{item.title}</h1>
      <p className="mt-2 text-sm text-gray-600">Date: {item.date}</p>
      <p className="text-sm text-gray-600">Type: {item.type}</p>
      <p className="text-sm text-gray-600">Category: {item.category.name}</p>
      <p className="mt-2 text-base font-semibold text-gray-900">
        Amount: {item.amount.toLocaleString()}
      </p>
      {item.notes ? <p className="mt-2 text-sm text-gray-700">Notes: {item.notes}</p> : null}

      <div className="mt-4">
        <Link
          href={`/transactions/${item.id}/edit`}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </Link>
      </div>
    </main>
  );
}
