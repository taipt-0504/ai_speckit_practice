'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { CategoryBreakdownItem } from '@/lib/utils/calculations';

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
}

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
];

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const pieData = data.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Chi tiêu theo danh mục</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={(props: PieLabelRenderProps) => `${String(props.name ?? '')} ${String(props.percent !== undefined ? Math.round(props.percent * 100) : 0)}%`}
            labelLine={false}
          >
            {pieData.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1">
        {data.map((item) => (
          <li key={item.categoryId} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.categoryName}</span>
            <span className="font-medium text-gray-900">{item.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
