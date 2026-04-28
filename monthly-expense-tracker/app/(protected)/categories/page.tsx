'use client';

import { useState } from 'react';
import { CategoryForm } from '@/components/category/CategoryForm';
import { CategoryList } from '@/components/category/CategoryList';
import { useCategories } from '@/lib/hooks/useCategories';

export default function CategoriesPage() {
  const {
    defaultCategories,
    customCategories,
    loading,
    error,
    refresh,
    deleteCategory,
    reassignAndDeleteCategory,
  } = useCategories();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteCategory(id);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete category'
      );
    }
  }

  async function handleReassignAndDelete(id: string, targetCategoryId: string) {
    setActionError(null);
    try {
      await reassignAndDeleteCategory(id, targetCategoryId);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to reassign and delete category'
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-600">
          Manage custom categories and reassign transactions before deletion.
        </p>
      </header>

      <CategoryForm onSuccess={() => void refresh()} />

      {loading ? <p className="text-sm text-gray-500">Loading categories...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

      {!loading ? (
        <CategoryList
          defaultCategories={defaultCategories}
          customCategories={customCategories}
          onDelete={handleDelete}
          onReassignAndDelete={handleReassignAndDelete}
        />
      ) : null}
    </main>
  );
}
