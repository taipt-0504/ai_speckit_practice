'use client';

import { useMemo, useState } from 'react';
import { TransactionSchema, TransactionUpdateSchema } from '@/lib/utils/validation';

interface CategoryOption {
  id: string;
  name: string;
}

interface TransactionFormInput {
  title?: string;
  amount?: number;
  date?: string;
  type?: 'income' | 'expense';
  categoryId?: string;
  notes?: string;
}

interface TransactionFormProps {
  categories: CategoryOption[];
  initialData?: TransactionFormInput;
  transactionId?: string;
  onSuccess?: () => void;
}

export function TransactionForm({
  categories,
  initialData,
  transactionId,
  onSuccess,
}: TransactionFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [amount, setAmount] = useState(String(initialData?.amount ?? ''));
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const submitLabel = useMemo(
    () => (transactionId ? 'Update transaction' : 'Save transaction'),
    [transactionId]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    const payload = {
      title,
      amount: Number(amount),
      date,
      type,
      categoryId,
      notes: notes || null,
    };

    const parsed = transactionId
      ? TransactionUpdateSchema.safeParse(payload)
      : TransactionSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        transactionId ? `/api/transactions/${transactionId}` : '/api/transactions',
        {
          method: transactionId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(parsed.data),
        }
      );

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrors([data.error ?? 'Failed to save transaction']);
        return;
      }

      onSuccess?.();
    } catch {
      setErrors(['Failed to save transaction']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Title
        </label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
          Date
        </label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      {errors.length > 0 ? (
        <div className="space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      ) : null}

      <button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
