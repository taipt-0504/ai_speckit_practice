'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import MonthlyOverview from '@/components/dashboard/MonthlyOverview';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import type { SpendingLimitEntry } from '@/lib/hooks/useDashboard';

function LimitAlert({ limit }: { limit: SpendingLimitEntry }) {
  const colorClass =
    limit.status === 'exceeded'
      ? 'border-red-400 bg-red-50 text-red-800'
      : 'border-yellow-400 bg-yellow-50 text-yellow-800';

  const label = limit.category ? limit.category.name : 'Tổng chi tiêu tháng';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${colorClass}`}>
      <span className="font-semibold">{label}</span>: đã chi{' '}
      {limit.spent_amount.toLocaleString('vi-VN')} / {limit.limit_amount.toLocaleString('vi-VN')} (
      {limit.percentage}%){' '}
      <span className="font-medium">
        {limit.status === 'exceeded' ? '— Vượt hạn mức!' : '— Gần đến hạn mức'}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, month, setMonth } = useDashboard();

  const alertLimits = data?.spending_limits.filter(
    (l) => l.status === 'warning' || l.status === 'exceeded'
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div>
          <label htmlFor="month-select" className="sr-only">
            Chọn tháng
          </label>
          <input
            id="month-select"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-sm text-gray-400">Đang tải dữ liệu...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Spending limit alerts */}
          {alertLimits && alertLimits.length > 0 && (
            <div className="space-y-2">
              {alertLimits.map((limit) => (
                <LimitAlert key={limit.id} limit={limit} />
              ))}
            </div>
          )}

          {/* Summary cards */}
          <MonthlyOverview
            totalIncome={data.summary.total_income}
            totalExpense={data.summary.total_expense}
            balance={data.summary.balance}
            transactionCount={data.summary.transaction_count}
          />

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <IncomeExpenseChart data={data.monthly_trend} />
            <CategoryBreakdown data={data.category_breakdown} />
          </div>
        </>
      )}

      {!loading && !error && data && data.summary.transaction_count === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          Chưa có giao dịch nào trong tháng này.{' '}
          <a href="/transactions/new" className="text-blue-600 underline">
            Thêm giao dịch
          </a>
        </div>
      )}
    </main>
  );
}
