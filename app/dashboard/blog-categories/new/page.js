'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError } from '@/lib/toast';
import { CategoryForm } from '@/app/(dashboard)/components/ui/CategoryForm';
import PageHeading from '@/app/components/ui/PageHeading';

export default function AddCategoryPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async (data) => {
    try {
      setIsSaving(true);
      console.log('CATEGORY_CREATE_ATTEMPT:', data.name);

      const response = await fetch('/api/blog/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to create category.');
      }

      console.log('CATEGORY_CREATE_SUCCESS: id', responseData.category?.id);
      toastSuccess('Category created successfully!');
      router.push('/dashboard/blog/categories');
    } catch (error) {
      console.error('CATEGORY_CREATE_ERROR:', error);
      toastError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/dashboard/blog/posts' },
    { label: 'Categories', href: '/dashboard/blog/categories' },
    { label: 'New Category' },
  ];

  return (
    <div className="space-y-6">
      <PageHeading title="Add New Category" breadcrumbs={breadcrumbs} />
      <CategoryForm onSave={handleAddCategory} isSaving={isSaving} />
    </div>
  );
}