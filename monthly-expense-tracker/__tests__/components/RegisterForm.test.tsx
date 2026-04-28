import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '@/components/auth/RegisterForm';

describe('RegisterForm', () => {
  it('shows validation errors on invalid submit', async () => {
    const onSuccess = vi.fn();
    render(<RegisterForm onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('submits valid data and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Account created. Awaiting admin approval.' }),
    } as Response);

    render(<RegisterForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'StrongPass123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
