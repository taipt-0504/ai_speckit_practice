'use client';

import { useState } from 'react';
import { CategorySchema } from '@/lib/utils/validation';

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);

    const parsed = CategorySchema.safeParse({ name });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrors([data.error ?? 'Failed to create category']);
        return;
      }

      setName('');
      onSuccess?.();
    } catch {
      setErrors(['Failed to create category']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="category-name" className="mb-1 block text-sm font-medium text-gray-700">
          Category name
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      {errors.length > 0 ? (
        <div className="space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      ) : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save category'}
      </button>
    </form>
  );
}
