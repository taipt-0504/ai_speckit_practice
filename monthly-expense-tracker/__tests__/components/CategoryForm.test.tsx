import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoryForm } from '@/components/category/CategoryForm';

describe('CategoryForm', () => {
  it('shows validation error for empty name', async () => {
    const onSuccess = vi.fn();

    render(<CategoryForm onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /save category/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('submits valid category', async () => {
    const onSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'cat_1', name: 'Pet expenses' }),
    } as Response);

    render(<CategoryForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/category name/i), {
      target: { value: 'Pet expenses' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save category/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });
});
