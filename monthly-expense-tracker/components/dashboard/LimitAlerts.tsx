'use client';

import type { SpendingLimitEntry } from '@/lib/hooks/useDashboard';

interface LimitAlertsProps {
  limits: SpendingLimitEntry[];
}

export default function LimitAlerts({ limits }: LimitAlertsProps) {
  const alertLimits = limits.filter((l) => l.status === 'warning' || l.status === 'exceeded');

  if (alertLimits.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertLimits.map((limit) => {
        const colorClass =
          limit.status === 'exceeded'
            ? 'border-red-400 bg-red-50 text-red-800'
            : 'border-yellow-400 bg-yellow-50 text-yellow-800';
        const label = limit.category ? limit.category.name : 'Tổng chi tiêu tháng';
        const statusText = limit.status === 'exceeded' ? '— Vượt hạn mức!' : '— Gần đến hạn mức';

        return (
          <div
            key={limit.id}
            role="alert"
            className={`rounded-lg border px-4 py-3 text-sm ${colorClass}`}
          >
            <span className="font-semibold">{label}</span>: đã chi{' '}
            {limit.spent_amount.toLocaleString('vi-VN')} /{' '}
            {limit.limit_amount.toLocaleString('vi-VN')} ({limit.percentage}%){' '}
            <span className="font-medium">{statusText}</span>
          </div>
        );
      })}
    </div>
  );
}
