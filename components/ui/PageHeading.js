import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

export default function PageHeading({ title, breadcrumbs = [] }) {
  return (
    <div className="space-y-1">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <FiChevronRight className="w-3 h-3" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#0957ff] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-slate-600 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#041442]">{title}</h1>
    </div>
  );
}