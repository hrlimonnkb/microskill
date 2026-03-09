import BlogPostClient from '@/components/dashboard/Post/BlogPostClient';
import { notFound } from 'next/navigation';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.microskill.com.bd';

// ── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({ params }) {
    try {
        const res  = await fetch(`${API_BASE}/api/post/${params.slug}`, { cache: 'no-store' });
        if (!res.ok) return { title: 'Post Not Found' };
        const data = await res.json();
        const post = data.post;

        return {
            title:       post.metaTitle       || post.title,
            description: post.metaDescription || post.excerpt || '',
            openGraph: {
                title:       post.metaTitle || post.title,
                description: post.metaDescription || post.excerpt || '',
                images:      post.featuredImage ? [post.featuredImage] : [],
                type:        'article',
            },
        };
    } catch {
        return { title: 'Blog Post' };
    }
}

// ── Page ───────────────────────────────────────────────────────
export default async function BlogPostPage({ params }) {
    let post;

    try {
        const res = await fetch(`${API_BASE}/api/post/${params.slug}`, { cache: 'no-store' });
        if (!res.ok) notFound();
        const data = await res.json();
        post = data.post;
    } catch {
        notFound();
    }

    if (!post) notFound();

    // Only show published posts on public pages
    if (post.status !== 'PUBLISHED') notFound();

    return <BlogPostClient post={post} />;
}