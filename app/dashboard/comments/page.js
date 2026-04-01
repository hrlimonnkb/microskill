'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
}

function authHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function AvatarInitials({ name }) {
    const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const colors = ['bg-orange-400', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
}

function StatCard({ label, value, color, icon }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-800">{value ?? '—'}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    return status === 'APPROVED'
        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Approved
          </span>
        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> Pending
          </span>;
}

function CommentRow({ comment, selected, onSelect, onApprove, onReject, onDelete, loading }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = comment.content.length > 90;
    const displayContent = isLong && !expanded ? comment.content.slice(0, 90) + '…' : comment.content;

    return (
        <tr className={`border-b border-slate-100 transition-colors group ${selected ? 'bg-orange-50/60' : 'hover:bg-slate-50/70'}`}>

            {/* Checkbox */}
            <td className="pl-5 py-3.5 w-10">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={e => onSelect(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                />
            </td>

            {/* Author */}
            <td className="px-4 py-3.5 w-48">
                <div className="flex items-center gap-2.5">
                    <AvatarInitials name={comment.authorName} />
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-xs leading-tight truncate max-w-[110px]">{comment.authorName}</p>
                        <p className="text-slate-400 text-[11px] truncate max-w-[110px]">{comment.authorEmail}</p>
                    </div>
                </div>
            </td>

            {/* Comment */}
            <td className="px-4 py-3.5">
                {comment.post && (
                    <Link href={`/blog/${comment.post.slug}`} target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-600 hover:underline mb-1.5 max-w-xs truncate">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                        </svg>
                        <span className="truncate">{comment.post.title}</span>
                    </Link>
                )}
                <p className="text-slate-600 text-xs leading-relaxed">{displayContent}</p>
                {isLong && (
                    <button onClick={() => setExpanded(v => !v)} className="text-[11px] text-orange-500 hover:underline mt-0.5">
                        {expanded ? 'কম দেখান' : 'আরো দেখান'}
                    </button>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                    {comment.parentId && (
                        <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">↳ Reply</span>
                    )}
                    {comment._count?.replies > 0 && (
                        <span className="text-[11px] text-slate-400">{comment._count.replies} replies</span>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5 w-32">
                <StatusBadge status={comment.status} />
            </td>

            {/* Date */}
            <td className="px-4 py-3.5 w-40">
                <span className="text-slate-400 text-xs whitespace-nowrap">{formatDate(comment.createdAt)}</span>
            </td>

            {/* Actions */}
            <td className="pr-5 py-3.5 w-36">
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {comment.status !== 'APPROVED' && (
                        <button onClick={onApprove} disabled={loading} title="Approve"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-all disabled:opacity-50 shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                            Approve
                        </button>
                    )}
                    {comment.status !== 'PENDING' && (
                        <button onClick={onReject} disabled={loading} title="Set Pending"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-all disabled:opacity-50 shadow-sm">
                            Pending
                        </button>
                    )}
                    <button onClick={onDelete} disabled={loading} title="Delete"
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-all disabled:opacity-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ConfirmModal({ open, message, onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-slate-100">
                <div className="text-center mb-5">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                    </div>
                    <p className="font-bold text-slate-800 text-base">{message}</p>
                    <p className="text-slate-400 text-sm mt-1">এই কাজ ফেরানো যাবে না।</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                        বাতিল
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

function Toast({ message, type }) {
    if (!message) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all animate-bounce-once ${
            type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
            {type === 'success'
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            }
            {message}
        </div>
    );
}

// ── Skeleton Loader ────────────────────────────────────────────
function TableSkeleton() {
    return (
        <>
            {[1,2,3,4,5,6].map(i => (
                <tr key={i} className="border-b border-slate-100">
                    <td className="pl-5 py-4 w-10"><div className="w-4 h-4 bg-slate-200 rounded animate-pulse"/></td>
                    <td className="px-4 py-4 w-48">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse flex-shrink-0"/>
                            <div className="space-y-1.5 flex-1">
                                <div className="h-2.5 bg-slate-200 rounded animate-pulse w-24"/>
                                <div className="h-2 bg-slate-100 rounded animate-pulse w-32"/>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="space-y-2">
                            <div className="h-2.5 bg-slate-200 rounded animate-pulse w-full"/>
                            <div className="h-2.5 bg-slate-100 rounded animate-pulse w-3/4"/>
                        </div>
                    </td>
                    <td className="px-4 py-4 w-32"><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse"/></td>
                    <td className="px-4 py-4 w-40"><div className="h-2.5 bg-slate-100 rounded animate-pulse w-28"/></td>
                    <td className="pr-5 py-4 w-36"><div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse"/></td>
                </tr>
            ))}
        </>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function CommentsDashboard() {
    const [comments, setComments]           = useState([]);
    const [stats, setStats]                 = useState({});
    const [pagination, setPagination]       = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading]             = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage]                   = useState(1);
    const [search, setSearch]               = useState('');
    const [inputVal, setInputVal]           = useState('');
    const [statusFilter, setStatusFilter]   = useState('');
    const [selectedIds, setSelectedIds]     = useState([]);
    const [toast, setToast]                 = useState({ message: '', type: 'success' });
    const [confirmModal, setConfirmModal]   = useState({ open: false, message: '', onConfirm: null });

    function showToast(message, type = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
    }

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (search)       params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            const res  = await fetch(`${API_BASE}/api/post/comment?${params}`, { headers: authHeaders() });
            const data = await res.json();
            setComments(data.comments || []);
            setStats(data.stats || {});
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
            setSelectedIds([]);
        } catch {
            showToast('লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    useEffect(() => {
        const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 450);
        return () => clearTimeout(t);
    }, [inputVal]);

    async function updateStatus(id, status) {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/post/comment/${id}/status`, {
                method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            showToast(status === 'APPROVED' ? 'Approved!' : 'Pending-এ সরানো হয়েছে');
            fetchComments();
        } catch { showToast('সমস্যা হয়েছে', 'error'); }
        finally { setActionLoading(false); }
    }

    async function deleteOne(id) {
        setConfirmModal({
            open: true, message: 'এই কমেন্ট মুছে ফেলবেন?',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    const res = await fetch(`${API_BASE}/api/post/comment/${id}`, { method: 'DELETE', headers: authHeaders() });
                    if (!res.ok) throw new Error();
                    showToast('কমেন্ট মুছে ফেলা হয়েছে');
                    fetchComments();
                } catch { showToast('সমস্যা হয়েছে', 'error'); }
                finally { setActionLoading(false); setConfirmModal({ open: false, message: '', onConfirm: null }); }
            },
        });
    }

    async function bulkApprove() {
        if (!selectedIds.length) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/post/comment/bulk-status`, {
                method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ ids: selectedIds, status: 'APPROVED' }),
            });
            if (!res.ok) throw new Error();
            showToast(`${selectedIds.length}টি কমেন্ট Approved`);
            fetchComments();
        } catch { showToast('সমস্যা হয়েছে', 'error'); }
        finally { setActionLoading(false); }
    }

    async function bulkDelete() {
        if (!selectedIds.length) return;
        setConfirmModal({
            open: true, message: `${selectedIds.length}টি কমেন্ট মুছে ফেলবেন?`,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    const res = await fetch(`${API_BASE}/api/post/comment/bulk-delete`, {
                        method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ ids: selectedIds }),
                    });
                    if (!res.ok) throw new Error();
                    showToast(`${selectedIds.length}টি কমেন্ট মুছে ফেলা হয়েছে`);
                    fetchComments();
                } catch { showToast('সমস্যা হয়েছে', 'error'); }
                finally { setActionLoading(false); setConfirmModal({ open: false, message: '', onConfirm: null }); }
            },
        });
    }

    function toggleSelectAll(checked) { setSelectedIds(checked ? comments.map(c => c.id) : []); }
    function toggleOne(id, checked)   { setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id)); }
    const allSelected = comments.length > 0 && selectedIds.length === comments.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < comments.length;

    return (
        <div className="min-h-screen bg-slate-50 p-5 lg:p-8">
            <Toast message={toast.message} type={toast.type} />
            <ConfirmModal
                open={confirmModal.open} message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ open: false, message: '', onConfirm: null })}
                loading={actionLoading}
            />

            {/* ── Header ── */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        Comments
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">সব কমেন্ট দেখুন, Approve করুন বা Delete করুন</p>
                </div>
                <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
                    মোট <span className="text-slate-700 font-bold">{pagination.total}</span> কমেন্ট
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label="মোট কমেন্ট"  value={stats.total}    color="bg-blue-500"    icon="💬" />
                <StatCard label="Pending"      value={stats.pending}  color="bg-amber-500"   icon="⏳" />
                <StatCard label="Approved"     value={stats.approved} color="bg-emerald-500" icon="✅" />
            </div>

            {/* ── Main Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* ── Toolbar ── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                            placeholder="নাম, ইমেইল বা কমেন্ট খুঁজুন..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 transition"
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-1.5 flex-shrink-0 bg-slate-100 rounded-lg p-1">
                        {[['', 'সব'], ['PENDING', 'Pending'], ['APPROVED', 'Approved']].map(([val, label]) => (
                            <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    statusFilter === val
                                        ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Bulk Action Bar ── */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-orange-50 border-b border-orange-200 flex-wrap">
                        <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">{selectedIds.length}</span>
                            টি কমেন্ট selected
                        </span>
                        <button onClick={bulkApprove} disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                            সব Approve
                        </button>
                        <button onClick={bulkDelete} disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            সব Delete
                        </button>
                        <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            বাতিল
                        </button>
                    </div>
                )}

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] border-collapse">
                        {/* Head */}
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="pl-5 py-3 w-10 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={el => { if (el) el.indeterminate = someSelected; }}
                                        onChange={e => toggleSelectAll(e.target.checked)}
                                        className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 w-48 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">লেখক</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">কমেন্ট</th>
                                <th className="px-4 py-3 w-32 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">স্ট্যাটাস</th>
                                <th className="px-4 py-3 w-40 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">তারিখ</th>
                                <th className="pr-5 py-3 w-36 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">অ্যাকশন</th>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : comments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="text-5xl mb-3">💬</div>
                                        <p className="font-semibold text-slate-500 text-sm">কোনো কমেন্ট পাওয়া যায়নি</p>
                                        {(search || statusFilter) && (
                                            <button onClick={() => { setInputVal(''); setStatusFilter(''); setPage(1); }}
                                                className="mt-3 text-orange-500 text-sm hover:underline">
                                                ফিল্টার সরান
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                comments.map(comment => (
                                    <CommentRow
                                        key={comment.id}
                                        comment={comment}
                                        selected={selectedIds.includes(comment.id)}
                                        onSelect={checked => toggleOne(comment.id, checked)}
                                        onApprove={() => updateStatus(comment.id, 'APPROVED')}
                                        onReject={() => updateStatus(comment.id, 'PENDING')}
                                        onDelete={() => deleteOne(comment.id)}
                                        loading={actionLoading}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer / Pagination ── */}
                {!loading && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-3">
                        <p className="text-xs text-slate-400">
                            দেখাচ্ছে <span className="font-semibold text-slate-600">{comments.length}</span> টি / মোট <span className="font-semibold text-slate-600">{pagination.total}</span> টি কমেন্ট
                        </p>

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 text-xs font-medium transition">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                    আগে
                                </button>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) => p === '...' ? (
                                        <span key={`e${i}`} className="text-slate-400 text-sm px-1">…</span>
                                    ) : (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg border text-xs font-semibold transition ${
                                                p === page
                                                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500'
                                            }`}>
                                            {p}
                                        </button>
                                    ))
                                }
                                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 text-xs font-medium transition">
                                    পরে
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}