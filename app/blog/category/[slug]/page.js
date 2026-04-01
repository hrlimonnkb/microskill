import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';
const LIMIT = 9;

export async function generateMetadata({ params }) {
    try {
        const res = await fetch(`${API_BASE}/api/categories/${params.slug}`, { cache: 'no-store' });
        if (!res.ok) return { title: 'Category Not Found' };
        const { category } = await res.json();
        return {
            title:       `${category.name} | Blog`,
            description: category.description || `${category.name} category এর সব পোস্ট`,
        };
    } catch {
        return { title: 'Category' };
    }
}

async function getCategory(slug) {
    const res = await fetch(`${API_BASE}/api/categories/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.category || null;
}

async function getPosts(slug, page = 1) {
    const res = await fetch(
        `${API_BASE}/api/post?categorySlug=${slug}&status=PUBLISHED&page=${page}&limit=${LIMIT}`,
        { cache: 'no-store' }
    );
    if (!res.ok) return { posts: [], pagination: { totalPages: 1, total: 0 } };
    return await res.json();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

// ═══════════════════════════════════════════════════════════════
export default async function CategoryPage({ params, searchParams }) {
    const page = Math.max(1, parseInt(searchParams?.page) || 1);

    const [category, data] = await Promise.all([
        getCategory(params.slug),
        getPosts(params.slug, page),
    ]);

    if (!category) notFound();

    const { posts = [], pagination } = data;
    const totalPages = pagination?.totalPages || 1;
    const total      = pagination?.total      || 0;

    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white">
                <div className="max-w-7xl mx-auto px-5 py-16">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-orange-100 text-sm mb-6">
                        <Link href="/" className="hover:text-white transition">হোম</Link>
                        <span className="text-orange-200">/</span>
                        <Link href="/blog" className="hover:text-white transition">ব্লগ</Link>
                        <span className="text-orange-200">/</span>
                        <Link href="/blog/category" className="hover:text-white transition">ক্যাটাগরি</Link>
                        <span className="text-orange-200">/</span>
                        <span className="text-white font-medium">{category.name}</span>
                    </nav>

                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div>
                            <div className="inline-flex items-center bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                                ক্যাটাগরি
                            </div>
                            <h1 className="text-4xl font-extrabold mb-3 leading-tight">
                                {category.name}
                            </h1>
                            {category.description && (
                                <p className="text-orange-100 text-lg max-w-2xl leading-relaxed">
                                    {category.description}
                                </p>
                            )}
                        </div>

                        {/* Count badge */}
                        <div className="bg-white/20 rounded-2xl px-6 py-4 text-center flex-shrink-0">
                            <div className="text-4xl font-black">{total}</div>
                            <div className="text-orange-100 text-sm mt-1">মোট পোস্ট</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Posts ── */}
            <div className="max-w-7xl  mx-auto px-5 py-12">
                {posts.length === 0 ? (
                    <div className="text-center py-24">
                        <h2 className="text-2xl font-bold text-orange-900 mb-2">কোনো পোস্ট নেই</h2>
                        <p className="text-orange-400 mb-8">এই ক্যাটাগরিতে এখনো কোনো পোস্ট প্রকাশ হয়নি।</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            ← সব পোস্ট দেখুন
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-orange-900">
                                {page > 1 ? `পেজ ${page} — ` : ''}{category.name} এর পোস্টসমূহ
                            </h2>
                            <Link href="/blog" className="text-sm text-[#f97316] hover:text-[#ea580c] font-medium transition">
                                ← সব পোস্ট
                            </Link>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {posts.map(post => (
                                <PostCard key={post.id ?? post.slug} post={post} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination page={page} totalPages={totalPages} slug={params.slug} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PostCard
// ═══════════════════════════════════════════════════════════════
function PostCard({ post }) {
    const imgSrc = post.featuredImage
        ? post.featuredImage.startsWith('http')
            ? post.featuredImage
            : `${API_BASE}/${post.featuredImage.replace(/^\//, '')}`
        : null;

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <article className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">

                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden flex-shrink-0">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-orange-200/50" />
                        </div>
                    )}

                    {post.category && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            {post.category.name}
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-[#f97316] group-hover:text-[#f97316] transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="text-black text-sm line-clamp-2 leading-relaxed flex-1 mb-4">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-orange-400 mt-auto pt-3 border-t border-orange-50">
                        <span>{formatDate(post.createdAt)}</span>
                        {post._count?.comments !== undefined && (
                            <span>{post._count.comments} মন্তব্য</span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

// ═══════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════
function Pagination({ page, totalPages, slug }) {
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    function href(p) {
        return p === 1 ? `/blog/category/${slug}` : `/blog/category/${slug}?page=${p}`;
    }

    return (
        <div className="flex items-center justify-center gap-2 flex-wrap">
            {page > 1 ? (
                <Link href={href(page - 1)} className="px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition text-sm">← আগে</Link>
            ) : (
                <span className="px-3 py-2 rounded-lg border border-orange-100 text-orange-200 text-sm cursor-not-allowed">← আগে</span>
            )}

            {start > 1 && (
                <>
                    <Link href={href(1)} className="px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 text-sm">1</Link>
                    {start > 2 && <span className="text-orange-300 text-sm px-1">…</span>}
                </>
            )}

            {pages.map(p => (
                <Link
                    key={p}
                    href={href(p)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        p === page
                            ? 'bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white border-[#f97316]'
                            : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                    }`}
                >
                    {p}
                </Link>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-orange-300 text-sm px-1">…</span>}
                    <Link href={href(totalPages)} className="px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 text-sm">{totalPages}</Link>
                </>
            )}

            {page < totalPages ? (
                <Link href={href(page + 1)} className="px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition text-sm">পরে →</Link>
            ) : (
                <span className="px-3 py-2 rounded-lg border border-orange-100 text-orange-200 text-sm cursor-not-allowed">পরে →</span>
            )}
        </div>
    );
}