// BlogPostsPage.js

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import { PostTable } from '@/components/dashboard/Post/PostTable';


function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Inline Modal ───────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#041442]">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Inline TableSkeleton ───────────────────────────────────────
const TableSkeleton = ({ rowCount = 10, columns = [] }) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="bg-white border-b border-[#eef2f7]">
          {columns.map((col, colIndex) => (
            <td key={colIndex} className={col.className}>
              {col.CellRenderer ? <col.CellRenderer /> : <Skeleton />}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// ── Inline Pagination ──────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  const renderPages = () => {
    const result = [];
    let prev = null;
    for (const page of showPages) {
      if (prev && page - prev > 1) {
        result.push(<span key={`dots-${page}`} className="px-2 text-slate-400">...</span>);
      }
      result.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
            page === currentPage
              ? 'bg-gradient-to-r from-[#0957ff] to-[#34bfff] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {page}
        </button>
      );
      prev = page;
    }
    return result;
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      {renderPages()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Inline PageHeading ─────────────────────────────────────────
const PageHeading = ({ title, breadcrumbs = [] }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h1 className="text-2xl font-bold text-[#041442]">{title}</h1>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-slate-300">/</span>}
              {crumb.url ? (
                <Link href={crumb.url} className="hover:text-brand-orange transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
};

// ── Skeleton columns config ────────────────────────────────────
const postSkeletonColumns = [
    { className: "px-6 py-4 w-16" },
    { className: "px-6 py-4", CellRenderer: () => <Skeleton width={64} height={40} /> },
    { className: "px-6 py-4", CellRenderer: () => <Skeleton width={250} /> },
    { className: "px-6 py-4", CellRenderer: () => <Skeleton width={80} height={24} style={{ borderRadius: '9999px' }} /> },
    { className: "px-6 py-4", CellRenderer: () => <div className="flex justify-center gap-2"><Skeleton circle width={32} height={32} /><Skeleton circle width={32} height={32} /></div> },
    { className: "px-6 py-4", CellRenderer: () => <div className="flex justify-center gap-2"><Skeleton circle width={32} height={32} /><Skeleton circle width={32} height={32} /></div> },
];

// ── Main Page ──────────────────────────────────────────────────
export default function BlogPostsPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (page, search) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.microskill.com.bd/api/post?page=${page}&limit=${ITEMS_PER_PAGE}&search=${search}`);
      if (!response.ok) throw new Error('Failed to fetch posts.');
      const data = await response.json();

  setPosts(data.posts);
setTotalPages(data.pagination.totalPages);
setTotalPostsCount(data.pagination.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(currentPage, debouncedSearchQuery); }, [currentPage, debouncedSearchQuery, fetchPosts]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPostIds([]);
  }, [debouncedSearchQuery]);

  const handleDeletePost = async (postId) => {
    await handleDeleteSelected([postId]);
  };

  const handleDeleteSelected = async (idsToDelete) => {
    try {
      const response = await fetch('https://api.microskill.com.bd/api/post', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (!response.ok) throw new Error('Failed to delete posts.');

      setTotalPostsCount(prev => Math.max(0, prev - idsToDelete.length));
      toast.success('Selected posts deleted.');
      setSelectedPostIds([]);
      fetchPosts(currentPage, debouncedSearchQuery);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const currentPagePostIds = useMemo(() => posts.map(c => c.id), [posts]);
  const allSelectedOnPage = currentPagePostIds.length > 0 && currentPagePostIds.every(id => selectedPostIds.includes(id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPostIds(prev => [...new Set([...prev, ...currentPagePostIds])]);
    } else {
      setSelectedPostIds(prev => prev.filter(id => !currentPagePostIds.includes(id)));
    }
  };

  const handleSelectOne = (e, postId) => {
    if (e.target.checked) {
      setSelectedPostIds(prev => [...prev, postId]);
    } else {
      setSelectedPostIds(prev => prev.filter(id => id !== postId));
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Blogs" },
    { label: "Posts" }
  ];

  return (
    <div className="space-y-8">
      <PageHeading title="Posts" breadcrumbs={breadcrumbs} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-dashed border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#041442]">Posts List</h1>
            <span className="px-3 py-1 text-sm font-bold bg-orange-500 text-white rounded-full">
              {isLoading ? <Skeleton width={80} /> : `${totalPostsCount.toLocaleString()} Total Posts`}
            </span>
            {selectedPostIds.length > 0 && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-brand-orange bg-orange-100 hover:text-white hover:bg-brand-orange rounded-lg transition-colors cursor-pointer"
                title={`Delete ${selectedPostIds.length} selected post(s)`}
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
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none border border-slate-300 bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              />
            </div>
           <Link
  href="/dashboard/blog/new"
  className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-[#f97316] to-[#fb923c] text-sm text-white font-semibold rounded-lg shadow-md hover:shadow-orange-200/50 hover:scale-105 active:scale-95 transition-all duration-200"
>
  <FiPlus className="stroke-[3px]" /> 
  <span>Add Post</span>
</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-sm text-slate-500 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="p-4">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    onChange={handleSelectAll}
                    checked={allSelectedOnPage}
                  />
                </th>
                <th scope="col" className="px-6 py-3">SL NO</th>
                <th scope="col" className="px-6 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rowCount={ITEMS_PER_PAGE} columns={postSkeletonColumns} />
              ) : (
                <PostTable
                  posts={posts}
                  baseViewPath="/blog"
                  baseEditPath="/dashboard/blog"
                  onDeletePost={handleDeletePost}
                  selectedPostIds={selectedPostIds}
                  onSelectOne={handleSelectOne}
                  currentPage={currentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Bulk Deletion">
        <div>
          <p>Are you sure you want to delete {selectedPostIds.length} post(s)?</p>
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer">Cancel</button>
            <button onClick={() => handleDeleteSelected(selectedPostIds)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer">Delete Selected</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}