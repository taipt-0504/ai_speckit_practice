'use client';

interface AuthErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthErrorPage({ error, reset }: AuthErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Auth Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Unable to continue sign-in flow
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {error.message || 'An unexpected authentication error occurred. Please try again.'}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
          <a
            href="/login"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}
