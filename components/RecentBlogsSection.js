'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function getImageSrc(image) {
    if (!image) return null;
    return image.startsWith('http') ? image : `${API_BASE}/${image.replace(/^\//, '')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

// ✅ Category slug দিয়ে link করা হয়েছে
const BlogTag = ({ label, slug, color }) => {
    const colorClasses = {
        pink:   'bg-pink-100 text-pink-600 hover:bg-pink-200',
        blue:   'bg-blue-100 text-blue-600 hover:bg-blue-200',
        orange: 'bg-orange-100 text-[#f97316] hover:bg-orange-200',
        indigo: 'bg-indigo-100 text-[#ea670c] hover:bg-indigo-200',
    };
    const cls = colorClasses[color] || 'bg-gray-100 text-gray-600 hover:bg-gray-200';

    if (slug) {
        return (
            <Link href={`/blog/category/${slug}`}>
                <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${cls}`}>
                    {label}
                </span>
            </Link>
        );
    }
    return (
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${cls}`}>
            {label}
        </span>
    );
};

const SmallBlogCard = ({ blog }) => {
    const imgSrc = getImageSrc(blog.featuredImage);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center group">
            <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={blog.title}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500">{formatDate(blog.createdAt)}</p>
                <Link href={`/blog/${blog.slug}`}>
                    <span className="text-xl font-bold text-gray-900 mt-2 block transition-colors duration-300 group-hover:text-[#f97316]">
                        {blog.title}
                    </span>
                </Link>
                <p className="text-gray-600 text-base mt-2 line-clamp-2">{blog.excerpt}</p>
                {blog.category && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {/* ✅ slug পাঠানো হচ্ছে */}
                        <BlogTag label={blog.category.name} slug={blog.category.slug} color="blue" />
                    </div>
                )}
            </div>
        </div>
    );
};

const LargeBlogCard = ({ blog }) => {
    const imgSrc = getImageSrc(blog.featuredImage);
    return (
        <div className="flex flex-col group">
            <div className="w-full h-80 rounded-lg overflow-hidden bg-slate-100">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={blog.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                )}
            </div>
            <div className="mt-6">
                <p className="text-sm text-gray-500">{formatDate(blog.createdAt)}</p>
                <Link href={`/blog/${blog.slug}`}>
                    <span className="text-2xl font-bold text-gray-900 mt-2 block transition-colors duration-300 group-hover:text-[#f97316]">
                        {blog.title}
                    </span>
                </Link>
                <p className="text-gray-600 text-base mt-3 line-clamp-3">{blog.excerpt}</p>
                {blog.category && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {/* ✅ slug পাঠানো হচ্ছে */}
                        <BlogTag label={blog.category.name} slug={blog.category.slug} color="orange" />
                    </div>
                )}
            </div>
        </div>
    );
};

// Skeleton loaders
const SmallCardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center animate-pulse">
        <div className="w-full h-48 bg-slate-200 rounded-lg" />
        <div className="space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-5 bg-slate-200 rounded w-full" />
            <div className="h-5 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-6 bg-slate-200 rounded-full w-20 mt-2" />
        </div>
    </div>
);

const LargeCardSkeleton = () => (
    <div className="flex flex-col animate-pulse">
        <div className="w-full h-80 bg-slate-200 rounded-lg" />
        <div className="mt-6 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-6 bg-slate-200 rounded w-full" />
            <div className="h-6 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-6 bg-slate-200 rounded-full w-24 mt-2" />
        </div>
    </div>
);

const RecentBlogsSection = ({ initialPosts }) => {
    const [posts, setPosts]     = useState(initialPosts || []);
    const [loading, setLoading] = useState(!initialPosts || initialPosts.length === 0);
    const [error, setError]     = useState(null);

    // SSR DEBUG - পরে মুছে দিও
    console.log('📰 RecentBlogsSection:', initialPosts ? `SSR data: ${initialPosts.length}টি post ✅` : 'SSR নেই, Client fetch হবে ⚠️');

    useEffect(() => {
        // SSR থেকে data পাওয়া গেলে client fetch skip
        if (initialPosts && initialPosts.length > 0) {
            console.log('✅ SSR data use হচ্ছে, client fetch skip');
            return;
        }

        console.log('⚠️ SSR data নেই, client-side fetch শুরু...');
        async function fetchPosts() {
            try {
                const res  = await fetch(`${API_BASE}/api/post?limit=3&status=PUBLISHED`);
                if (!res.ok) throw new Error('Failed to fetch posts');
                const data = await res.json();
                const list = data?.posts ?? data?.content ?? data?.data ?? (Array.isArray(data) ? data : []);
                setPosts(Array.isArray(list) ? list : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const smallPosts = posts.slice(0, 2);
    const largePost  = posts[2] || null;

    if (error) return null;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                    আমাদের সাম্প্রতিক ব্লগসমূহ
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">

                    {/* Left — small cards */}
                    <div className="flex flex-col gap-10">
                        {loading ? (
                            <><SmallCardSkeleton /><SmallCardSkeleton /></>
                        ) : (
                            smallPosts.map(post => <SmallBlogCard key={post.id} blog={post} />)
                        )}
                    </div>

                    {/* Right — large card */}
                    <div className="mt-4 lg:mt-0">
                        {loading ? (
                            <LargeCardSkeleton />
                        ) : largePost ? (
                            <LargeBlogCard blog={largePost} />
                        ) : null}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default RecentBlogsSection;