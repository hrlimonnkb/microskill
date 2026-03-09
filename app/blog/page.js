import { PostDisplayList } from '@/components/dashboard/Post/BlogList';
import PopularPostCard from '@/components/dashboard/Post/Popularpostcard';

export const metadata = {
  title: "Blog | Micro Skill - SEO & Business Insights",
  description: "Read the latest articles on SEO, Social Media, PPC and more.",
};

const ITEMS_PER_PAGE = 7; // 1 featured + 6 grid
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.microskill.com.bd';

async function getInitialData() {
    const [postsRes, categoriesRes, popularRes] = await Promise.all([
        fetch(`${API_BASE}/api/post?page=1&limit=${ITEMS_PER_PAGE}&status=PUBLISHED`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/categories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/post/popular`, { cache: 'no-store' }),
    ]);

    const postsData      = await postsRes.json();
    const categoriesData = await categoriesRes.json();
    const popularData    = await popularRes.json();

    return {
        initialPosts:      postsData.posts            || [],
        initialTotalPages: postsData.pagination?.totalPages || 1,
        categories:        categoriesData.categories   || [],
        popularPosts:      popularData.posts           || [],
    };
}

export default async function BlogPage() {
    const { initialPosts, initialTotalPages, categories, popularPosts } = await getInitialData();

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Hero Header ── */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-5 py-12 text-center">
                    {/* Brand badge */}
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-100 mb-5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Micro Skill Blog
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        মাইক্রো স্কীল ব্লগ
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                        ডিজিটাল মার্কেটিং সম্পর্কে কোম্পানি SEO, সোশ্যাল মিডিয়া, PPC এবং আরও বহু বিষয়ে নিয়মিত আপডেট পাচ্ছেন আমাদের কাছ থেকে।
                    </p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-6xl mx-auto px-5 py-10">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Posts — takes 3/4 width on XL */}
                    <div className="xl:col-span-3">
                        <PostDisplayList
                            initialPosts={initialPosts}
                            initialTotalPages={initialTotalPages}
                            categories={categories}
                            apiBaseUrl="/api/post"
                            publicLinkPrefix="/blog"
                            categoryCountField="blog"
                            contentName="পোস্ট"
                        />
                    </div>

                    {/* Sidebar — 1/4 width on XL */}
                    {popularPosts.length > 0 && (
                        <aside className="xl:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-6">
                                <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block"></span>
                                    জনপ্রিয় পোস্ট
                                </h2>
                                <div className="space-y-4 divide-y divide-slate-100">
                                    {popularPosts.map(post => (
                                        <div key={post.slug} className="pt-4 first:pt-0">
                                            <PopularPostCard post={post} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}

                </div>
            </div>
        </div>
    );
}