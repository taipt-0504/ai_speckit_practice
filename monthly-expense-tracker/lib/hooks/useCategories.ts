'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  is_default: boolean;
  is_custom: boolean;
}

interface CategoriesResponse {
  default: CategoryItem[];
  custom: CategoryItem[];
}

export function useCategories() {
  const [defaultCategories, setDefaultCategories] = useState<CategoryItem[]>([]);
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories', { credentials: 'include' });
      const data = (await response.json()) as CategoriesResponse | { error?: string };

      if (!response.ok || !('default' in data) || !('custom' in data)) {
        setError((data as { error?: string }).error ?? 'Failed to load categories');
        setDefaultCategories([]);
        setCustomCategories([]);
        return;
      }

      setDefaultCategories(data.default);
      setCustomCategories(data.custom);
    } catch {
      setError('Failed to load categories');
      setDefaultCategories([]);
      setCustomCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCategory = useCallback(
    async (name: string) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create category');
      }

      await refresh();
    },
    [refresh]
  );

  const renameCategory = useCallback(
    async (id: string, name: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to rename category');
      }

      await refresh();
    },
    [refresh]
  );

  const reassignAndDeleteCategory = useCallback(
    async (id: string, targetCategoryId: string) => {
      const reassignRes = await fetch(`/api/categories/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCategoryId }),
      });

      const reassignData = (await reassignRes.json()) as { error?: string };
      if (!reassignRes.ok) {
        throw new Error(reassignData.error ?? 'Failed to reassign transactions');
      }

      const deleteRes = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!deleteRes.ok && deleteRes.status !== 204) {
        const deleteData = (await deleteRes.json()) as { error?: string };
        throw new Error(deleteData.error ?? 'Failed to delete category');
      }

      await refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok && response.status !== 204) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to delete category');
      }

      await refresh();
    },
    [refresh]
  );

  return {
    defaultCategories,
    customCategories,
    allCategories: [...defaultCategories, ...customCategories],
    loading,
    error,
    refresh,
    createCategory,
    renameCategory,
    deleteCategory,
    reassignAndDeleteCategory,
  };
}
