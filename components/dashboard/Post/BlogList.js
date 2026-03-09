'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.microskill.com.bd';

function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('AuthToken');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function readingTime(content = '') {
    const words = content?.replace(/<[^>]+>/g, '').split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
}

function getImageSrc(image) {
    if (!image) return null;
    return image.startsWith('http') ? image : `${API_BASE}/${image.replace(/^\//, '')}`;
}

// ── BlogList — static grid ─────────────────────────────────────
export function BlogList({ posts = [], publicLinkPrefix = '/post' }) {
    if (!posts.length) {
        return <EmptyState />;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
                <BlogCard key={post.id ?? post.slug} post={post} linkPrefix={publicLinkPrefix} />
            ))}
        </div>
    );
}

// ── PostDisplayList — paginated + search + filter ──────────────
export function PostDisplayList({
    initialPosts = [],
    initialTotalPages = 1,
    categories = [],
    apiBaseUrl,
    publicLinkPrefix = '/post',
    categoryCountField = 'posts',
    contentName = 'posts',
}) {
    const endpoint = apiBaseUrl
        ? (apiBaseUrl.startsWith('http') ? apiBaseUrl : `${API_BASE}${apiBaseUrl.startsWith('/') ? '' : '/'}${apiBaseUrl}`)
        : `${API_BASE}/api/post`;

    const [posts, setPosts]             = useState(initialPosts);
    const [totalPages, setTotalPages]   = useState(initialTotalPages);
    const [page, setPage]               = useState(1);
    const [inputVal, setInputVal]       = useState('');
    const [search, setSearch]           = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);

    const fetchPosts = useCallback(async (pg, q, cat) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: pg, limit: 6, status: 'PUBLISHED' });
            if (q)   params.set('search', q);
            if (cat) params.set('categorySlug', cat);

            const headers = { 'Content-Type': 'application/json' };
            const token = getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res  = await fetch(`${endpoint}?${params}`, { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setPosts(data.posts || []);
            setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
        } catch (err) {
            console.error('PostDisplayList error:', err);
            setError('পোস্ট লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (!initialPosts.length) fetchPosts(1, '', '');
    }, []);

    useEffect(() => {
        fetchPosts(page, search, selectedCat);
    }, [page, search, selectedCat]);

    useEffect(() => {
        const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 450);
        return () => clearTimeout(t);
    }, [inputVal]);

    function handleCategory(slug) {
        setSelectedCat(prev => prev === slug ? '' : slug);
        setPage(1);
    }

    const featuredPost = page === 1 && !search && !selectedCat && posts.length > 0 ? posts[0] : null;
    const gridPosts    = featuredPost ? posts.slice(1) : posts;

    return (
        <div className="space-y-8">

            {/* ── Search Bar ── */}
            <div className="relative max-w-lg">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder={`${contentName} খুঁজুন...`}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 placeholder-slate-400 text-sm transition"
                />
            </div>

            {/* ── Category Chips ── */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategory('')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                            selectedCat === ''
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                    >
                        সব
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id ?? cat.slug}
                            onClick={() => handleCategory(cat.slug)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                                selectedCat === cat.slug
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                            }`}
                        >
                            {cat.name}
                            {cat[categoryCountField] !== undefined && (
                                <span className="ml-1 text-xs opacity-70">({cat[categoryCountField]})</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <SkeletonLayout />
            ) : error ? (
                <ErrorState error={error} onRetry={() => fetchPosts(page, search, selectedCat)} />
            ) : posts.length === 0 ? (
                <EmptyState
                    onClear={(search || selectedCat) ? () => { setInputVal(''); setSelectedCat(''); setPage(1); } : null}
                    contentName={contentName}
                />
            ) : (
                <div className="space-y-8">
                    {/* Featured Hero Post */}
                    {featuredPost && (
                        <FeaturedCard post={featuredPost} linkPrefix={publicLinkPrefix} />
                    )}

                    {/* 3-Column Grid */}
                    {gridPosts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {gridPosts.map(post => (
                                <BlogCard key={post.id ?? post.slug} post={post} linkPrefix={publicLinkPrefix} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && !loading && !error && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
        </div>
    );
}

// ── Featured Hero Card (first post, wide horizontal layout) ────
function FeaturedCard({ post, linkPrefix }) {
    const imgSrc = getImageSrc(post.featuredImage);

    return (
        <Link href={`${linkPrefix}/${post.slug}`} className="group block">
            <article className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row min-h-[220px]">
                {/* Image */}
                <div className="relative sm:w-2/5 h-52 sm:h-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 overflow-hidden">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-6 sm:p-8 flex-1">
                    {post.category && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            {post.category.name}
                        </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug mb-3 line-clamp-3">
                        {post.title}
                    </h2>
                    {post.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">
                            {post.excerpt}
                        </p>
                    )}
                    <div className="flex items-center gap-3 mt-auto">
                        <AuthorAvatar author={post.author} size="sm" />
                        <div className="text-xs text-slate-400">
                            <span className="font-medium text-slate-600 block">{post.author?.name || 'লেখক'}</span>
                            <span>{formatDate(post.createdAt)}</span>
                            {post.content && <span className="ml-2">· {readingTime(post.content)} মিনিট পড়া</span>}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

// ── BlogCard (grid item) ───────────────────────────────────────
function BlogCard({ post, linkPrefix }) {
    const imgSrc = getImageSrc(post.featuredImage);

    return (
        <Link href={`${linkPrefix}/${post.slug}`} className="group block h-full">
            <article className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative w-full h-44 bg-gradient-to-br from-slate-100 to-indigo-50 overflow-hidden flex-shrink-0">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    {post.category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                            {post.category.name}
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                    </h3>
                    {post.excerpt && (
                        <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed flex-1">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Author + Meta */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
                        <AuthorAvatar author={post.author} size="xs" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">{post.author?.name || 'লেখক'}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(post.createdAt)}{post.content ? ` · ${readingTime(post.content)} মিনিট` : ''}</p>
                        </div>
                        {post._count?.comments !== undefined && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-slate-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {post._count.comments}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

// ── Author Avatar ──────────────────────────────────────────────
function AuthorAvatar({ author, size = 'sm' }) {
    const dim = size === 'xs' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    const avatarSrc = author?.avatar ? getImageSrc(author.avatar) : null;
    const initials = author?.name ? author.name.charAt(0).toUpperCase() : 'ল';

    return (
        <div className={`${dim} rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0`}>
            {avatarSrc ? (
                <img src={avatarSrc} alt={author?.name} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-emerald-600">{initials}</span>
            )}
        </div>
    );
}

// ── Pagination ─────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div className="flex items-center justify-center gap-1.5 pt-4 flex-wrap">
            <button
                onClick={() => onPageChange(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
            >← আগে</button>

            {start > 1 && <>
                <button onClick={() => onPageChange(1)} className="px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm">1</button>
                {start > 2 && <span className="text-slate-400 text-sm px-1">…</span>}
            </>}

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-9 h-9 rounded-full border text-sm font-medium transition ${
                        p === page
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >{p}</button>
            ))}

            {end < totalPages && <>
                {end < totalPages - 1 && <span className="text-slate-400 text-sm px-1">…</span>}
                <button onClick={() => onPageChange(totalPages)} className="px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm">{totalPages}</button>
            </>}

            <button
                onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
            >পরে →</button>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonLayout() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Featured skeleton */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col sm:flex-row h-52">
                <div className="sm:w-2/5 h-full bg-slate-200" />
                <div className="flex-1 p-8 space-y-4">
                    <div className="h-3 bg-slate-200 rounded-full w-24" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                        <div className="h-44 bg-slate-200" />
                        <div className="p-4 space-y-3">
                            <div className="h-3 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-100 rounded w-full" />
                            <div className="h-3 bg-slate-100 rounded w-1/3 mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ onClear, contentName = 'posts' }) {
    return (
        <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-lg font-medium">কোনো {contentName} পাওয়া যায়নি</p>
            {onClear && (
                <button onClick={onClear} className="mt-3 text-emerald-500 underline text-sm">
                    ফিল্টার সরান
                </button>
            )}
        </div>
    );
}

// ── Error State ────────────────────────────────────────────────
function ErrorState({ error, onRetry }) {
    return (
        <div className="text-center py-16 bg-red-50 rounded-2xl text-red-500">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="mb-4">{error}</p>
            <button onClick={onRetry} className="px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm">
                আবার চেষ্টা করুন
            </button>
        </div>
    );
}