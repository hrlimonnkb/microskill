'use client';

import Link from 'next/link';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

// Status badge
function StatusBadge({ status }) {
  const isPublished = status?.toUpperCase() === 'PUBLISHED';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isPublished
        ? 'bg-green-100 text-green-700'
        : 'bg-slate-100 text-slate-500'
    }`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

export function CategoryTable({
  categories = [],
  onDeleteCategory,
  baseEditPath,
  selectedCategoryIds = [],
  onSelectOne,
  onSelectAll,
  currentPage,
  itemsPerPage,
  allSelectedOnPage,
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-50 text-left">
          {/* Checkbox */}
          <th className="w-10 px-4 py-3">
            <input
              type="checkbox"
              checked={allSelectedOnPage}
              onChange={onSelectAll}
              className="rounded border-slate-300 text-[#0957ff] focus:ring-[#0957ff] cursor-pointer"
            />
          </th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Slug</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Posts</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {categories.map((category, index) => {
          const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
          const isSelected = selectedCategoryIds.includes(category.id);

          return (
            <tr
              key={category.id}
              className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
            >
              {/* Checkbox */}
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectOne(e, category.id)}
                  className="rounded border-slate-300 text-[#0957ff] focus:ring-[#0957ff] cursor-pointer"
                />
              </td>

              {/* Row number */}
              <td className="px-4 py-3 text-slate-400">{rowNumber}</td>

              {/* Name */}
              <td className="px-4 py-3">
                <span className="font-medium text-[#041442]">{category.name}</span>
                {category.description && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                    {category.description}
                  </p>
                )}
              </td>

              {/* Slug */}
              <td className="px-4 py-3 hidden md:table-cell">
                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {category.slug}
                </code>
              </td>

              {/* Posts count */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-slate-600">
                  {category._count?.posts ?? 0} posts
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge status={category.status} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`${baseEditPath}/${category.slug}/edit`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0957ff] hover:bg-blue-50 transition-colors"
                    title="Edit category"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}