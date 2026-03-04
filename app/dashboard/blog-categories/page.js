'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { toastSuccess, toastError } from '@/lib/toast';
import PageHeading from '@/app/components/ui/PageHeading';
import { CategoryTable } from '@/app/(dashboard)/components/ui/CategoryTable';
import { Modal } from '@/app/components/ui/Modal';
import { Pagination } from '@/app/components/ui/Pagination';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ITEMS_PER_PAGE = 10;

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // ── Fetch categories ───────────────────────────────────────
  const fetchCategories = useCallback(async (page, search) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page, limit: ITEMS_PER_PAGE, search });
      const response = await fetch(`/api/blog/admin/categories?${params}`);

      if (!response.ok) throw new Error('Failed to fetch categories.');

      const data = await response.json();

      setCategories(data.categories || []);
      // Backend returns pagination object: { page, limit, total, totalPages }
      setTotalPages(data.pagination?.totalPages || 1);

      console.log('CATEGORY_FETCH_SUCCESS: page', page, '| total', data.pagination?.total);
    } catch (error) {
      console.error('CATEGORY_FETCH_ERROR:', error);
      toastError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // search বদলালে page 1 এ যাও
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCategoryIds([]);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchCategories(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, fetchCategories]);

  // ── Delete handlers ────────────────────────────────────────
  const handleDeleteCategory = async (categoryId) => {
    await handleDeleteSelected([categoryId]);
  };

  const handleDeleteSelected = async (idsToDelete) => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/blog/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to delete categories.');

      toastSuccess(`${idsToDelete.length} category deleted successfully.`);
      setSelectedCategoryIds([]);

      // শেষ পেইজে সব delete হলে আগের পেইজে যাও
      const remaining = categories.length - idsToDelete.length;
      if (remaining === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchCategories(currentPage, debouncedSearchQuery);
      }

      console.log('CATEGORY_DELETE_SUCCESS: ids', idsToDelete);
    } catch (error) {
      console.error('CATEGORY_DELETE_ERROR:', error);
      toastError(error.message);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // ── Select handlers ────────────────────────────────────────
  const currentPageCategoryIds = useMemo(() => categories.map(c => c.id), [categories]);

  const allSelectedOnPage =
    currentPageCategoryIds.length > 0 &&
    currentPageCategoryIds.every(id => selectedCategoryIds.includes(id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategoryIds(prev => [...new Set([...prev, ...currentPageCategoryIds])]);
    } else {
      setSelectedCategoryIds(prev => prev.filter(id => !currentPageCategoryIds.includes(id)));
    }
  };

  const handleSelectOne = (e, catId) => {
    if (e.target.checked) {
      setSelectedCategoryIds(prev => [...prev, catId]);
    } else {
      setSelectedCategoryIds(prev => prev.filter(id => id !== catId));
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Blog', href: '/dashboard/blog/posts' },
    { label: 'Categories' },
  ];

  return (
    <div className="space-y-8">
      <PageHeading title="Blog Categories" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#041442]">Categories List</h1>
            {selectedCategoryIds.length > 0 && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-brand-orange bg-orange-100 hover:text-white hover:bg-brand-orange rounded-lg transition-colors cursor-pointer"
                title={`Delete ${selectedCategoryIds.length} selected category(s)`}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none border border-slate-300 bg-white focus:border-[#0957ff] focus:ring-1 focus:ring-[#0957ff] text-sm transition"
              />
            </div>
            <Link
              href="/dashboard/blog/categories/new"
              className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-[#0957ff] to-[#34bfff] text-sm text-white font-semibold rounded-lg shadow-sm hover:scale-105 transition-transform whitespace-nowrap"
            >
              <FiPlus /> Add Category
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#0957ff] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {searchQuery ? `No categories found for "${searchQuery}"` : 'No categories yet. Create one!'}
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              onDeleteCategory={handleDeleteCategory}
              baseEditPath="/dashboard/blog/categories"
              selectedCategoryIds={selectedCategoryIds}
              onSelectOne={handleSelectOne}
              onSelectAll={handleSelectAll}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              allSelectedOnPage={allSelectedOnPage}
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Bulk Deletion"
      >
        <div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-red-600">{selectedCategoryIds.length}</span>{' '}
            categorie(s)? Categories that have posts cannot be deleted.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteSelected(selectedCategoryIds)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isDeleting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}