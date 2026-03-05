'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PageHeading from '@/components/ui/PageHeading';
import { CategoryForm } from '@/components/dashboard/Post/Category/CategoryForm';

const API_BASE = 'https://api.microskill.com.bd';

function authFetch(path, options = {}) {
  const token = localStorage.getItem('authToken');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params; // URL: /categories/[slug]/edit

  const [category, setCategory] = useState(null);
  const [categoryId, setCategoryId] = useState(null); // PUT এর জন্য integer id
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // GET /api/categories/:slug — slug দিয়ে fetch
  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        console.log('CATEGORY_FETCH_ATTEMPT: slug', slug);

        const response = await authFetch(`/api/categories/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch category data.');
        }

        // Backend: { success: true, category: { id, name, slug, ... } }
        const cat = data.category;
        setCategory(cat);
        setCategoryId(cat.id); // integer id save — PUT এ লাগবে

        console.log('CATEGORY_FETCH_SUCCESS: slug', slug, '| id', cat.id);
      } catch (error) {
        console.error('CATEGORY_FETCH_ERROR:', error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  // PUT /api/categories/:id — integer id দিয়ে update
  const handleUpdateCategory = async (data) => {
    try {
      setIsSaving(true);
      console.log('CATEGORY_UPDATE_ATTEMPT: id', categoryId);

      const response = await authFetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to update category.');
      }

      console.log('CATEGORY_UPDATE_SUCCESS: id', categoryId);
      toast.success('Category updated successfully!');
      router.push('/dashboard/blog-categories');
    } catch (error) {
      console.error('CATEGORY_UPDATE_ERROR:', error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/dashboard/blog/posts' },
    { label: 'Categories', href: '/dashboard/blog-categories' },
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