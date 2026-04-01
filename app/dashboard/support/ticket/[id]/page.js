'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}

function getMe() {
    try {
        const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!t) return null;
        return JSON.parse(atob(t.split('.')[1]));
    } catch { return null; }
}

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const STATUS = {
    OPEN:             { label: 'খোলা',          bg: 'bg-orange-100', text: 'text-[#f97316]'  },
    IN_PROGRESS:      { label: 'প্রক্রিয়াধীন', bg: 'bg-blue-100',   text: 'text-blue-600'   },
    WAITING_STUDENT:  { label: 'আপনার উত্তর',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
    RESOLVED:         { label: 'সমাধান হয়েছে', bg: 'bg-green-100',  text: 'text-green-600'  },
    CLOSED:           { label: 'বন্ধ',          bg: 'bg-gray-100',   text: 'text-gray-500'   },
    REOPENED:         { label: 'পুনরায় খোলা',  bg: 'bg-purple-100', text: 'text-purple-600' },
    ESCALATED:        { label: 'Escalated',     bg: 'bg-red-100',    text: 'text-red-600'    },
};

// ═══════════════════════════════════════════════════════════════
export default function TicketDetailPage({ params }) {
    const ticketId = params?.id;
    const router   = useRouter();
    const me       = getMe();
    const bottomRef = useRef(null);

    const [ticket, setTicket]     = useState(null);
    const [loading, setLoading]   = useState(true);
    const [replyMsg, setReplyMsg] = useState('');
    const [sending, setSending]   = useState(false);
    const [replyErr, setReplyErr] = useState('');
    const [reopening, setReopening] = useState(false);

    // Rating
    const [showRating, setShowRating] = useState(false);
    const [ratingVal, setRatingVal]   = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingDone, setRatingDone] = useState(false);
    const [ratingSubmitting, setRatingSubmitting] = useState(false);

    useEffect(() => { fetchTicket(); }, [ticketId]);

    async function fetchTicket() {
        setLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets/${ticketId}`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) { router.replace('/support'); return; }
            setTicket(data.ticket);
            // Resolved && no rating → show rating prompt
            if (['RESOLVED', 'CLOSED'].includes(data.ticket.status) && !data.ticket.rating) {
                setShowRating(true);
            }
            if (data.ticket.rating) setRatingDone(true);
        } catch { router.replace('/support'); }
        finally  { setLoading(false); }
    }

    async function sendReply() {
        if (!replyMsg.trim()) return setReplyErr('বার্তা লিখুন');
        setSending(true); setReplyErr('');
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/reply`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ message: replyMsg.trim() }),
            });
            const data = await res.json();
            if (!res.ok) return setReplyErr(data.message || 'সমস্যা হয়েছে');
            setReplyMsg('');
            await fetchTicket();
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { setReplyErr('নেটওয়ার্ক সমস্যা'); }
        finally  { setSending(false); }
    }

    async function reopen() {
        if (!confirm('এই টিকেটটি পুনরায় খুলবেন?')) return;
        setReopening(true);
        try {
            await fetch(`${API_BASE}/api/support/tickets/${ticketId}/reopen`, {
                method: 'PATCH', headers: authHeaders(),
            });
            await fetchTicket();
        } catch { /* silent */ }
        finally { setReopening(false); }
    }

    async function submitRating() {
        if (!ratingVal) return;
        setRatingSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/rating`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ rating: ratingVal, comment: ratingComment }),
            });
            if (res.ok) { setRatingDone(true); setShowRating(false); await fetchTicket(); }
        } catch { /* silent */ }
        finally { setRatingSubmitting(false); }
    }

    if (loading) return (
        <div className="min-h-screen bg-orange-50/30 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!ticket) return null;

    const st = STATUS[ticket.status] || STATUS.OPEN;
    const canReply  = !['RESOLVED', 'CLOSED'].includes(ticket.status);
    const canReopen = ['RESOLVED', 'CLOSED'].includes(ticket.status);

    return (
        <div className="min-h-screen bg-orange-50/30">
            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-orange-400 mb-6">
                    <Link href="/support" className="hover:text-[#f97316] transition">সাপোর্ট</Link>
                    <span>/</span>
                    <span className="text-orange-700 font-medium">#{ticket.ticketNumber}</span>
                </nav>

                {/* ── Ticket header ── */}
                <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-orange-400 font-semibold">#{ticket.ticketNumber}</span>
                                {ticket.slaBreached && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">SLA breach</span>
                                )}
                            </div>
                            <h1 className="text-xl font-extrabold text-gray-900">{ticket.title}</h1>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${st.bg} ${st.text}`}>
                            {st.label}
                        </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-5">
                        <span>খোলা হয়েছে: {formatDate(ticket.createdAt)}</span>
                        {ticket.course    && <span>· {ticket.course.title}</span>}
                        {ticket.assignedTo && <span>· Assigned: {ticket.assignedTo.name}</span>}
                        <span>· {ticket.category}</span>
                        <span>· {ticket.priority}</span>
                    </div>

                    {/* Original description */}
                    <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Resolved — rating done */}
                    {ratingDone && ticket.rating && (
                        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                    <span key={s} className={`text-lg ${s <= ticket.rating.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                ))}
                            </div>
                            <span className="text-xs text-green-600 font-medium">আপনি রেটিং দিয়েছেন</span>
                        </div>
                    )}
                </div>

                {/* ── Reply thread ── */}
                <div className="space-y-3 mb-4">
                    {ticket.replies?.map(reply => {
                        const isMe = reply.senderId === me?.id;
                        const isAdmin = reply.sender?.role?.toUpperCase() === 'ADMIN';
                        return (
                            <div
                                key={reply.id}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                                    isAdmin ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c]' : 'bg-gray-300'
                                }`}>
                                    {reply.sender?.name?.charAt(0)?.toUpperCase()}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        isMe
                                            ? 'bg-gradient-to-br from-[#f97316] to-[#fb8a3c] text-white rounded-tr-sm'
                                            : isAdmin
                                                ? 'bg-orange-50 border border-orange-200 text-gray-700 rounded-tl-sm'
                                                : 'bg-gray-50 border border-gray-200 text-gray-700 rounded-tl-sm'
                                    }`}>
                                        {isAdmin && !isMe && (
                                            <div className="text-xs font-bold text-[#f97316] mb-1">Support Team</div>
                                        )}
                                        <p className="whitespace-pre-wrap">{reply.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 px-1">{formatDate(reply.createdAt)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* ── Rating prompt ── */}
                {showRating && !ratingDone && (
                    <div className="bg-white rounded-2xl border border-green-200 p-5 mb-4 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-1">সমস্যা সমাধান হয়েছে!</h3>
                        <p className="text-sm text-gray-500 mb-4">আমাদের সেবা কেমন ছিল? রেটিং দিন।</p>

                        {/* Stars */}
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setRatingVal(s)}
                                    className={`text-3xl transition-transform hover:scale-110 ${
                                        s <= ratingVal ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                >★</button>
                            ))}
                        </div>

                        <textarea
                            rows={2}
                            value={ratingComment}
                            onChange={e => setRatingComment(e.target.value)}
                            placeholder="মন্তব্য (optional)..."
                            className="w-full px-3 py-2 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-none mb-3"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={submitRating}
                                disabled={!ratingVal || ratingSubmitting}
                                className="px-5 py-2 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-40"
                            >
                                {ratingSubmitting ? 'পাঠানো হচ্ছে...' : 'রেটিং দিন'}
                            </button>
                            <button
                                onClick={() => setShowRating(false)}
                                className="px-4 py-2 border border-orange-200 text-gray-500 text-sm rounded-xl hover:bg-orange-50 transition"
                            >
                                পরে দেব
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Reply box ── */}
                {canReply ? (
                    <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Reply দিন</h3>
                        {replyErr && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{replyErr}</div>
                        )}
                        <textarea
                            rows={4}
                            value={replyMsg}
                            onChange={e => { setReplyMsg(e.target.value); setReplyErr(''); }}
                            placeholder="আপনার বার্তা লিখুন..."
                            className="w-full px-4 py-3 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-none mb-3"
                            disabled={sending}
                        />
                        <button
                            onClick={sendReply}
                            disabled={sending || !replyMsg.trim()}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2"
                        >
                            {sending ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> পাঠানো হচ্ছে...</>
                            ) : 'পাঠান →'}
                        </button>
                    </div>
                ) : canReopen ? (
                    <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm text-center">
                        <p className="text-gray-500 text-sm mb-4">এই টিকেটটি বন্ধ আছে। সমস্যা এখনো থাকলে Reopen করুন।</p>
                        <button
                            onClick={reopen}
                            disabled={reopening}
                            className="px-6 py-2.5 border-2 border-[#f97316] text-[#f97316] font-bold rounded-xl hover:bg-orange-50 transition disabled:opacity-40"
                        >
                            {reopening ? 'Reopening...' : 'টিকেট Reopen করুন'}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}