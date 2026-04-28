'use client';

import { ReactNode } from 'react';

interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthFormLayout({ title, subtitle, children }: AuthFormLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
