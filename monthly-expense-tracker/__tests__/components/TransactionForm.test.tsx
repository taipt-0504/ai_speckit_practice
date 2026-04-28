import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransactionForm } from '@/components/transactions/TransactionForm';

describe('TransactionForm', () => {
  const categories = [
    { id: 'cat_food', name: 'Food' },
    { id: 'cat_salary', name: 'Salary' },
  ];

  it('shows validation error for missing title', async () => {
    const onSuccess = vi.fn();

    render(<TransactionForm categories={categories} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat_food' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('submits valid payload and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'tx_1', title: 'Lunch' }),
    } as Response);

    render(<TransactionForm categories={categories} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Lunch' },
    });
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat_food' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save transaction/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });
});
