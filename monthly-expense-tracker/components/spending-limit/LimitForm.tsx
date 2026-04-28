'use client';

import { useState } from 'react';
import { SpendingLimitSchema } from '@/lib/utils/validation';

interface CategoryOption {
  id: string;
  name: string;
}

interface LimitFormProps {
  categories: CategoryOption[];
  onSuccess?: () => void;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function LimitForm({ categories, onSuccess }: LimitFormProps) {
  const currentMonth = getCurrentMonth();
  const [year, setYear] = useState<number>(
    parseInt(currentMonth.split('-')[0] ?? String(new Date().getFullYear()), 10)
  );
  const [month, setMonth] = useState<number>(
    parseInt(currentMonth.split('-')[1] ?? String(new Date().getMonth() + 1), 10)
  );
  const [amount, setAmount] = useState('');
  const [limitType, setLimitType] = useState<'monthly_total' | 'category'>('monthly_total');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const monthValue = `${year}-${String(month).padStart(2, '0')}`;

  function handleMonthChange(value: string) {
    const [y, m] = value.split('-').map(Number);
    if (y) setYear(y);
    if (m) setMonth(m);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    const payload = {
      limitType,
      amount: parseInt(amount, 10),
      month,
      year,
      categoryId: limitType === 'category' ? categoryId : null,
    };

    const parsed = SpendingLimitSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    if (limitType === 'category' && !categoryId) {
      setErrors(['Category is required for category-type limits']);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/spending-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrors([data.error ?? 'Failed to create spending limit']);
        return;
      }

      setAmount('');
      setCategoryId('');
      onSuccess?.();
    } catch {
      setErrors(['Failed to create spending limit']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-base font-semibold text-gray-800">Add Spending Limit</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="limit-month" className="mb-1 block text-sm font-medium text-gray-700">
            Month
          </label>
          <input
            id="limit-month"
            type="month"
            value={monthValue}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="limit-type" className="mb-1 block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="limit-type"
            value={limitType}
            onChange={(e) => setLimitType(e.target.value as 'monthly_total' | 'category')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="monthly_total">Monthly Total</option>
            <option value="category">Per Category</option>
          </select>
        </div>
      </div>

      {limitType === 'category' && (
        <div>
          <label htmlFor="limit-category" className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="limit-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="limit-amount" className="mb-1 block text-sm font-medium text-gray-700">
          Amount (VND)
        </label>
        <input
          id="limit-amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000000"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save limit'}
      </button>
    </form>
  );
}
