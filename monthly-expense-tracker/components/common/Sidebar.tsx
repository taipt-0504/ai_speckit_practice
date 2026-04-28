'use client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:translate-x-0 top-0 left-0 h-screen w-64 bg-gray-100 border-r border-gray-200 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button onClick={onClose} className="md:hidden mb-4 text-gray-600 hover:text-gray-900">
            ✕
          </button>
          <nav className="space-y-2">{/* Sidebar navigation items can be added here */}</nav>
        </div>
      </aside>
    </>
  );
}
