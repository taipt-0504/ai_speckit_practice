'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTransactions, type TransactionItem } from '@/lib/hooks/useTransactions';
import { TransactionForm } from '@/components/transactions/TransactionForm';

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTransactionPage({ params }: EditTransactionPageProps) {
  const router = useRouter();
  const { allCategories } = useCategories();
  const { getTransactionById } = useTransactions();
  const [transaction, setTransaction] = useState<TransactionItem | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { id } = await params;
      const item = await getTransactionById(id);
      if (mounted) {
        setTransaction(item);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [getTransactionById, params]);

  if (!transaction) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-gray-500">Loading transaction...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Edit transaction</h1>
      <TransactionForm
        categories={allCategories.map((category) => ({ id: category.id, name: category.name }))}
        transactionId={transaction.id}
        initialData={{
          title: transaction.title,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          categoryId: transaction.category.id,
          notes: transaction.notes ?? '',
        }}
        onSuccess={() => router.push('/transactions')}
      />
    </main>
  );
}
