'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const STATUS_CONFIG = {
    UNREAD:  { label: 'অপঠিত',   bg: 'bg-orange-100', text: 'text-[#f97316]',  dot: 'bg-[#f97316]'  },
    READ:    { label: 'পঠিত',     bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
    REPLIED: { label: 'উত্তর দেওয়া', bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
};

// ═══════════════════════════════════════════════════════════════
export default function ContactDashboard() {
    const router = useRouter();
    const [authChecking, setAuthChecking] = useState(true);
    const [contacts, setContacts]   = useState([]);
    const [stats, setStats]         = useState({ unread: 0, read: 0, replied: 0, total: 0 });
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    // Filters
    const [search, setSearch]       = useState('');
    const [inputVal, setInputVal]   = useState('');
    const [statusFilter, setStatus] = useState('');
    const [page, setPage]           = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal
    const [selected, setSelected]   = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Bulk select
    const [checked, setChecked]     = useState(new Set());

    // ── Fetch ──────────────────────────────────────────────────
    const fetchData = useCallback(async (pg, q, st) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: pg, limit: 15 });
            if (q)  params.set('search', q);
            if (st) params.set('status', st);

            const headers = { 'Content-Type': 'application/json' };
            const token = getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res  = await fetch(`${API_BASE}/api/contact?${params}`, { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setContacts(data.contacts || []);
            setStats(data.stats || { unread: 0, read: 0, replied: 0, total: 0 });
            setTotalPages(data.pagination?.totalPages || 1);
            setChecked(new Set());
        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    }, []);
// ── Admin guard ────────────────────────────────────────────
    useEffect(() => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.warn('[ContactDashboard] No token found — redirecting to home');
                router.replace('/');
                return;
            }

            // JWT decode (middle part is base64 payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.debug('[ContactDashboard] Token payload:', payload);

            const role = (payload?.role || '').toUpperCase();
            if (role !== 'ADMIN') {
                console.warn(`[ContactDashboard] Access denied — role: "${role}" — redirecting to home`);
                router.replace('/');
                return;
            }

            console.debug('[ContactDashboard] Admin verified ✓');
            setAuthChecking(false);
        } catch (err) {
            console.error('[ContactDashboard] Token decode error:', err.message, '— redirecting to home');
            router.replace('/');
        }
    }, []);
    useEffect(() => { fetchData(page, search, statusFilter); }, [page, search, statusFilter]);

    // Search debounce
    useEffect(() => {
        const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [inputVal]);

    // ── Open detail ────────────────────────────────────────────
    async function openDetail(contact) {
        setSelected(contact);
        setModalOpen(true);

        // Auto mark READ
        if (contact.status === 'UNREAD') {
            await changeStatus(contact.id, 'READ', false);
        }
    }

    // ── Status change ──────────────────────────────────────────
    async function changeStatus(id, status, refetch = true) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            const token = getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(`${API_BASE}/api/contact/${id}/status`, {
                method:  'PATCH',
                headers,
                body:    JSON.stringify({ status }),
            });

            if (refetch) fetchData(page, search, statusFilter);
            else {
                setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
                if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
                setStats(prev => {
                    const updated = { ...prev };
                    const old = contacts.find(c => c.id === id)?.status;
                    if (old) updated[old.toLowerCase()] = Math.max(0, updated[old.toLowerCase()] - 1);
                    updated[status.toLowerCase()] = (updated[status.toLowerCase()] || 0) + 1;
                    return updated;
                });
            }
        } catch { /* silent */ }
    }

    // ── Delete single ──────────────────────────────────────────
    async function deleteContact(id) {
        if (!confirm('এই বার্তাটি মুছে ফেলবেন?')) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            const token = getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(`${API_BASE}/api/contact/${id}`, { method: 'DELETE', headers });
            setModalOpen(false);
            fetchData(page, search, statusFilter);
        } catch { /* silent */ }
    }

    // ── Bulk delete ────────────────────────────────────────────
    async function bulkDelete() {
        if (!checked.size) return;
        if (!confirm(`${checked.size}টি বার্তা মুছে ফেলবেন?`)) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            const token = getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(`${API_BASE}/api/contact/bulk-delete`, {
                method:  'DELETE',
                headers,
                body:    JSON.stringify({ ids: [...checked] }),
            });
            fetchData(page, search, statusFilter);
        } catch { /* silent */ }
    }

    // ── Checkbox helpers ───────────────────────────────────────
    function toggleOne(id) {
        setChecked(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    }
    function toggleAll() {
        if (checked.size === contacts.length) setChecked(new Set());
        else setChecked(new Set(contacts.map(c => c.id)));
    }
// Auth check চলাকালীন কিছু দেখাবে না
    if (authChecking) {
        return (
            <div className="min-h-screen bg-orange-50/30 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">

            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-orange-900">যোগাযোগ বার্তাসমূহ</h1>
                <p className="text-orange-400 text-sm mt-1">ওয়েবসাইট থেকে আসা সব বার্তা এখানে দেখুন</p>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'মোট', value: stats.total,   color: 'border-orange-200 bg-white' },
                    { label: 'অপঠিত', value: stats.unread,  color: 'border-[#f97316] bg-orange-50' },
                    { label: 'পঠিত', value: stats.read,    color: 'border-gray-200 bg-white' },
                    { label: 'উত্তর দেওয়া', value: stats.replied, color: 'border-green-200 bg-green-50' },
                ].map(s => (
                    <div key={s.label} className={`border-2 ${s.color} rounded-2xl p-5`}>
                        <div className="text-3xl font-black text-orange-900">{s.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm mb-4">
                <div className="flex flex-wrap items-center gap-3 p-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="নাম, ইমেইল বা বার্তা খুঁজুন..."
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 text-sm border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 text-gray-700 bg-white"
                    >
                        <option value="">সব স্ট্যাটাস</option>
                        <option value="UNREAD">অপঠিত</option>
                        <option value="READ">পঠিত</option>
                        <option value="REPLIED">উত্তর দেওয়া</option>
                    </select>

                    {/* Bulk delete */}
                    {checked.size > 0 && (
                        <button
                            onClick={bulkDelete}
                            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition"
                        >
                            {checked.size}টি মুছুন
                        </button>
                    )}

                    {/* Refresh */}
                    <button
                        onClick={() => fetchData(page, search, statusFilter)}
                        className="px-4 py-2.5 border border-orange-200 text-orange-600 hover:bg-orange-50 text-sm font-medium rounded-xl transition"
                    >
                        রিফ্রেশ
                    </button>
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-t border-orange-50 bg-orange-50/60">
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={contacts.length > 0 && checked.size === contacts.length}
                                        onChange={toggleAll}
                                        className="accent-[#f97316] w-4 h-4"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide">নাম</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide">ইমেইল</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide hidden md:table-cell">বার্তা</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide">স্ট্যাটাস</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide hidden sm:table-cell">তারিখ</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide">কাজ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-t border-orange-50 animate-pulse">
                                        <td className="px-4 py-4"><div className="w-4 h-4 bg-orange-100 rounded" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-orange-100 rounded w-24" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-orange-100 rounded w-36" /></td>
                                        <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-orange-100 rounded w-48" /></td>
                                        <td className="px-4 py-4"><div className="h-6 bg-orange-100 rounded-full w-16" /></td>
                                        <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-orange-100 rounded w-24" /></td>
                                        <td className="px-4 py-4"><div className="h-8 bg-orange-100 rounded-lg w-16" /></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                                        কোনো বার্তা পাওয়া যায়নি
                                    </td>
                                </tr>
                            ) : (
                                contacts.map(c => {
                                    const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.READ;
                                    const isUnread = c.status === 'UNREAD';
                                    return (
                                        <tr
                                            key={c.id}
                                            className={`border-t border-orange-50 hover:bg-orange-50/40 transition-colors cursor-pointer ${isUnread ? 'bg-orange-50/20' : ''}`}
                                            onClick={() => openDetail(c)}
                                        >
                                            <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked.has(c.id)}
                                                    onChange={() => toggleOne(c.id)}
                                                    className="accent-[#f97316] w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`font-semibold ${isUnread ? 'text-orange-900' : 'text-gray-700'}`}>
                                                    {c.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 text-xs">{c.email}</td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <span className="text-gray-500 line-clamp-1 max-w-xs block">{c.message}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 hidden sm:table-cell text-xs text-gray-400">
                                                {formatDate(c.createdAt)}
                                            </td>
                                            <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    {/* Status quick-change */}
                                                    <select
                                                        value={c.status}
                                                        onChange={e => changeStatus(c.id, e.target.value)}
                                                        className="text-xs border border-orange-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-gray-600 bg-white"
                                                    >
                                                        <option value="UNREAD">অপঠিত</option>
                                                        <option value="READ">পঠিত</option>
                                                        <option value="REPLIED">উত্তর দেওয়া</option>
                                                    </select>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => deleteContact(c.id)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="মুছুন"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && !loading && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-orange-50">
                        <span className="text-xs text-gray-400">পেজ {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                ← আগে
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                পরে →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {modalOpen && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10" onClick={e => e.stopPropagation()}>

                        {/* Close */}
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="mb-5">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#fb8a3c] flex items-center justify-center text-white font-bold text-lg">
                                    {selected.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selected.name}</h3>
                                    <p className="text-xs text-gray-400">{selected.email}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(selected.createdAt)}</p>
                        </div>

                        {/* Message */}
                        <div className="bg-orange-50 rounded-xl p-4 mb-5">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <select
                                value={selected.status}
                                onChange={e => changeStatus(selected.id, e.target.value, false)}
                                className="px-3 py-2 text-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 text-gray-700 bg-white"
                            >
                                <option value="UNREAD">অপঠিত</option>
                                <option value="READ">পঠিত</option>
                                <option value="REPLIED">উত্তর দেওয়া</option>
                            </select>

                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${selected.email}?subject=Re: আপনার বার্তার উত্তর`}
                                    onClick={() => changeStatus(selected.id, 'REPLIED', false)}
                                    className="px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                                >
                                    ইমেইল পাঠান
                                </a>
                                <button
                                    onClick={() => deleteContact(selected.id)}
                                    className="px-4 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition"
                                >
                                    মুছুন
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}