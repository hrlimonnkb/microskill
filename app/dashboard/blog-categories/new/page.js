'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageHeading from '@/components/ui/PageHeading';
import { CategoryForm } from '@/components/dashboard/Post/Category/CategoryForm';

const API_BASE = 'http://localhost:8006';

export default function AddCategoryPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async (data) => {
    try {
      setIsSaving(true);
      console.log('CATEGORY_CREATE_ATTEMPT:', data.name);
const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to create category.');
      }

      console.log('CATEGORY_CREATE_SUCCESS: id', responseData.category?.id);
      toast.success('Category created successfully!');
      router.push('/dashboard/blog-categories');
    } catch (error) {
      console.error('CATEGORY_CREATE_ERROR:', error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/dashboard/blog/posts' },
    { label: 'Categories', href: '/dashboard/blog-categories' },
    { label: 'New Category' },
  ];

  return (
    <div className="space-y-6">
      <PageHeading title="Add New Category" breadcrumbs={breadcrumbs} />
      <CategoryForm onSave={handleAddCategory} isSaving={isSaving} />
    </div>
  );
}