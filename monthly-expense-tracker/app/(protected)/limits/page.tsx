'use client';

import { useState } from 'react';
import { LimitForm } from '@/components/spending-limit/LimitForm';
import { LimitList } from '@/components/spending-limit/LimitList';
import { useSpendingLimits } from '@/lib/hooks/useSpendingLimits';
import { useCategories } from '@/lib/hooks/useCategories';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function LimitsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const { limits, loading, error, refresh, deleteLimit } = useSpendingLimits(selectedMonth);
  const { defaultCategories, customCategories } = useCategories();
  const [actionError, setActionError] = useState<string | null>(null);

  const allCategories = [...defaultCategories, ...customCategories];

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteLimit(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete spending limit');
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Spending Limits</h1>
          <p className="text-sm text-gray-600">
            Set monthly or per-category limits and get warned when you approach them.
          </p>
        </div>
        <div>
          <label htmlFor="limits-month" className="sr-only">
            Select month
          </label>
          <input
            id="limits-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </header>

      <LimitForm categories={allCategories} onSuccess={() => void refresh()} />

      {loading && <p className="text-sm text-gray-500">Loading limits...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {!loading && (
        <LimitList limits={limits} onDelete={handleDelete} />
      )}
    </main>
  );
}
