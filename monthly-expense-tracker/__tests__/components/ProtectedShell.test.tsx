import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Protected shell', () => {
  it('renders header with current user email and role', () => {
    render(
      <Header
        onMenuToggle={vi.fn()}
        onLogout={vi.fn()}
        userEmail="user@example.com"
        userRole="admin"
      />
    );

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('calls logout handler when clicking logout button', () => {
    const onLogout = vi.fn();
    render(
      <Header
        onMenuToggle={vi.fn()}
        onLogout={onLogout}
        userEmail="user@example.com"
        userRole="user"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('shows admin link in sidebar for admin role', () => {
    render(<Sidebar isOpen={true} onClose={vi.fn()} userRole="admin" />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /spending limits/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /admin users/i })).toBeInTheDocument();
  });

  it('hides admin link in sidebar for non-admin role', () => {
    render(<Sidebar isOpen={true} onClose={vi.fn()} userRole="user" />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /admin users/i })).not.toBeInTheDocument();
  });

  it('calls onClose when clicking a sidebar link', () => {
    const onClose = vi.fn();
    render(<Sidebar isOpen={true} onClose={onClose} userRole="user" />);

    fireEvent.click(screen.getByRole('link', { name: /transactions/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
