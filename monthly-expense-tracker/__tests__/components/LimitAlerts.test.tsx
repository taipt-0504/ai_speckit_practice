import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LimitAlerts from '@/components/dashboard/LimitAlerts';
import type { SpendingLimitEntry } from '@/lib/hooks/useDashboard';

const warningLimit: SpendingLimitEntry = {
  id: 'lim_1',
  type: 'monthly_total',
  limit_amount: 5000000,
  spent_amount: 4200000,
  percentage: 84,
  status: 'warning',
  category: null,
};

const exceededLimit: SpendingLimitEntry = {
  id: 'lim_2',
  type: 'per_category',
  limit_amount: 2000000,
  spent_amount: 2500000,
  percentage: 125,
  status: 'exceeded',
  category: { id: 'cat1', name: 'Ăn uống' },
};

const normalLimit: SpendingLimitEntry = {
  id: 'lim_3',
  type: 'monthly_total',
  limit_amount: 5000000,
  spent_amount: 1000000,
  percentage: 20,
  status: 'normal',
  category: null,
};

describe('LimitAlerts', () => {
  it('renders nothing when there are no limits', () => {
    const { container } = render(<LimitAlerts limits={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when all limits are normal', () => {
    const { container } = render(<LimitAlerts limits={[normalLimit]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows warning alert for limits at 80-99%', () => {
    render(<LimitAlerts limits={[warningLimit]} />);
    expect(screen.getByText(/tổng chi tiêu tháng/i)).toBeInTheDocument();
    expect(screen.getByText(/gần đến hạn mức/i)).toBeInTheDocument();
    expect(screen.getByText(/84%/i)).toBeInTheDocument();
  });

  it('shows exceeded alert for limits >= 100%', () => {
    render(<LimitAlerts limits={[exceededLimit]} />);
    expect(screen.getByText(/ăn uống/i)).toBeInTheDocument();
    expect(screen.getByText(/vượt hạn mức/i)).toBeInTheDocument();
    expect(screen.getByText(/125%/i)).toBeInTheDocument();
  });

  it('shows multiple alerts when multiple limits trigger', () => {
    render(<LimitAlerts limits={[warningLimit, exceededLimit, normalLimit]} />);
    // Only warning and exceeded should show
    expect(screen.getByText(/tổng chi tiêu tháng/i)).toBeInTheDocument();
    expect(screen.getByText(/ăn uống/i)).toBeInTheDocument();
  });

  it('applies warning styling for warning status', () => {
    render(<LimitAlerts limits={[warningLimit]} />);
    const alertEl = screen.getByRole('alert');
    expect(alertEl.className).toMatch(/yellow/);
  });

  it('applies exceeded styling for exceeded status', () => {
    render(<LimitAlerts limits={[exceededLimit]} />);
    const alertEl = screen.getByRole('alert');
    expect(alertEl.className).toMatch(/red/);
  });
});
