import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

export const metadata = { title: 'Help Center | Support' };

async function getKBData(search = '', categoryId = '') {
    try {
        const params = new URLSearchParams({ limit: 20 });
        if (search)     params.set('search', search);
        if (categoryId) params.set('categoryId', categoryId);
        const res  = await fetch(`${API_BASE}/api/support/kb?${params}`, { cache: 'no-store' });
        const data = await res.json();
        return { articles: data.articles || [], categories: data.categories || [] };
    } catch { return { articles: [], categories: [] }; }
}

export default async function HelpCenterPage({ searchParams }) {
    const search     = searchParams?.q || '';
    const categoryId = searchParams?.cat || '';
    const { articles, categories } = await getKBData(search, categoryId);

    return (
        <div className="min-h-screen bg-orange-50/30">
            <div className="max-w-4xl mx-auto px-4 py-10">

                {/* ── Hero ── */}
                <div className="bg-gradient-to-r from-[#f97316] to-[#fb8a3c] rounded-3xl p-10 text-white text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2">Help Center</h1>
                    <p className="text-orange-100 mb-6">আপনার সমস্যার সমাধান নিজেই খুঁজে নিন</p>

                    {/* Search */}
                    <form action="support/help" method="GET">
                        <div className="relative max-w-md mx-auto">
                            <input
                                name="q"
                                defaultValue={search}
                                type="text"
                                placeholder="সমস্যা লিখে খুঁজুন..."
                                className="w-full px-5 py-3.5 pr-12 rounded-2xl text-gray-700 focus:outline-none text-sm shadow-lg"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-[#f97316]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Categories ── */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Link
                            href="support/help"
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                !categoryId ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316]'
                            }`}
                        >সব</Link>
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/support/help?cat=${cat.id}`}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                    categoryId === String(cat.id)
                                        ? 'bg-[#f97316] text-white border-[#f97316]'
                                        : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316]'
                                }`}
                            >
                                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* ── Articles ── */}
                {articles.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
                        <p className="text-gray-400 mb-4">কোনো article পাওয়া যায়নি</p>
                        <Link href="support/new" className="text-[#f97316] text-sm font-medium hover:underline">
                            টিকেট খুলুন →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {articles.map(a => (
                            <Link key={a.id} href={`/support/help/${a.slug}`}>
                                <div className="bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-gray-800 leading-snug group-hover:text-[#f97316]">{a.title}</h3>
                                    </div>
                                    {a.excerpt && (
                                        <p className="text-gray-500 text-sm line-clamp-2 flex-1 mb-3">{a.excerpt}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                            {a.category?.name}
                                        </span>
                                        <span>{a.viewCount} বার পড়া হয়েছে</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* ── Still need help? ── */}
                <div className="bg-white rounded-2xl border border-orange-100 p-8 text-center">
                    <h3 className="font-bold text-gray-800 mb-2">সমাধান পাননি?</h3>
                    <p className="text-gray-500 text-sm mb-4">আমাদের সাপোর্ট টিম সাহায্য করতে প্রস্তুত</p>
                    <Link
                        href="support/new"
                        className="inline-flex px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
                    >
                        সাপোর্ট টিকেট খুলুন →
                    </Link>
                </div>
            </div>
        </div>
    );
}