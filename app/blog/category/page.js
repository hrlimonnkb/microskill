import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

export const metadata = {
    title:       'সব ক্যাটাগরি | Blog',
    description: 'ব্লগের সব ক্যাটাগরি একসাথে দেখুন।',
};

async function getAllCategories() {
    try {
        const res = await fetch(
            `${API_BASE}/api/categories?status=PUBLISHED&limit=100`,
            { cache: 'no-store' }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.categories || [];
    } catch {
        return [];
    }
}

// ── Orange shades — সব shade একই orange family থেকে ──────────
const SHADES = [
    { bg: 'bg-orange-50',  border: 'border-orange-200', icon: 'bg-[#f97316]',  text: 'text-[#c2410c]', hover: 'hover:bg-orange-100', count: 'bg-orange-100 text-[#c2410c]' },
    { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: 'bg-[#f59e0b]',  text: 'text-amber-700', hover: 'hover:bg-amber-100',  count: 'bg-amber-100 text-amber-700'  },
    { bg: 'bg-orange-50',  border: 'border-orange-300', icon: 'bg-[#ea580c]',  text: 'text-orange-800',hover: 'hover:bg-orange-100', count: 'bg-orange-100 text-orange-800' },
    { bg: 'bg-amber-50',   border: 'border-amber-300',  icon: 'bg-[#d97706]',  text: 'text-amber-800', hover: 'hover:bg-amber-100',  count: 'bg-amber-100 text-amber-800'  },
    { bg: 'bg-orange-50',  border: 'border-orange-200', icon: 'bg-[#fb8a3c]',  text: 'text-[#c2410c]', hover: 'hover:bg-orange-100', count: 'bg-orange-100 text-[#c2410c]'  },
];

function getShade(i) { return SHADES[i % SHADES.length]; }

// ═══════════════════════════════════════════════════════════════
export default async function CategoriesPage() {
    const categories = await getAllCategories();

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
                        <span className="text-white font-medium">ক্যাটাগরি</span>
                    </nav>

                    <h1 className="text-4xl font-extrabold mb-3">সব ক্যাটাগরি</h1>
                    <p className="text-orange-100 text-lg">
                        পছন্দের বিষয়ের ক্যাটাগরি বেছে নিন এবং সব পোস্ট পড়ুন।
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                        {categories.length}টি ক্যাটাগরি
                    </div>
                </div>
            </div>

            {/* ── Cards ── */}
            <div className="max-w-7xl mx-auto px-5 py-12">
                {categories.length === 0 ? (
                    <div className="text-center py-24">
                        <h2 className="text-2xl font-bold text-orange-900 mb-2">কোনো ক্যাটাগরি নেই</h2>
                        <p className="text-orange-400 mb-8">এখনো কোনো ক্যাটাগরি প্রকাশিত হয়নি।</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            ← সব পোস্ট দেখুন
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {categories.map((cat, i) => {
                            const s = getShade(i);
                            const postCount = cat._count?.posts ?? 0;
                            const initial   = cat.name?.charAt(0)?.toUpperCase() || '#';

                            return (
                                <Link
                                    key={cat.id ?? cat.slug}
                                    href={`/blog/category/${cat.slug}`}
                                    className="group block"
                                >
                                    <div className={`${s.bg} ${s.border} ${s.hover} border rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>

                                        {/* Icon + Count */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`${s.icon} w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                                                {initial}
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.count}`}>
                                                {postCount} পোস্ট
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <h3 className={`text-base font-bold ${s.text} group-hover:underline leading-snug mb-2`}>
                                            {cat.name}
                                        </h3>

                                        {/* Description */}
                                        {cat.description && (
                                            <p className="text-orange-700/60 text-xs line-clamp-2 leading-relaxed">
                                                {cat.description}
                                            </p>
                                        )}

                                        {/* Arrow */}
                                        <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${s.text}`}>
                                            <span>পোস্ট দেখুন</span>
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {categories.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-orange-200 text-orange-700 bg-white rounded-xl font-semibold hover:bg-orange-50 transition"
                        >
                            ← সব পোস্টে ফিরে যান
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}