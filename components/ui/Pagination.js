'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // দেখানোর জন্য page numbers তৈরি (max 5টা দেখাবে)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} className="px-2 text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-gradient-to-r from-[#0957ff] to-[#34bfff] text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}