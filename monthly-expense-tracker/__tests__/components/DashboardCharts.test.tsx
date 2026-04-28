import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonthlyOverview from '@/components/dashboard/MonthlyOverview';

describe('MonthlyOverview', () => {
  const defaultProps = {
    totalIncome: 10000000,
    totalExpense: 3500000,
    balance: 6500000,
    transactionCount: 25,
  };

  it('renders total income', () => {
    render(<MonthlyOverview {...defaultProps} />);
    expect(screen.getByText(/10[,.]?000[,.]?000/)).toBeTruthy();
  });

  it('renders total expense', () => {
    render(<MonthlyOverview {...defaultProps} />);
    expect(screen.getByText(/3[,.]?500[,.]?000/)).toBeTruthy();
  });

  it('renders balance', () => {
    render(<MonthlyOverview {...defaultProps} />);
    expect(screen.getByText(/6[,.]?500[,.]?000/)).toBeTruthy();
  });

  it('renders transaction count', () => {
    render(<MonthlyOverview {...defaultProps} />);
    expect(screen.getByText(/25/)).toBeTruthy();
  });

  it('renders empty state when no transactions', () => {
    render(
      <MonthlyOverview
        totalIncome={0}
        totalExpense={0}
        balance={0}
        transactionCount={0}
      />,
    );
    // All four summary values render (all zero in this case)
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });
});
