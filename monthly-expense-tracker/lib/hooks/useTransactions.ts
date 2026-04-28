'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface TransactionCategory {
  id: string;
  name: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  month?: string;
  type?: 'income' | 'expense' | '';
  category_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

interface ListResponse {
  transactions: TransactionItem[];
  total: number;
  limit: number;
  offset: number;
}

export function useTransactions(initialFilters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transactions${queryString ? `?${queryString}` : ''}`, {
        credentials: 'include',
      });

      const data = (await response.json()) as ListResponse | { error?: string };
      if (!response.ok || !('transactions' in data) || !('total' in data)) {
        setError((data as { error?: string }).error ?? 'Failed to load transactions');
        setTransactions([]);
        setTotal(0);
        return;
      }

      setTransactions(data.transactions);
      setTotal(data.total);
    } catch {
      setError('Failed to load transactions');
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveTransaction = useCallback(
    async (payload: Record<string, unknown>, id?: string) => {
      const isUpdate = Boolean(id);
      const response = await fetch(isUpdate ? `/api/transactions/${id}` : '/api/transactions', {
        method: isUpdate ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as TransactionItem | { error?: string };
      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? 'Failed to save transaction');
      }

      await refresh();
      return data;
    },
    [refresh]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok && response.status !== 204) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to delete transaction');
      }

      await refresh();
    },
    [refresh]
  );

  const getTransactionById = useCallback(async (id: string) => {
    const response = await fetch(`/api/transactions/${id}`, { credentials: 'include' });
    const data = (await response.json()) as TransactionItem | { error?: string };
    if (!response.ok) {
      throw new Error((data as { error?: string }).error ?? 'Transaction not found');
    }
    return data as TransactionItem;
  }, []);

  return {
    transactions,
    total,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    saveTransaction,
    deleteTransaction,
    getTransactionById,
  };
}
