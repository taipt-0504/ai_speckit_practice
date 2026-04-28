import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import type { CategoryBreakdownItem } from '@/lib/utils/calculations';

const sampleData: CategoryBreakdownItem[] = [
  { categoryId: 'cat1', categoryName: 'Ăn uống', amount: 1500000, percentage: 43 },
  { categoryId: 'cat2', categoryName: 'Di chuyển', amount: 800000, percentage: 23 },
  { categoryId: 'cat3', categoryName: 'Mua sắm', amount: 1200000, percentage: 34 },
];

describe('CategoryBreakdown', () => {
  it('renders category names', () => {
    render(<CategoryBreakdown data={sampleData} />);
    expect(screen.getByText('Ăn uống')).toBeTruthy();
    expect(screen.getByText('Di chuyển')).toBeTruthy();
    expect(screen.getByText('Mua sắm')).toBeTruthy();
  });

  it('renders percentage values', () => {
    render(<CategoryBreakdown data={sampleData} />);
    expect(screen.getByText(/43%/)).toBeTruthy();
  });

  it('renders empty state when no data', () => {
    render(<CategoryBreakdown data={[]} />);
    expect(screen.getByText(/no data|không có|empty/i)).toBeTruthy();
  });
});
