'use client';

interface HeaderProps {
  onMenuToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
  userRole?: string;
}

export function Header({ onMenuToggle, onLogout, userEmail, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 md:hidden"
              aria-label="Open menu"
            >
              Menu
            </button>
            <div>
              <p className="text-base font-semibold text-gray-900">Monthly Expense Tracker</p>
              <p className="text-xs text-gray-500">Manage your personal finance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{userEmail ?? 'Unknown user'}</p>
              <p className="text-xs uppercase tracking-wide text-gray-500">{userRole ?? 'user'}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
