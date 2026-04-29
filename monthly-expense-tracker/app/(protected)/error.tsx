'use client';

interface ProtectedErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedErrorPage({ error, reset }: ProtectedErrorPageProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          Protected Area Error
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          This screen could not be loaded
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {error.message || 'Please retry the request or return to the dashboard.'}
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
            href="/dashboard"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
