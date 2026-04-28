import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LimitForm } from '@/components/spending-limit/LimitForm';

const defaultCategories = [
  { id: 'cat1', name: 'Ăn uống' },
  { id: 'cat2', name: 'Di chuyển' },
];

describe('LimitForm', () => {
  it('shows validation error for missing amount', async () => {
    const onSuccess = vi.fn();

    render(<LimitForm categories={defaultCategories} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /save limit/i }));

    await waitFor(() => {
      // Zod shows NaN error when amount field is empty
      expect(screen.getByText(/amount must be|invalid input|expected number/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('submits valid monthly total limit', async () => {
    const onSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'lim_1',
        limitType: 'monthly_total',
        amount: 5000000,
        month: 4,
        year: 2026,
        categoryId: null,
      }),
    } as Response);

    render(<LimitForm categories={defaultCategories} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '5000000' } });

    fireEvent.click(screen.getByRole('button', { name: /save limit/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it('submits valid category-specific limit', async () => {
    const onSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'lim_2',
        limitType: 'category',
        amount: 2000000,
        month: 4,
        year: 2026,
        categoryId: 'cat1',
      }),
    } as Response);

    render(<LimitForm categories={defaultCategories} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '2000000' } });

    // Select category
    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'category' } });

    const catSelect = screen.getByLabelText(/category/i);
    fireEvent.change(catSelect, { target: { value: 'cat1' } });

    fireEvent.click(screen.getByRole('button', { name: /save limit/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it('shows server error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Duplicate limit for this month' }),
    } as Response);

    render(<LimitForm categories={defaultCategories} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '1000000' } });
    fireEvent.click(screen.getByRole('button', { name: /save limit/i }));

    await waitFor(() => {
      expect(screen.getByText(/duplicate limit/i)).toBeInTheDocument();
    });
  });
});
