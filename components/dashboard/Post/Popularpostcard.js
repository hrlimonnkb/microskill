import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.microskill.com.bd';

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function PopularPostCard({ post }) {
    const imgSrc = post.featuredImage
        ? post.featuredImage.startsWith('http') ? post.featuredImage : `${API_BASE}/${post.featuredImage.replace(/^\//, '')}`
        : null;

    return (
        <Link href={`/blog/${post.slug}`} className="group flex gap-3 items-start hover:bg-slate-50 p-2 rounded-xl transition-colors">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                {imgSrc ? (
                    <img src={imgSrc} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">📝</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>📅 {formatDate(post.createdAt)}</span>
                    {post._count?.comments !== undefined && <span>💬 {post._count.comments}</span>}
                </div>
                {post.category && (
                    <span className="inline-block mt-1 text-xs text-blue-500 font-medium">{post.category.name}</span>
                )}
            </div>
        </Link>
    );
}