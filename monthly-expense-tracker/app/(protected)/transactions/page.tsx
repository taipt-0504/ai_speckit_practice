'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { FilterBar, type FilterBarState } from '@/components/transactions/FilterBar';
import { TransactionList } from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  const { allCategories } = useCategories();
  const { transactions, total, loading, error, filters, setFilters, deleteTransaction } =
    useTransactions();

  const filterState: FilterBarState = useMemo(
    () => ({
      month: filters.month ?? '',
      type: filters.type ?? '',
      category_id: filters.category_id ?? '',
      search: filters.search ?? '',
      start_date: filters.start_date ?? '',
      end_date: filters.end_date ?? '',
    }),
    [filters]
  );

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-600">Total records: {total}</p>
        </div>
        <Link
          href="/transactions/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
        >
          New transaction
        </Link>
      </header>

      <FilterBar
        value={filterState}
        categories={allCategories.map((category) => ({ id: category.id, name: category.name }))}
        onChange={(value) => setFilters(value)}
      />

      {loading ? <p className="text-sm text-gray-500">Loading transactions...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <TransactionList items={transactions} onDelete={deleteTransaction} />
      ) : null}
    </main>
  );
}
