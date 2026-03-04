'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toastSuccess, toastError } from '@/lib/toast';

import PageHeading from '@/app/components/ui/PageHeading';
import { CategoryForm } from '@/components/dashboard/Post/Category/CategoryForm';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        console.log('CATEGORY_FETCH_ATTEMPT: id', id);

        const response = await fetch(`/api/blog/admin/categories/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch category data.');
        }

        // Backend returns { success, category }
        setCategory(data.category || data);
        console.log('CATEGORY_FETCH_SUCCESS: id', id);
      } catch (error) {
        console.error('CATEGORY_FETCH_ERROR:', error);
        toastError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleUpdateCategory = async (data) => {
    try {
      setIsSaving(true);
      console.log('CATEGORY_UPDATE_ATTEMPT: id', id);

      const response = await fetch(`/api/blog/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to update category.');
      }

      console.log('CATEGORY_UPDATE_SUCCESS: id', id);
      toastSuccess('Category updated successfully!');
      router.push('/dashboard/blog/categories');
    } catch (error) {
      console.error('CATEGORY_UPDATE_ERROR:', error);
      toastError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/dashboard/blog/posts' },
    { label: 'Categories', href: '/dashboard/blog/categories' },
    { label: 'Edit Category' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeading title="Edit Category" breadcrumbs={breadcrumbs} />
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#0957ff] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <PageHeading title="Edit Category" breadcrumbs={breadcrumbs} />
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-sm text-red-500">Category not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading title="Edit Category" breadcrumbs={breadcrumbs} />
      <CategoryForm
        onSave={handleUpdateCategory}
        initialData={category}
        isSaving={isSaving}
      />
    </div>
  );
}