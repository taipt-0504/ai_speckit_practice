'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Transactions', href: '/transactions', icon: '💳' },
  { label: 'Categories', href: '/categories', icon: '🏷️' },
  { label: 'Limits', href: '/limits', icon: '⚠️' },
  { label: 'Admin', href: '/admin/users', icon: '👥' },
];

export function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white" aria-label="Primary navigation">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              💰 Expense Tracker
            </Link>
            <div className="hidden flex-wrap gap-4 md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1 text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="inline-block mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
