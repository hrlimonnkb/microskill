'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast'; // Direct import
import { PostForm } from '@/components/dashboard/Post/PostForm';
import PageHeading from '@/components/ui/PageHeading';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem('authToken'); // Adjust if your auth token is stored differently 
            
          const response = await fetch(`https://api.microskill.com.bd/api/post/id/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch post data.');
          const data = await response.json();
          setPost(data.post);
        } catch (error) {
          toast.error(error.message || 'Could not load post');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleUpdatePost = async (postData) => {
    setIsSaving(true);
 const token = localStorage.getItem('authToken'); 
    // Using toast.promise handles loading, success, and error states automatically
    const updatePromise = fetch(`https://api.microskill.com.bd/api/post/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(postData),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update post.');
      }
      return res.json();
    });

    toast.promise(updatePromise, {
      loading: 'Updating post...',
      success: 'Post updated successfully!',
      error: (err) => err.message,
    });

    try {
      await updatePromise;
      router.push('/dashboard/blog');
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 animate-pulse">Loading post data...</p>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Blogs", url: "/dashboard/blog" },
    { label: "Edit Post" }
  ];

  return (
    <div className="space-y-8">
      <PageHeading title="Edit Post" breadcrumbs={breadcrumbs} />
      {post && (
        <PostForm
          onSave={handleUpdatePost}
          categoryApiEndpoint="https://api.microskill.com.bd/api/categories"
          redirectPath="/dashboard/blog"
          initialData={post}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}