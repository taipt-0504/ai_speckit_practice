'use client';

import { useRouter } from 'next/navigation';
import { useCategories } from '@/lib/hooks/useCategories';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function NewTransactionPage() {
  const router = useRouter();
  const { allCategories, loading } = useCategories();

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900">New transaction</h1>
      {loading ? <p className="text-sm text-gray-500">Loading categories...</p> : null}
      {!loading ? (
        <TransactionForm
          categories={allCategories.map((category) => ({ id: category.id, name: category.name }))}
          onSuccess={() => router.push('/transactions')}
        />
      ) : null}
    </main>
  );
}
