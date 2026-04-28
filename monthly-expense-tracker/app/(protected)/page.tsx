'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/common/Loading';

export default function ProtectedIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.status !== 'active') {
      router.replace('/waiting');
      return;
    }

    if (user.role === 'admin') {
      router.replace('/admin/users');
      return;
    }

    router.replace('/dashboard');
  }, [loading, router, user]);

  return <Loading />;
}
