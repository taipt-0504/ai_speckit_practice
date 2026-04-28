'use client';

import { useState } from 'react';
import type { CategoryItem } from '@/lib/hooks/useCategories';

interface CategoryListProps {
  defaultCategories: CategoryItem[];
  customCategories: CategoryItem[];
  onDelete: (id: string) => Promise<void>;
  onReassignAndDelete: (id: string, targetCategoryId: string) => Promise<void>;
}

export function CategoryList({
  defaultCategories,
  customCategories,
  onDelete,
  onReassignAndDelete,
}: CategoryListProps) {
  const [reassignTarget, setReassignTarget] = useState<Record<string, string>>({});

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Default categories</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          {defaultCategories.map((item) => (
            <li key={item.id} className="rounded-md bg-gray-50 px-3 py-2">
              {item.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Custom categories</h2>
        {customCategories.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No custom categories.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {customCategories.map((item) => (
              <li key={item.id} className="rounded-md border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={reassignTarget[item.id] ?? ''}
                    onChange={(event) =>
                      setReassignTarget((prev) => ({ ...prev, [item.id]: event.target.value }))
                    }
                  >
                    <option value="">Select reassignment target</option>
                    {[
                      ...defaultCategories,
                      ...customCategories.filter((c) => c.id !== item.id),
                    ].map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => void onDelete(item.id)}
                    className="bg-gray-800 text-white"
                  >
                    Delete directly
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = reassignTarget[item.id];
                      if (target) {
                        void onReassignAndDelete(item.id, target);
                      }
                    }}
                    className="bg-red-600 text-white"
                  >
                    Reassign and delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
