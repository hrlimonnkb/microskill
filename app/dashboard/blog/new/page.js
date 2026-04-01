'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PostForm } from '@/components/dashboard/Post/PostForm';

// ── Inline PageHeading ─────────────────────────────────────────
const PageHeading = ({ title, breadcrumbs = [] }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h1 className="text-2xl font-bold text-[#041442]">{title}</h1>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-slate-300">/</span>}
              {crumb.url ? (
                <Link href={crumb.url} className="hover:text-brand-orange transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
export default function NewPostPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePost = async (postData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken'); // Adjust if your auth token is stored differently
      const response = await fetch('http://localhost:8006/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save post.');
      }

      toast.success('Post created successfully!');
      router.push('/dashboard/blog');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Blogs" },
    { label: "Add Post" }
  ];

  return (
    <div className="space-y-8">
      <PageHeading title="Add Post" breadcrumbs={breadcrumbs} />
      <PostForm
        onSave={handleSavePost}
        categoryApiEndpoint="http://localhost:8006/api/categories"
        redirectPath="/dashboard/blog-posts"
        isSaving={isSaving}
      />
    </div>
  );
}