'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth, authHeaders } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

// ── Helpers ────────────────────────────────────────────────────
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const STATUS = {
    OPEN:            { label: 'খোলা',          bg: 'bg-orange-100', text: 'text-[#f97316]',  dot: 'bg-[#f97316]'  },
    IN_PROGRESS:     { label: 'প্রক্রিয়াধীন', bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-500'   },
    WAITING_STUDENT: { label: 'আপনার উত্তর',  bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    RESOLVED:        { label: 'সমাধান',        bg: 'bg-green-100',  text: 'text-green-600',  dot: 'bg-green-500'  },
    CLOSED:          { label: 'বন্ধ',          bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
    REOPENED:        { label: 'Reopened',      bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
    ESCALATED:       { label: 'Escalated',     bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500'    },
};

const PRIORITY_COLOR = {
    LOW: 'text-gray-400', MEDIUM: 'text-yellow-500',
    HIGH: 'text-orange-500', URGENT: 'text-red-500 font-bold',
};

// ═══════════════════════════════════════════════════════════════
export default function SupportDashboard() {
    const { user, loading: authLoading, isAdmin } = useAuth();

    if (authLoading) return <Spinner />;

    return isAdmin ? <AdminView user={user} /> : <StudentView user={user} />;
}

// ───────────────────────────────────────────────────────────────
// ── ADMIN VIEW ─────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────
function AdminView({ user }) {
    const [tickets, setTickets]   = useState([]);
    const [stats, setStats]       = useState({});
    const [loading, setLoading]   = useState(true);
    const [page, setPage]         = useState(1);
    const [totalPages, setTotal]  = useState(1);
    const [statusF, setStatusF]   = useState('');
    const [priorityF, setPriF]    = useState('');
    const [categoryF, setCatF]    = useState('');
    const [inputVal, setInputVal] = useState('');
    const [search, setSearch]     = useState('');

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (statusF)   params.set('status',   statusF);
            if (priorityF) params.set('priority', priorityF);
            if (categoryF) params.set('category', categoryF);
            if (search)    params.set('search',   search);

            const [tr, sr] = await Promise.all([
                fetch(`${API_BASE}/api/support/tickets?${params}`,  { headers: authHeaders() }),
                fetch(`${API_BASE}/api/support/tickets/stats`,       { headers: authHeaders() }),
            ]);
            const [td, sd] = await Promise.all([tr.json(), sr.json()]);
            setTickets(td.tickets || []);
            setTotal(td.pagination?.totalPages || 1);
            setStats(sd.stats || {});
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, statusF, priorityF, categoryF, search]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Search debounce
    useEffect(() => {
        const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [inputVal]);

    async function quickStatus(id, status) {
        await fetch(`${API_BASE}/api/support/tickets/${id}/status`, {
            method: 'PATCH', headers: authHeaders(),
            body: JSON.stringify({ status }),
        });
        fetchAll();
    }

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-orange-900">Support Dashboard</h1>
                    <p className="text-orange-400 text-sm mt-1">স্বাগতম, {user?.name}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link href="/dashboard/support/kb"     className="px-4 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition">KB Manage</Link>
                    <Link href="/dashboard/support/canned" className="px-4 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition">Templates</Link>
                    <Link href="/dashboard/support/qa"     className="px-4 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition">Q&A</Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
                {[
                    { label: 'মোট',        value: stats.total,          color: 'border-orange-200 bg-white'     },
                    { label: 'খোলা',       value: stats.open,           color: 'border-[#f97316] bg-orange-50'  },
                    { label: 'চলছে',       value: stats.inProgress,     color: 'border-blue-200 bg-blue-50'     },
                    { label: 'Waiting',    value: stats.waitingStudent, color: 'border-yellow-300 bg-yellow-50' },
                    { label: 'সমাধান',     value: stats.resolved,       color: 'border-green-200 bg-green-50'   },
                    { label: 'SLA Breach', value: stats.slaBreached,    color: 'border-red-300 bg-red-50'       },
                    { label: 'Avg Rating', value: stats.avgRating ? `${stats.avgRating}★` : '—', color: 'border-amber-200 bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className={`border-2 ${s.color} rounded-2xl p-3 text-center`}>
                        <div className={`text-2xl font-black ${s.label === 'SLA Breach' && stats.slaBreached > 0 ? 'text-red-600' : 'text-orange-900'}`}>
                            {s.value ?? 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-orange-50">
                    <div className="relative flex-1 min-w-44">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                        </svg>
                        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
                            placeholder="নাম, ইমেইল, টিকেট নম্বর..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 placeholder-gray-400"/>
                    </div>
                    <select value={statusF}   onChange={e => { setStatusF(e.target.value);   setPage(1); }} className="px-3 py-2.5 text-sm border border-orange-100 rounded-xl bg-white text-gray-700 focus:outline-none">
                        <option value="">সব Status</option>
                        {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                    </select>
                    <select value={priorityF} onChange={e => { setPriF(e.target.value);      setPage(1); }} className="px-3 py-2.5 text-sm border border-orange-100 rounded-xl bg-white text-gray-700 focus:outline-none">
                        <option value="">সব Priority</option>
                        <option value="URGENT">জরুরি</option>
                        <option value="HIGH">বেশি</option>
                        <option value="MEDIUM">মাঝারি</option>
                        <option value="LOW">কম</option>
                    </select>
                    <select value={categoryF} onChange={e => { setCatF(e.target.value);      setPage(1); }} className="px-3 py-2.5 text-sm border border-orange-100 rounded-xl bg-white text-gray-700 focus:outline-none">
                        <option value="">সব Category</option>
                        {['TECHNICAL','BILLING','CONTENT','GENERAL','OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={fetchAll} className="px-4 py-2.5 border border-orange-200 text-orange-600 hover:bg-orange-50 text-sm font-medium rounded-xl transition">↻ রিফ্রেশ</button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-orange-50/60 border-b border-orange-50">
                                {['টিকেট','Student','Status','Priority','SLA','তারিখ','কাজ'].map(h => (
                                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wide ${['Student','SLA','তারিখ'].includes(h) ? 'hidden md:table-cell' : ''} ${['Priority'].includes(h) ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_,i) => (
                                    <tr key={i} className="border-t border-orange-50 animate-pulse">
                                        {[...Array(7)].map((_,j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-orange-50 rounded"/></td>)}
                                    </tr>
                                ))
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">কোনো টিকেট পাওয়া যায়নি</td></tr>
                            ) : tickets.map(t => {
                                const st = STATUS[t.status] || STATUS.OPEN;
                                const slaLeft = t.slaDeadline ? Math.ceil((new Date(t.slaDeadline) - Date.now()) / 3600000) : null;
                                const breached = t.slaBreached || (slaLeft !== null && slaLeft < 0);
                                return (
                                    <tr key={t.id} className={`border-t border-orange-50 hover:bg-orange-50/30 transition ${breached ? 'bg-red-50/20' : ''}`}>
                                        <td className="px-4 py-4">
                                            <Link href={`/dashboard/support/${t.id}`} className="group">
                                                <div className="font-mono text-xs text-orange-400">#{t.ticketNumber}</div>
                                                <div className="font-semibold text-gray-800 group-hover:text-[#f97316] transition max-w-xs truncate">{t.title}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{t.category} · {t._count?.replies || 0} replies</div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <div className="text-sm font-medium text-gray-700">{t.user?.name}</div>
                                            <div className="text-xs text-gray-400">{t.user?.email}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-4 hidden sm:table-cell text-sm font-semibold ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            {t.slaDeadline && !['RESOLVED','CLOSED'].includes(t.status) ? (
                                                <span className={`text-xs font-semibold ${breached ? 'text-red-600' : slaLeft < 4 ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {breached ? '⚠ Breach' : `${slaLeft}h বাকি`}
                                                </span>
                                            ) : <span className="text-xs text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell text-xs text-gray-400">{formatDate(t.createdAt)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <select value={t.status} onChange={e => quickStatus(t.id, e.target.value)}
                                                    className="text-xs border border-orange-100 rounded-lg px-2 py-1 focus:outline-none text-gray-600 bg-white">
                                                    {Object.entries(STATUS).map(([v,s]) => <option key={v} value={v}>{s.label}</option>)}
                                                </select>
                                                <Link href={`/dashboard/support/${t.id}`}
                                                    className="p-1.5 text-orange-400 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-orange-50">
                        <span className="text-xs text-gray-400">পেজ {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                                className="px-3 py-1.5 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-40 transition">← আগে</button>
                            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                                className="px-3 py-1.5 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-40 transition">পরে →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────
// ── STUDENT VIEW ───────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────
function StudentView({ user }) {
    const [tickets, setTickets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [statusF, setStatusF]   = useState('');
    const [page, setPage]         = useState(1);
    const [totalPages, setTotal]  = useState(1);
    const [counts, setCounts]     = useState({ open: 0, inProgress: 0, waiting: 0, resolved: 0 });

    useEffect(() => { fetchTickets(); }, [page, statusF]);

    async function fetchTickets() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 10 });
            if (statusF) params.set('status', statusF);
            const res  = await fetch(`${API_BASE}/api/support/tickets/my?${params}`, { headers: authHeaders() });
            const data = await res.json();
            const list = data.tickets || [];
            setTickets(list);
            setTotal(data.pagination?.totalPages || 1);
            if (page === 1 && !statusF) {
                setCounts({
                    open:       list.filter(t => t.status === 'OPEN').length,
                    inProgress: list.filter(t => t.status === 'IN_PROGRESS').length,
                    waiting:    list.filter(t => t.status === 'WAITING_STUDENT').length,
                    resolved:   list.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length,
                });
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-orange-900">আমার সাপোর্ট</h1>
                        <p className="text-orange-400 text-sm mt-1">স্বাগতম, {user?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/support/help"
                            className="px-4 py-2.5 border border-orange-200 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition">
                            Help Center
                        </Link>
                        <Link href="/dashboard/support/new"
                            className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm">
                            + নতুন টিকেট
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'খোলা',            value: counts.open,       color: 'border-[#f97316] bg-orange-50' },
                        { label: 'প্রক্রিয়াধীন',   value: counts.inProgress, color: 'border-blue-200 bg-blue-50'    },
                        { label: 'আপনার উত্তর',     value: counts.waiting,    color: 'border-yellow-300 bg-yellow-50'},
                        { label: 'সমাধান হয়েছে',   value: counts.resolved,   color: 'border-green-200 bg-green-50'  },
                    ].map(s => (
                        <div key={s.label} className={`border-2 ${s.color} rounded-2xl p-4 text-center`}>
                            <div className="text-2xl font-black text-orange-900">{s.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {[
                        { val: '',                label: 'সব'             },
                        { val: 'OPEN',            label: 'খোলা'           },
                        { val: 'WAITING_STUDENT', label: 'আপনার উত্তর'   },
                        { val: 'IN_PROGRESS',     label: 'প্রক্রিয়াধীন'  },
                        { val: 'RESOLVED',        label: 'সমাধান হয়েছে' },
                    ].map(f => (
                        <button key={f.val} onClick={() => { setStatusF(f.val); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                statusF === f.val ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316] hover:text-[#f97316]'
                            }`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Ticket list */}
                <div className="space-y-3">
                    {loading ? (
                        [...Array(4)].map((_,i) => (
                            <div key={i} className="bg-white rounded-2xl border border-orange-100 p-5 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-orange-100 rounded w-3/4"/>
                                        <div className="h-3 bg-orange-50 rounded w-1/2"/>
                                    </div>
                                    <div className="h-6 bg-orange-100 rounded-full w-20"/>
                                </div>
                            </div>
                        ))
                    ) : tickets.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <p className="text-gray-500 mb-4">কোনো টিকেট নেই</p>
                            <Link href="/dashboard/support/new"
                                className="inline-flex px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
                                + নতুন টিকেট খুলুন
                            </Link>
                        </div>
                    ) : tickets.map(ticket => {
                        const st = STATUS[ticket.status] || STATUS.OPEN;
                        return (
                            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                                <div className={`bg-white rounded-2xl border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                                    ticket.status === 'WAITING_STUDENT' ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-orange-100'
                                }`}>
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-orange-400 font-semibold">#{ticket.ticketNumber}</span>
                                                {ticket.slaBreached && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">SLA breach</span>}
                                            </div>
                                            <h3 className="font-bold text-gray-800 truncate">{ticket.title}</h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                                                <span>{formatDate(ticket.createdAt)}</span>
                                                {ticket.course && <span>· {ticket.course.title}</span>}
                                                <span>· {ticket._count?.replies || 0} reply</span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${st.bg} ${st.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                                            {st.label}
                                        </span>
                                    </div>
                                    {ticket.status === 'WAITING_STUDENT' && (
                                        <div className="mt-3 pt-3 border-t border-yellow-100 text-xs text-yellow-700 font-medium">
                                            আপনার উত্তরের অপেক্ষায় — reply দিন
                                        </div>
                                    )}
                                    {ticket.status === 'RESOLVED' && !ticket.rating && (
                                        <div className="mt-3 pt-3 border-t border-green-100 text-xs text-green-600 font-medium">
                                            সমাধান হয়েছে — রেটিং দিন
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                            className="px-4 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm hover:bg-orange-50 disabled:opacity-40 transition">← আগে</button>
                        <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                            className="px-4 py-2 border border-orange-200 text-orange-600 rounded-xl text-sm hover:bg-orange-50 disabled:opacity-40 transition">পরে →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Shared spinner ──────────────────────────────────────────────
function Spinner() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin"/>
        </div>
    );
}