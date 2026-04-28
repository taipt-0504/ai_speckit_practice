'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { FilterBar, type FilterBarState } from '@/components/transactions/FilterBar';
import { TransactionList } from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  const { allCategories } = useCategories();
  const { transactions, total, loading, error, filters, setFilters, deleteTransaction, exportCsv } =
    useTransactions();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportCsv();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-600">Total records: {total}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white disabled:bg-gray-400"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link
            href="/transactions/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
          >
            New transaction
          </Link>
        </div>
      </header>

      {exportError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </div>
      )}

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
