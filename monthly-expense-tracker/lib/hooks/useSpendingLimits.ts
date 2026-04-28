'use client';

import { useCallback, useEffect, useState } from 'react';
import { calculateSpendingLimitStatus } from '@/lib/utils/calculations';

export interface SpendingLimitItem {
  id: string;
  limitType: 'monthly_total' | 'category';
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  limits: SpendingLimitItem[];
}

export function useSpendingLimits(monthFilter?: string) {
  const [limits, setLimits] = useState<SpendingLimitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = monthFilter
        ? `/api/spending-limits?month=${monthFilter}`
        : '/api/spending-limits';
      const res = await fetch(url, { credentials: 'include' });
      const data = (await res.json()) as ListResponse | { error?: string };

      if (!res.ok || !('limits' in data)) {
        setError((data as { error?: string }).error ?? 'Failed to load spending limits');
        setLimits([]);
        return;
      }

      setLimits(data.limits);
    } catch {
      setError('Failed to load spending limits');
      setLimits([]);
    } finally {
      setLoading(false);
    }
  }, [monthFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createLimit = useCallback(
    async (payload: {
      limitType: 'monthly_total' | 'category';
      amount: number;
      month: number;
      year: number;
      categoryId?: string | null;
    }) => {
      const res = await fetch('/api/spending-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as SpendingLimitItem | { error?: string };
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? 'Failed to create spending limit');
      }
      await refresh();
      return data as SpendingLimitItem;
    },
    [refresh]
  );

  const updateLimit = useCallback(
    async (id: string, payload: Partial<{ amount: number; month: number; year: number }>) => {
      const res = await fetch(`/api/spending-limits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as SpendingLimitItem | { error?: string };
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? 'Failed to update spending limit');
      }
      await refresh();
      return data as SpendingLimitItem;
    },
    [refresh]
  );

  const deleteLimit = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/spending-limits/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to delete spending limit');
      }
      await refresh();
    },
    [refresh]
  );

  return {
    limits,
    loading,
    error,
    refresh,
    createLimit,
    updateLimit,
    deleteLimit,
    calculateSpendingLimitStatus,
  };
}
