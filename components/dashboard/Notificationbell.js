'use client';

// ═══════════════════════════════════════════════════════════════
// components/ui/NotificationBell.jsx
// Navbar এ ব্যবহার করুন:
//   import NotificationBell from '@/components/ui/NotificationBell';
//   <NotificationBell />
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('AuthToken') : null;
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}

function timeAgo(d) {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60)   return `${diff}s আগে`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h আগে`;
    return `${Math.floor(diff / 86400)}d আগে`;
}

// Notification type → icon/color
const NOTIF_STYLE = {
    NEW_TICKET:    { icon: '🎫', color: 'bg-orange-100 text-[#f97316]' },
    TICKET_REPLY:  { icon: '💬', color: 'bg-blue-100 text-blue-600'   },
    TICKET_RESOLVED:{ icon: '✅', color: 'bg-green-100 text-green-600' },
    TICKET_REOPENED:{ icon: '🔄', color: 'bg-purple-100 text-purple-600' },
    QA_ANSWERED:   { icon: '💡', color: 'bg-amber-100 text-amber-600'  },
    QA_BEST_ANSWER:{ icon: '🏆', color: 'bg-yellow-100 text-yellow-700'},
    RATING_RECEIVED:{ icon: '⭐', color: 'bg-amber-100 text-amber-700' },
};

export default function NotificationBell() {
    const [open, setOpen]             = useState(false);
    const [notifications, setNotifs]  = useState([]);
    const [unread, setUnread]         = useState(0);
    const [loading, setLoading]       = useState(false);
    const dropRef = useRef(null);

    // Polling — প্রতি ৩০ সেকেন্ডে নতুন notification চেক করো
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Dropdown বাইরে click করলে বন্ধ হবে
    useEffect(() => {
        function handle(e) {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    async function fetchNotifications() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('AuthToken') : null;
        if (!token) return;
        try {
            const res  = await fetch(`${API_BASE}/api/support/notifications`, { headers: authHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            setNotifs(data.notifications || []);
            setUnread(data.unreadCount  || 0);
        } catch { /* silent */ }
    }

    async function markAllRead() {
        try {
            await fetch(`${API_BASE}/api/support/notifications/read-all`, { method: 'PATCH', headers: authHeaders() });
            setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnread(0);
        } catch { /* silent */ }
    }

    async function markOneRead(id) {
        try {
            await fetch(`${API_BASE}/api/support/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() });
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    }

    function handleBellClick() {
        setOpen(o => !o);
    }

    return (
        <div ref={dropRef} className="relative">

            {/* ── Bell button ── */}
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-xl text-orange-400 hover:text-[#f97316] hover:bg-orange-50 transition"
                title="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-orange-100 z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50 bg-orange-50/40">
                        <span className="font-bold text-gray-800 text-sm">
                            Notifications
                            {unread > 0 && <span className="ml-2 text-xs bg-[#f97316] text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
                        </span>
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-orange-500 hover:text-[#f97316] font-medium transition"
                            >
                                সব পড়া হয়েছে
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-3xl mb-2">🔔</div>
                                <p className="text-sm text-gray-400">কোনো notification নেই</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const style = NOTIF_STYLE[n.type] || { icon: '📢', color: 'bg-gray-100 text-gray-600' };
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-orange-50 last:border-0 hover:bg-orange-50/30 transition cursor-pointer ${!n.isRead ? 'bg-orange-50/50' : ''}`}
                                        onClick={() => {
                                            if (!n.isRead) markOneRead(n.id);
                                            if (n.link) window.location.href = n.link;
                                            setOpen(false);
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${style.color}`}>
                                            {style.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-xs text-orange-400 mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>

                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <span className="w-2 h-2 bg-[#f97316] rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-orange-50 bg-orange-50/20 text-center">
                            <button
                                onClick={async () => {
                                    await fetch(`${API_BASE}/api/support/notifications/clear`, { method: 'DELETE', headers: authHeaders() });
                                    setNotifs([]); setUnread(0);
                                }}
                                className="text-xs text-gray-400 hover:text-red-500 transition"
                            >
                                সব মুছে ফেলুন
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}