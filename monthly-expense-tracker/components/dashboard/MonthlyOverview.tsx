'use client';

interface MonthlyOverviewProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

export default function MonthlyOverview({
  totalIncome,
  totalExpense,
  balance,
  transactionCount,
}: MonthlyOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Thu nhập</p>
        <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Chi tiêu</p>
        <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Số dư</p>
        <p
          className={`mt-1 text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
        >
          {formatCurrency(balance)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Giao dịch</p>
        <p className="mt-1 text-xl font-bold text-gray-800">{transactionCount}</p>
      </div>
    </div>
  );
}
