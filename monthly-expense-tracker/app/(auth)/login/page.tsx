'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthFormLayout title="Login" subtitle="Welcome back.">
      <LoginForm onSuccess={() => router.push('/dashboard')} />
      <p className="mt-4 text-sm text-gray-600">
        Need an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </AuthFormLayout>
  );
}
