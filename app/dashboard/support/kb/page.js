'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_OPTIONS = [
    { val: 'OPEN',            label: 'খোলা'          },
    { val: 'IN_PROGRESS',     label: 'প্রক্রিয়াধীন' },
    { val: 'WAITING_STUDENT', label: 'Student উত্তর' },
    { val: 'RESOLVED',        label: 'সমাধান'        },
    { val: 'CLOSED',          label: 'বন্ধ'          },
    { val: 'ESCALATED',       label: 'Escalated'     },
];

const ST_BADGE = {
    OPEN:            'bg-orange-100 text-[#f97316]',
    IN_PROGRESS:     'bg-blue-100 text-blue-600',
    WAITING_STUDENT: 'bg-yellow-100 text-yellow-700',
    RESOLVED:        'bg-green-100 text-green-600',
    CLOSED:          'bg-gray-100 text-gray-500',
    REOPENED:        'bg-purple-100 text-purple-600',
    ESCALATED:       'bg-red-100 text-red-600',
};

// ═══════════════════════════════════════════════════════════════
export default function AdminTicketDetail() {
    const { id }  = useParams();
    const router  = useRouter();
    const bottomRef = useRef(null);

    const [ticket, setTicket]   = useState(null);
    const [loading, setLoading] = useState(true);

    // Reply
    const [replyMsg, setReplyMsg]       = useState('');
    const [isInternal, setIsInternal]   = useState(false);
    const [sending, setSending]         = useState(false);
    const [replyErr, setReplyErr]       = useState('');

    // Canned responses
    const [canned, setCanned]           = useState([]);
    const [showCanned, setShowCanned]   = useState(false);

    // Status / Assign
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [admins, setAdmins]                 = useState([]);

    // Auth
    const [authOk, setAuthOk] = useState(false);

    useEffect(() => {
        try {
            const t = localStorage.getItem('authToken');
            if (!t) { router.replace('/'); return; }
            const p = JSON.parse(atob(t.split('.')[1]));
            if (p?.role?.toUpperCase() !== 'ADMIN') { router.replace('/'); return; }
            setAuthOk(true);
        } catch { router.replace('/'); }
    }, []);

    useEffect(() => {
        if (!authOk) return;
        fetchTicket();
        fetchCanned();
        fetchAdmins();
    }, [authOk, id]);

    async function fetchTicket() {
        setLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets/${id}`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) { router.replace('/dashboard/support'); return; }
            setTicket(data.ticket);
        } catch { router.replace('/dashboard/support'); }
        finally { setLoading(false); }
    }

    async function fetchCanned() {
        try {
            const res  = await fetch(`${API_BASE}/api/support/canned`, { headers: authHeaders() });
            const data = await res.json();
            setCanned(data.responses || []);
        } catch { /* silent */ }
    }

    async function fetchAdmins() {
        try {
            const res  = await fetch(`${API_BASE}/api/admin/list`, { headers: authHeaders() });
            const data = await res.json();
            setAdmins(data.admins || data.users || []);
        } catch { /* silent */ }
    }

    // ── Send reply ──────────────────────────────────────────────
    async function sendReply() {
        if (!replyMsg.trim()) return setReplyErr('বার্তা লিখুন');
        setSending(true); setReplyErr('');
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets/${id}/reply`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ message: replyMsg.trim(), isInternal }),
            });
            const data = await res.json();
            if (!res.ok) return setReplyErr(data.message || 'সমস্যা হয়েছে');
            setReplyMsg('');
            setIsInternal(false);
            await fetchTicket();
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { setReplyErr('নেটওয়ার্ক সমস্যা'); }
        finally { setSending(false); }
    }

    // ── Status change ───────────────────────────────────────────
    async function changeStatus(status) {
        setUpdatingStatus(true);
        try {
            await fetch(`${API_BASE}/api/support/tickets/${id}/status`, {
                method:  'PATCH',
                headers: authHeaders(),
                body:    JSON.stringify({ status }),
            });
            await fetchTicket();
        } catch { /* silent */ }
        finally { setUpdatingStatus(false); }
    }

    // ── Assign ──────────────────────────────────────────────────
    async function assign(assignedToId) {
        try {
            await fetch(`${API_BASE}/api/support/tickets/${id}/assign`, {
                method:  'PATCH',
                headers: authHeaders(),
                body:    JSON.stringify({ assignedToId: parseInt(assignedToId) }),
            });
            await fetchTicket();
        } catch { /* silent */ }
    }

    // ── Use canned response ─────────────────────────────────────
    async function useCanned(r) {
        setReplyMsg(r.content);
        setShowCanned(false);
        // usageCount বাড়াও
        fetch(`${API_BASE}/api/support/canned/${r.id}/use`, { method: 'PATCH', headers: authHeaders() }).catch(() => {});
    }

    if (!authOk || loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!ticket) return null;

    const slaLeft = ticket.slaDeadline
        ? Math.ceil((new Date(ticket.slaDeadline) - new Date()) / 3600000)
        : null;
    const breached = ticket.slaBreached || slaLeft < 0;

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-orange-400 mb-6">
                    <Link href="/dashboard/support" className="hover:text-[#f97316]">Support</Link>
                    <span>/</span>
                    <span className="text-orange-700 font-medium">#{ticket.ticketNumber}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT — Thread ── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Ticket header */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                                <div>
                                    <span className="font-mono text-xs text-orange-400 font-semibold">#{ticket.ticketNumber}</span>
                                    <h1 className="text-xl font-extrabold text-gray-900 mt-1">{ticket.title}</h1>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${ST_BADGE[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {STATUS_OPTIONS.find(s => s.val === ticket.status)?.label || ticket.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
                                <span>Student: <strong className="text-gray-600">{ticket.user?.name}</strong></span>
                                <span>· {ticket.user?.email}</span>
                                <span>· {ticket.category}</span>
                                <span className={`font-semibold ${ticket.priority === 'URGENT' ? 'text-red-500' : ticket.priority === 'HIGH' ? 'text-orange-500' : 'text-gray-500'}`}>
                                    · {ticket.priority}
                                </span>
                                {ticket.course && <span>· {ticket.course.title}</span>}
                                <span>· {formatDate(ticket.createdAt)}</span>
                            </div>

                            {/* SLA alert */}
                            {!['RESOLVED','CLOSED'].includes(ticket.status) && ticket.slaDeadline && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold mb-4 ${
                                    breached ? 'bg-red-50 text-red-600 border border-red-200'
                                             : slaLeft < 4 ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                             : 'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                    <span>{breached ? '⚠ SLA Breach হয়েছে!' : `SLA: ${slaLeft} ঘন্টা বাকি`}</span>
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-orange-50 rounded-xl p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                            </div>

                            {/* Rating */}
                            {ticket.rating && (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} className={`text-lg ${s <= ticket.rating.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-amber-700 font-medium">{ticket.rating.rating}/5</span>
                                    {ticket.rating.comment && <span className="text-xs text-gray-500">— {ticket.rating.comment}</span>}
                                </div>
                            )}
                        </div>

                        {/* Reply thread */}
                        <div className="space-y-3">
                            {ticket.replies?.map(reply => {
                                const isAdmin = reply.senderType === 'ADMIN';
                                return (
                                    <div key={reply.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                                            isAdmin ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c]' : 'bg-gray-300'
                                        }`}>
                                            {reply.sender?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className={`max-w-lg flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            {reply.isInternal && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mb-1 font-medium">Internal Note</span>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                reply.isInternal
                                                    ? 'bg-yellow-50 border-2 border-dashed border-yellow-200 text-yellow-800 rounded-tr-sm'
                                                    : isAdmin
                                                        ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c] text-white rounded-tr-sm'
                                                        : 'bg-gray-50 border border-gray-200 text-gray-700 rounded-tl-sm'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{reply.message}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1 px-1">
                                                {reply.sender?.name} · {formatDate(reply.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* ── Reply box ── */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                            {/* Internal toggle */}
                            <div className="flex items-center gap-4 mb-3">
                                <button
                                    onClick={() => setIsInternal(false)}
                                    className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition ${!isInternal ? 'bg-[#f97316] text-white' : 'text-gray-500 hover:bg-orange-50'}`}
                                >
                                    Public Reply
                                </button>
                                <button
                                    onClick={() => setIsInternal(true)}
                                    className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition ${isInternal ? 'bg-yellow-400 text-white' : 'text-gray-500 hover:bg-yellow-50'}`}
                                >
                                    Internal Note
                                </button>

                                {/* Canned response */}
                                <div className="relative ml-auto">
                                    <button
                                        onClick={() => setShowCanned(!showCanned)}
                                        className="text-xs text-orange-500 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition"
                                    >
                                        Template ব্যবহার করুন
                                    </button>
                                    {showCanned && canned.length > 0 && (
                                        <div className="absolute right-0 top-10 w-72 bg-white border border-orange-100 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto">
                                            {canned.map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => useCanned(r)}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-orange-50 last:border-0"
                                                >
                                                    <div className="text-sm font-semibold text-gray-700">{r.title}</div>
                                                    <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{r.content}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {replyErr && (
                                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{replyErr}</div>
                            )}

                            <textarea
                                rows={4}
                                value={replyMsg}
                                onChange={e => { setReplyMsg(e.target.value); setReplyErr(''); }}
                                placeholder={isInternal ? 'Internal note (Student দেখবে না)...' : 'Student কে reply দিন...'}
                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none mb-3 ${
                                    isInternal
                                        ? 'border-yellow-200 bg-yellow-50 focus:ring-yellow-300'
                                        : 'border-orange-100 focus:ring-[#f97316]/30 focus:border-[#f97316]'
                                }`}
                                disabled={sending}
                            />

                            <button
                                onClick={sendReply}
                                disabled={sending || !replyMsg.trim()}
                                className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-2 ${
                                    isInternal
                                        ? 'bg-yellow-400 hover:bg-yellow-500'
                                        : 'bg-gradient-to-r from-[#f97316] to-[#fb8a3c] hover:opacity-90'
                                }`}
                            >
                                {sending ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> পাঠানো হচ্ছে...</>
                                ) : isInternal ? 'Note সেভ করুন' : 'Reply পাঠান →'}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT — Controls ── */}
                    <div className="space-y-4">

                        {/* Status */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Status পরিবর্তন</h3>
                            <div className="space-y-2">
                                {STATUS_OPTIONS.map(s => (
                                    <button
                                        key={s.val}
                                        onClick={() => changeStatus(s.val)}
                                        disabled={updatingStatus || ticket.status === s.val}
                                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition text-left ${
                                            ticket.status === s.val
                                                ? 'bg-[#f97316] text-white cursor-default'
                                                : 'border border-orange-100 text-gray-600 hover:bg-orange-50 disabled:opacity-40'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assign */}
                        {admins.length > 0 && (
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Agent Assign করুন</h3>
                                <select
                                    value={ticket.assignedToId || ''}
                                    onChange={e => assign(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 text-gray-700 bg-white"
                                >
                                    <option value="">Assign করুন</option>
                                    {admins.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                {ticket.assignedTo && (
                                    <p className="text-xs text-gray-400 mt-2">বর্তমানে: <strong>{ticket.assignedTo.name}</strong></p>
                                )}
                            </div>
                        )}

                        {/* Ticket info */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Ticket Info</h3>
                            <div className="space-y-2 text-xs text-gray-500">
                                <div className="flex justify-between">
                                    <span>তৈরি হয়েছে</span>
                                    <span className="text-gray-700 font-medium">{formatDate(ticket.createdAt)}</span>
                                </div>
                                {ticket.firstReplyAt && (
                                    <div className="flex justify-between">
                                        <span>প্রথম reply</span>
                                        <span className="text-gray-700 font-medium">{formatDate(ticket.firstReplyAt)}</span>
                                    </div>
                                )}
                                {ticket.resolvedAt && (
                                    <div className="flex justify-between">
                                        <span>সমাধান</span>
                                        <span className="text-green-600 font-medium">{formatDate(ticket.resolvedAt)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Category</span>
                                    <span className="text-gray-700 font-medium">{ticket.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Priority</span>
                                    <span className={`font-semibold ${ticket.priority === 'URGENT' ? 'text-red-500' : ticket.priority === 'HIGH' ? 'text-orange-500' : 'text-gray-700'}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Replies</span>
                                    <span className="text-gray-700 font-medium">{ticket.replies?.length || 0}</span>
                                </div>
                                {ticket.slaDeadline && (
                                    <div className="flex justify-between">
                                        <span>SLA Deadline</span>
                                        <span className={`font-semibold ${breached ? 'text-red-500' : 'text-green-600'}`}>
                                            {breached ? 'Breached' : `${slaLeft}h বাকি`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student info */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Student</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#fb8a3c] flex items-center justify-center text-white font-bold">
                                    {ticket.user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{ticket.user?.name}</p>
                                    <p className="text-xs text-gray-400">{ticket.user?.email}</p>
                                </div>
                            </div>
                            <a
                                href={`mailto:${ticket.user?.email}?subject=Re: [${ticket.ticketNumber}] ${ticket.title}`}
                                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 text-xs font-semibold rounded-xl hover:bg-orange-50 transition"
                            >
                                Direct Email পাঠান
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}