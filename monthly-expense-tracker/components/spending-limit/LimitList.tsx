'use client';

import { LimitProgressBar } from './LimitProgressBar';

interface SpendingLimitItem {
  id: string;
  limitType: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

interface LimitListProps {
  limits: SpendingLimitItem[];
  onDelete: (id: string) => void;
  spentMap?: Record<
    string,
    { spent: number; percentage: number; status: 'normal' | 'warning' | 'exceeded' }
  >;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

export function LimitList({ limits, onDelete, spentMap = {} }: LimitListProps) {
  if (limits.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        No spending limits set. Add one above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {limits.map((limit) => {
        const spent = spentMap[limit.id];
        const label =
          limit.limitType === 'monthly_total'
            ? 'Monthly Total'
            : (limit.category?.name ?? 'Category');
        const period = `${String(limit.month).padStart(2, '0')}/${limit.year}`;

        return (
          <li key={limit.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{label}</span>
                <span className="text-xs text-gray-500">{period}</span>
              </div>
              <p className="mt-0.5 text-sm text-gray-600">
                Limit: {formatCurrency(limit.amount)} VND
                {spent ? ` — Spent: ${formatCurrency(spent.spent)} VND` : ''}
              </p>
              {spent && (
                <div className="mt-1">
                  <LimitProgressBar percentage={spent.percentage} status={spent.status} />
                </div>
              )}
            </div>
            <button
              onClick={() => onDelete(limit.id)}
              className="shrink-0 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              aria-label={`Delete limit for ${label}`}
            >
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
