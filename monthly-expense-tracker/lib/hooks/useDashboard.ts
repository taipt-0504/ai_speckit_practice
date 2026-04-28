'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CategoryBreakdownItem } from '@/lib/utils/calculations';
import type { MonthlyTrendItem } from '@/components/dashboard/IncomeExpenseChart';

export interface SpendingLimitEntry {
  id: string;
  type: 'monthly_total' | 'per_category';
  limit_amount: number;
  spent_amount: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
  category: { id: string; name: string } | null;
}

export interface DashboardData {
  month: string;
  summary: {
    total_income: number;
    total_expense: number;
    balance: number;
    transaction_count: number;
  };
  spending_limits: SpendingLimitEntry[];
  category_breakdown: CategoryBreakdownItem[];
  monthly_trend: MonthlyTrendItem[];
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  month: string;
  setMonth: (month: string) => void;
  refresh: () => void;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useDashboard(initialMonth?: string): UseDashboardReturn {
  const [month, setMonth] = useState<string>(initialMonth ?? getCurrentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?month=${month}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Failed to load dashboard');
      }
      const json: DashboardData = await res.json();
      // Normalize category_breakdown keys from API snake_case to camelCase expected by components
      const normalized: DashboardData = {
        ...json,
        category_breakdown: (
          json.category_breakdown as unknown as {
            category_id: string;
            category_name: string;
            amount: number;
            percentage: number;
          }[]
        ).map((item) => ({
          categoryId: item.category_id,
          categoryName: item.category_name,
          amount: item.amount,
          percentage: item.percentage,
        })),
      };
      setData(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    month,
    setMonth,
    refresh: fetchDashboard,
  };
}
