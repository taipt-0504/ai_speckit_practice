'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFormLayout } from '@/components/auth/AuthFormLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthFormLayout title="Create account" subtitle="Sign up to start tracking expenses.">
      <RegisterForm onSuccess={() => router.push('/waiting')} />
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </AuthFormLayout>
  );
}
