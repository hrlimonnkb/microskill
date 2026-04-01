'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, authHeaders } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
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
export default function TicketDetailPage() {
    const { id }  = useParams();
    const router  = useRouter();

    // useAuth থেকে user ও isAdmin নাও — আলাদা auth check লাগবে না
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [ticket, setTicket]   = useState(null);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    // Reply
    const [replyMsg, setReplyMsg]     = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending]       = useState(false);
    const [replyErr, setReplyErr]     = useState('');

    // Admin-only — canned responses
    const [canned, setCanned]            = useState([]);
    const [showCanned, setShowCanned]    = useState(false);
    const [updatingStatus, setUpdStatus] = useState(false);

    // Student-only: rating
    const [showRating, setShowRating]   = useState(false);
    const [ratingVal, setRatingVal]     = useState(0);
    const [ratingComment, setRatingCmt] = useState('');
    const [ratingDone, setRatingDone]   = useState(false);
    const [ratingBusy, setRatingBusy]   = useState(false);

    // Reopen
    const [reopening, setReopening] = useState(false);

    // authLoading শেষ হলে data load করো
    useEffect(() => {
        if (authLoading) return;
        fetchTicket();
        if (isAdmin) fetchCanned();
    }, [authLoading, id]);

    // ── Fetch ticket ────────────────────────────────────────────
    async function fetchTicket() {
        setLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets/${id}`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) { router.replace('/dashboard/support'); return; }
            setTicket(data.ticket);
            if (!isAdmin && ['RESOLVED','CLOSED'].includes(data.ticket.status) && !data.ticket.rating) {
                setShowRating(true);
            }
            if (data.ticket.rating) setRatingDone(true);
        } catch {
            router.replace('/dashboard/support');
        } finally {
            setLoading(false);
        }
    }

    // ── Fetch canned responses (Admin only) ─────────────────────
    async function fetchCanned() {
        try {
            const res  = await fetch(`${API_BASE}/api/support/canned`, { headers: authHeaders() });
            const data = await res.json();
            setCanned(data.responses || []);
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
                body:    JSON.stringify({
                    message:    replyMsg.trim(),
                    isInternal: isAdmin ? isInternal : false,
                }),
            });
            const data = await res.json();
            if (!res.ok) return setReplyErr(data.message || 'সমস্যা হয়েছে');
            setReplyMsg('');
            setIsInternal(false);
            await fetchTicket();
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch {
            setReplyErr('নেটওয়ার্ক সমস্যা');
        } finally {
            setSending(false);
        }
    }

    // ── Status change (Admin only) ──────────────────────────────
    async function changeStatus(status) {
        setUpdStatus(true);
        try {
            await fetch(`${API_BASE}/api/support/tickets/${id}/status`, {
                method:  'PATCH',
                headers: authHeaders(),
                body:    JSON.stringify({ status }),
            });
            await fetchTicket();
        } catch { /* silent */ }
        finally { setUpdStatus(false); }
    }

    // ── Reopen (Student only) ───────────────────────────────────
    async function reopen() {
        if (!confirm('এই টিকেটটি পুনরায় খুলবেন?')) return;
        setReopening(true);
        try {
            await fetch(`${API_BASE}/api/support/tickets/${id}/reopen`, {
                method: 'PATCH', headers: authHeaders(),
            });
            await fetchTicket();
        } catch { /* silent */ }
        finally { setReopening(false); }
    }

    // ── Rating (Student only) ───────────────────────────────────
    async function submitRating() {
        if (!ratingVal) return;
        setRatingBusy(true);
        try {
            const res = await fetch(`${API_BASE}/api/support/tickets/${id}/rating`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ rating: ratingVal, comment: ratingComment }),
            });
            if (res.ok) { setRatingDone(true); setShowRating(false); fetchTicket(); }
        } catch { /* silent */ }
        finally { setRatingBusy(false); }
    }

    // ── Loading ─────────────────────────────────────────────────
    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin"/>
        </div>
    );

    if (!ticket) return null;

    const slaLeft = ticket.slaDeadline
        ? Math.ceil((new Date(ticket.slaDeadline) - Date.now()) / 3600000)
        : null;
    const breached  = ticket.slaBreached || (slaLeft !== null && slaLeft < 0);
    const canReply  = isAdmin || !['RESOLVED', 'CLOSED'].includes(ticket.status);
    const canReopen = !isAdmin && ['RESOLVED', 'CLOSED'].includes(ticket.status);

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-orange-400 mb-6">
                    <Link href="/dashboard/support" className="hover:text-[#f97316] transition">
                        {isAdmin ? 'Support Dashboard' : 'আমার সাপোর্ট'}
                    </Link>
                    <span>/</span>
                    <span className="text-orange-700 font-medium">#{ticket.ticketNumber}</span>
                </nav>

                {/* Admin → 2 column, Student → single centered column */}
                <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto w-full'}`}>

                    {/* ══ LEFT / MAIN ══════════════════════════════════════ */}
                    <div className={`space-y-4 ${isAdmin ? 'lg:col-span-2' : ''}`}>

                        {/* Ticket header */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-orange-400 font-semibold">#{ticket.ticketNumber}</span>
                                        {breached && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">SLA breach</span>
                                        )}
                                    </div>
                                    <h1 className="text-xl font-extrabold text-gray-900">{ticket.title}</h1>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${ST_BADGE[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {STATUS_OPTIONS.find(s => s.val === ticket.status)?.label || ticket.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
                                {isAdmin && (
                                    <span>Student: <strong className="text-gray-600">{ticket.user?.name}</strong> · {ticket.user?.email}</span>
                                )}
                                <span>{ticket.category} · {ticket.priority} · {formatDate(ticket.createdAt)}</span>
                                {ticket.course && <span>· {ticket.course.title}</span>}
                                {isAdmin && ticket.assignedTo && <span>· Assigned: {ticket.assignedTo.name}</span>}
                            </div>

                            {/* SLA bar — Admin only */}
                            {isAdmin && !['RESOLVED','CLOSED'].includes(ticket.status) && ticket.slaDeadline && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold mb-4 ${
                                    breached       ? 'bg-red-50    text-red-600    border border-red-200'
                                    : slaLeft < 4 ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                                  : 'bg-green-50  text-green-600  border border-green-100'
                                }`}>
                                    {breached ? '⚠ SLA Breach হয়েছে!' : `SLA: ${slaLeft} ঘন্টা বাকি`}
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-orange-50 rounded-xl p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                            </div>

                            {/* Rating badge */}
                            {ratingDone && ticket.rating && (
                                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} className={`text-lg ${s <= ticket.rating.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-amber-700 font-medium">{ticket.rating.rating}/5</span>
                                    {ticket.rating.comment && (
                                        <span className="text-xs text-gray-500">— "{ticket.rating.comment}"</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reply thread */}
                        <div className="space-y-3">
                            {ticket.replies?.map(reply => {
                                const fromAdmin   = reply.senderType === 'ADMIN';
                                const isMe        = reply.senderId === user?.id;
                                const showOnRight = isAdmin ? fromAdmin : isMe;
                                return (
                                    <div key={reply.id} className={`flex gap-3 ${showOnRight ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                                            fromAdmin ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c]' : 'bg-gray-300'
                                        }`}>
                                            {reply.sender?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className={`max-w-lg flex flex-col ${showOnRight ? 'items-end' : 'items-start'}`}>
                                            {reply.isInternal && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mb-1 font-medium">Internal Note</span>
                                            )}
                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                reply.isInternal
                                                    ? 'bg-yellow-50 border-2 border-dashed border-yellow-200 text-yellow-800 rounded-tr-sm'
                                                    : showOnRight
                                                        ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c] text-white rounded-tr-sm'
                                                        : 'bg-gray-50 border border-gray-200 text-gray-700 rounded-tl-sm'
                                            }`}>
                                                {/* Admin view — সবার নাম দেখাও */}
                                                {isAdmin && (
                                                    <div className={`text-xs font-semibold mb-1 ${showOnRight ? 'text-white/70' : 'text-gray-500'}`}>
                                                        {reply.sender?.name}
                                                    </div>
                                                )}
                                                {/* Student view — Admin reply এর label */}
                                                {!isAdmin && fromAdmin && (
                                                    <div className="text-xs font-bold text-white/70 mb-1">Support Team</div>
                                                )}
                                                <p className="whitespace-pre-wrap">{reply.message}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1 px-1">{formatDate(reply.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef}/>
                        </div>

                        {/* Rating prompt — Student, Resolved ticket */}
                        {!isAdmin && showRating && !ratingDone && (
                            <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-1">সমস্যা সমাধান হয়েছে!</h3>
                                <p className="text-sm text-gray-500 mb-4">আমাদের সেবা কেমন ছিল? রেটিং দিন।</p>
                                <div className="flex gap-2 mb-4">
                                    {[1,2,3,4,5].map(s => (
                                        <button key={s} onClick={() => setRatingVal(s)}
                                            className={`text-3xl transition-transform hover:scale-110 ${s <= ratingVal ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                                    ))}
                                </div>
                                <textarea rows={2} value={ratingComment} onChange={e => setRatingCmt(e.target.value)}
                                    placeholder="মন্তব্য (optional)..."
                                    className="w-full px-3 py-2 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-none mb-3"/>
                                <div className="flex gap-2">
                                    <button onClick={submitRating} disabled={!ratingVal || ratingBusy}
                                        className="px-5 py-2 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-40">
                                        {ratingBusy ? 'পাঠানো হচ্ছে...' : 'রেটিং দিন'}
                                    </button>
                                    <button onClick={() => setShowRating(false)}
                                        className="px-4 py-2 border border-orange-200 text-gray-500 text-sm rounded-xl hover:bg-orange-50 transition">পরে দেব</button>
                                </div>
                            </div>
                        )}

                        {/* Reply box */}
                        {canReply ? (
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                                {isAdmin && (
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <button onClick={() => setIsInternal(false)}
                                            className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition ${!isInternal ? 'bg-[#f97316] text-white' : 'text-gray-500 hover:bg-orange-50'}`}>
                                            Public Reply
                                        </button>
                                        <button onClick={() => setIsInternal(true)}
                                            className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition ${isInternal ? 'bg-yellow-400 text-white' : 'text-gray-500 hover:bg-yellow-50'}`}>
                                            Internal Note
                                        </button>
                                        <div className="relative ml-auto">
                                            <button onClick={() => setShowCanned(v => !v)}
                                                className="text-xs text-orange-500 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition">
                                                Template ব্যবহার করুন
                                            </button>
                                            {showCanned && canned.length > 0 && (
                                                <div className="absolute right-0 top-10 w-72 bg-white border border-orange-100 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto">
                                                    {canned.map(r => (
                                                        <button key={r.id} onClick={() => {
                                                            setReplyMsg(r.content);
                                                            setShowCanned(false);
                                                            fetch(`${API_BASE}/api/support/canned/${r.id}/use`, { method: 'PATCH', headers: authHeaders() }).catch(() => {});
                                                        }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-orange-50 last:border-0">
                                                            <div className="text-sm font-semibold text-gray-700">{r.title}</div>
                                                            <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{r.content}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {replyErr && (
                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{replyErr}</div>
                                )}

                                <textarea rows={4} value={replyMsg}
                                    onChange={e => { setReplyMsg(e.target.value); setReplyErr(''); }}
                                    placeholder={isInternal ? 'Internal note (Student দেখবে না)...' : 'বার্তা লিখুন...'}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none mb-3 ${
                                        isInternal ? 'border-yellow-200 bg-yellow-50 focus:ring-yellow-300' : 'border-orange-100 focus:ring-[#f97316]/30 focus:border-[#f97316]'
                                    }`}
                                    disabled={sending}/>

                                <button onClick={sendReply} disabled={sending || !replyMsg.trim()}
                                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-2 ${
                                        isInternal ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gradient-to-r from-[#f97316] to-[#fb8a3c] hover:opacity-90'
                                    }`}>
                                    {sending
                                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>পাঠানো হচ্ছে...</>
                                        : isInternal ? 'Note সেভ করুন' : 'পাঠান →'}
                                </button>
                            </div>

                        ) : canReopen ? (
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm text-center">
                                <p className="text-gray-500 text-sm mb-4">এই টিকেটটি বন্ধ। সমস্যা থাকলে Reopen করুন।</p>
                                <button onClick={reopen} disabled={reopening}
                                    className="px-6 py-2.5 border-2 border-[#f97316] text-[#f97316] font-bold rounded-xl hover:bg-orange-50 transition disabled:opacity-40">
                                    {reopening ? 'Reopening...' : 'টিকেট Reopen করুন'}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* ══ RIGHT — Admin controls ════════════════════════════ */}
                    {isAdmin && (
                        <div className="space-y-4">

                            {/* Status */}
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Status পরিবর্তন</h3>
                                <div className="space-y-2">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s.val} onClick={() => changeStatus(s.val)}
                                            disabled={updatingStatus || ticket.status === s.val}
                                            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition text-left ${
                                                ticket.status === s.val
                                                    ? 'bg-[#f97316] text-white cursor-default'
                                                    : 'border border-orange-100 text-gray-600 hover:bg-orange-50 disabled:opacity-40'
                                            }`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ticket info */}
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Ticket Info</h3>
                                <div className="space-y-2 text-xs text-gray-500">
                                    {[
                                        ['তৈরি',        formatDate(ticket.createdAt)],
                                        ['প্রথম reply', ticket.firstReplyAt ? formatDate(ticket.firstReplyAt) : '—'],
                                        ['সমাধান',      ticket.resolvedAt   ? formatDate(ticket.resolvedAt)   : '—'],
                                        ['Category',    ticket.category],
                                        ['Priority',    ticket.priority],
                                        ['Replies',     ticket.replies?.length || 0],
                                        ['SLA',         ticket.slaDeadline
                                            ? (breached ? '⚠ Breached' : `${slaLeft}h বাকি`)
                                            : '—'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between gap-2">
                                            <span>{k}</span>
                                            <span className="text-gray-700 font-medium text-right">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Student info */}
                            <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Student</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#fb8a3c] flex items-center justify-center text-white font-bold text-sm">
                                        {ticket.user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{ticket.user?.name}</p>
                                        <p className="text-xs text-gray-400">{ticket.user?.email}</p>
                                    </div>
                                </div>
                                <a href={`mailto:${ticket.user?.email}?subject=Re: [${ticket.ticketNumber}] ${ticket.title}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 text-xs font-semibold rounded-xl hover:bg-orange-50 transition">
                                    Direct Email পাঠান
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}