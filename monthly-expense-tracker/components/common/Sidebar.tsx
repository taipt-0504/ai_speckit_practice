'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Categories', href: '/categories' },
  { label: 'Spending Limits', href: '/limits' },
];

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const allItems =
    userRole === 'admin' ? [...navItems, { label: 'Admin Users', href: '/admin/users' }] : navItems;

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-hidden={!isOpen}
        aria-label="Sidebar navigation"
        className={`fixed top-0 left-0 z-50 h-screen w-64 border-r border-gray-200 bg-white pt-16 shadow-sm transition-transform duration-200 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            type="button"
            onClick={onClose}
            className="mb-4 text-gray-600 hover:text-gray-900 md:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
          <nav className="space-y-2">
            {allItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
