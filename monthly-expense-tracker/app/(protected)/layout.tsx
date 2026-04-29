'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/common/Loading';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.status === 'active') {
            setIsAuthorized(true);
            setUser({
              email: data.user.email,
              role: data.user.role,
            });
          } else {
            router.push('/waiting');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Authentication failed. Redirecting...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
        userEmail={user?.email}
        userRole={user?.role}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={user?.role}
      />

      <div className="md:pl-64">
        <div className="min-h-[calc(100vh-57px)]">{children}</div>
      </div>
    </div>
  );
}
