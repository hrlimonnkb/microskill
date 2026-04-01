'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function getImageSrc(image) {
    if (!image) return null;
    return image.startsWith('http') ? image : `${API_BASE}/${image.replace(/^\//, '')}`;
}

function getScrollParent(el) {
    if (!el || el === document.body) return window;
    const { overflow, overflowY } = getComputedStyle(el);
    if (/auto|scroll/.test(overflow) || /auto|scroll/.test(overflowY)) return el;
    return getScrollParent(el.parentElement);
}

function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) { console.warn('[TOC] Element not found:', id); return; }
    const OFFSET = 100;
    const container = getScrollParent(el.parentElement);
    if (container === window) {
        const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
    } else {
        let offsetTop = 0;
        let node = el;
        while (node && node !== container) {
            offsetTop += node.offsetTop;
            node = node.offsetParent;
        }
        container.scrollTo({ top: offsetTop - OFFSET, behavior: 'smooth' });
    }
}

function injectHeadingIds(html) {
    if (!html) return { html: '', headings: [] };
    const headings = [];
    let index = 0;
    const result = html.replace(/<(h[1-4])(\s[^>]*)?>([\s\S]*?)<\/h[1-4]>/gi, (match, tag, attrs = '', inner) => {
        const id = `toc-heading-${index}`;
        const text = inner.replace(/<[^>]+>/g, '').trim();
        headings.push({ id, text, tag: tag.toUpperCase() });
        index++;
        return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    });
    return { html: result, headings };
}

function TableOfContents({ headings }) {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (!headings || headings.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '0% 0% -75% 0%' }
        );
        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });
        return () => {
            headings.forEach((h) => {
                const el = document.getElementById(h.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [headings]);

    if (!headings || headings.length === 0) return null;

    function handleScroll(id) {
        setActiveId(id);
        const el = document.getElementById(id);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block"></span>
                <h3 className="font-bold text-slate-800 text-sm">Table of Contents</h3>
            </div>
            <nav className="p-3">
                <ul className="space-y-1">
                    {headings.map(h => {
                        const isActive = activeId === h.id;
                        return (
                            <li key={h.id}>
                                <button
                                    onClick={() => handleScroll(h.id)}
                                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                                        h.tag === 'H3' ? 'pl-6' : ''
                                    } ${
                                        isActive
                                            ? 'bg-orange-50 text-orange-500 font-semibold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors ${
                                        isActive ? 'bg-orange-500' : 'bg-slate-300'
                                    }`} />
                                    <span className="leading-snug">{h.text}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

function ShareSection({ title }) {
    const [copied, setCopied] = useState(false);

    function getUrl() {
        return typeof window !== 'undefined' ? window.location.href : '';
    }

    function copyLink() {
        navigator.clipboard.writeText(getUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const shares = [
        {
            label: 'Facebook',
            color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`, '_blank'),
        },
        {
            label: 'Twitter',
            color: 'hover:bg-sky-500 hover:text-white hover:border-sky-500',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
            onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(title)}`, '_blank'),
        },
        {
            label: 'LinkedIn',
            color: 'hover:bg-blue-700 hover:text-white hover:border-blue-700',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
            onClick: () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(getUrl())}&title=${encodeURIComponent(title)}`, '_blank'),
        },
        {
            label: 'WhatsApp',
            color: 'hover:bg-green-500 hover:text-white hover:border-green-500',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + getUrl())}`, '_blank'),
        },
        {
            label: 'Telegram',
            color: 'hover:bg-sky-400 hover:text-white hover:border-sky-400',
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
            onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(title)}`, '_blank'),
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block"></span>
                <h3 className="font-bold text-slate-800 text-sm">Share This Post</h3>
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    {shares.map(s => (
                        <button key={s.label} onClick={s.onClick} title={s.label}
                            className={`w-9 h-9 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center transition-all duration-200 ${s.color}`}>
                            {s.icon}
                        </button>
                    ))}
                </div>
                <button onClick={copyLink}
                    className="mt-3 w-full py-2 rounded-lg border border-slate-200 text-xs text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-all duration-200 flex items-center justify-center gap-1.5">
                    {copied ? (
                        <><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span className="text-green-500">Copied!</span></>
                    ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy Link</>
                    )}
                </button>
            </div>
        </div>
    );
}

function NewsletterWidget() {
    const [email, setEmail]   = useState('');
    const [status, setStatus] = useState('idle');

    async function handleSubmit() {
        if (!email || !email.includes('@')) { setStatus('error'); setTimeout(() => setStatus('idle'), 2000); return; }
        setStatus('loading');
        await new Promise(r => setTimeout(r, 1000));
        setStatus('success');
    }

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-lg text-white">
            <div className="p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-center mb-1">Join With Me</h3>
                <p className="text-blue-200 text-xs text-center mb-5">Subscribe For The Latest Updates</p>
                {status === 'success' ? (
                    <div className="text-center py-4">
                        <div className="text-3xl mb-2">🎉</div>
                        <p className="text-sm font-semibold">You are subscribed!</p>
                        <p className="text-blue-200 text-xs mt-1">Thanks for joining.</p>
                    </div>
                ) : (
                    <>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="Enter your email here..."
                            className={`w-full px-4 py-2.5 rounded-lg bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-3 ${status === 'error' ? 'ring-2 ring-red-400' : ''}`}
                        />
                        <button onClick={handleSubmit} disabled={status === 'loading'}
                            className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide uppercase transition-all duration-200 disabled:opacity-70 shadow-md">
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    Subscribing...
                                </span>
                            ) : 'SUBMIT'}
                        </button>
                        {status === 'error' && <p className="text-red-300 text-xs text-center mt-2">Please enter a valid email.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function AvatarInitials({ name, size = 'md' }) {
    const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const colors = ['bg-orange-400', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
    const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-slate-400';
    const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return (
        <div className={`${dim} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
}

function CommentItem({ comment, postId, onReplySuccess }) {
    const [showReply, setShowReply] = useState(false);
    return (
        <div className="group">
            <div className="flex gap-3">
                <AvatarInitials name={comment.authorName} />
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-slate-800 text-sm">{comment.authorName}</span>
                            {comment.authorWebsite && (
                                <a href={comment.authorWebsite} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-orange-500 hover:underline">🔗 Website</a>
                            )}
                            <span className="text-slate-400 text-xs ml-auto">{formatDateShort(comment.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
                    </div>
                    <button onClick={() => setShowReply(v => !v)}
                        className="mt-1 ml-2 text-xs text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                        Reply
                    </button>
                    {showReply && (
                        <div className="mt-3 ml-2">
                            <CommentForm postId={postId} parentId={comment.id}
                                onSuccess={() => { setShowReply(false); onReplySuccess(); }} compact />
                        </div>
                    )}
                    {comment.replies?.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-2 border-slate-100 pl-4">
                            {comment.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                    <AvatarInitials name={reply.authorName} size="sm" />
                                    <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-slate-800 text-xs">{reply.authorName}</span>
                                            <span className="text-slate-400 text-xs ml-auto">{formatDateShort(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getLoggedInUser() {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken'); // ✅ lowercase 'authToken'
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) return null;
        return {
            name:  payload.name  || payload.fullName || payload.username || '',
            email: payload.email || '',
            token,
        };
    } catch {
        return null;
    }
}

// ── Comment Form ──────────────────────────────────────────────
function CommentForm({ postId, parentId = null, onSuccess, compact = false }) {
  const {user}=useAuth()
    const [content, setContent]   = useState('');
    const [status, setStatus]     = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    

    async function handleSubmit(e) {
        e.preventDefault();

        // Validate all required fields before sending
        if (!content.trim())  { setErrorMsg('কমেন্ট লিখুন।'); return; }
        if (!postId)           { setErrorMsg('Post ID পাওয়া যায়নি।'); return; }
        if (!user?.name)       { setErrorMsg('নাম পাওয়া যায়নি — আবার লগইন করুন।'); return; }
        if (!user?.email)      { setErrorMsg('ইমেইল পাওয়া যায়নি — আবার লগইন করুন।'); return; }

        setStatus('loading');
        setErrorMsg('');
        try {
            const body = {
                postId,
                content:     content.trim(),
                authorName:  user.name,
                authorEmail: user.email,
            };
            if (parentId) body.parentId = parentId; // only include if set

            const res  = await fetch(`${API_BASE}/api/post/comment`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Server error');
            setStatus('success');
            setContent('');
            onSuccess?.();
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message);
            setTimeout(() => setStatus('idle'), 3000);
        }
    }

    // Auth still loading — show placeholder
    if (user === undefined) {
        return <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />;
    }

    // Not logged in
    if (user === null) {
        return (
            <div className={`flex items-center gap-3 ${compact
                ? 'bg-slate-50 rounded-lg px-4 py-3'
                : 'bg-amber-50 border border-amber-200 rounded-xl px-5 py-4'}`}>
                <svg className={`flex-shrink-0 ${compact ? 'w-4 h-4 text-slate-400' : 'w-5 h-5 text-amber-500'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <div className="flex-1">
                    <p className={`font-semibold ${compact ? 'text-slate-600 text-xs' : 'text-amber-800 text-sm'}`}>
                        {compact ? 'রিপ্লাই করতে লগইন করুন' : 'কমেন্ট করতে লগইন করুন'}
                    </p>
                    {!compact && (
                        <p className="text-amber-600 text-xs mt-0.5">শুধুমাত্র লগইন করা ব্যবহারকারীরা মন্তব্য করতে পারবেন।</p>
                    )}
                </div>
                <Link href="/login"
                    className={`flex-shrink-0 font-bold transition-all ${compact
                        ? 'text-xs text-orange-500 hover:underline'
                        : 'px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs'}`}>
                    লগইন
                </Link>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <p className="text-emerald-700 font-semibold text-sm">কমেন্ট পাঠানো হয়েছে!</p>
               
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Logged-in user info (read-only) */}
            {user && (
                <div className={`flex items-center gap-3 ${compact ? 'mb-2' : 'bg-slate-50 rounded-xl px-4 py-2.5 mb-1'}`}>
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-700">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                </div>
            )}

            <textarea
                value={content}
                onChange={e => { setContent(e.target.value); if (errorMsg) setErrorMsg(''); }}
                placeholder={compact ? 'রিপ্লাই লিখুন...' : 'আপনার মন্তব্য লিখুন...'}
                rows={compact ? 2 : 4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
            />

            {errorMsg && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    {errorMsg}
                </p>
            )}

            <div className="flex items-center gap-3">
                <button type="submit" disabled={status === 'loading'}
                    className={`${compact ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm'} bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center gap-2`}>
                    {status === 'loading' ? (
                        <>
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            পাঠানো হচ্ছে...
                        </>
                    ) : compact ? 'রিপ্লাই করুন' : 'কমেন্ট করুন'}
                </button>
               
            </div>
        </form>
    );
}

function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [total, setTotal]       = useState(0);
    const [loading, setLoading]   = useState(true);

    async function fetchComments() {
        try {
            const res  = await fetch(`${API_BASE}/api/post/comment/post/${postId}`);
            const data = await res.json();
            setComments(data.comments || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error('Comment fetch error:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchComments(); }, [postId]);

    return (
        <div className="mt-12 pt-10 border-t-2 border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                মন্তব্য
                {total > 0 && <span className="text-sm font-normal text-slate-400 ml-1">({total}টি)</span>}
            </h2>
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                    <span className="w-1 h-4 bg-orange-500 rounded-full inline-block"></span>
                    মন্তব্য করুন
                </h3>
                <CommentForm postId={postId} onSuccess={fetchComments} />
            </div>
            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                                <div className="h-16 bg-slate-100 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} postId={postId} onReplySuccess={fetchComments} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function BlogPostClient({ post }) {
    const { html: processedContent, headings } = injectHeadingIds(post.content);
    const contentRef = useRef(null);
    const imgSrc = getImageSrc(post.featuredImage);
    const authorAvatar = post.author?.avatar ? getImageSrc(post.author.avatar) : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-orange-50 to-violet-100 pb-12 pt-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative max-w-4xl mx-auto px-5 text-center">
                    {post.category && (
                        <Link href={`/blog?category=${post.category.slug}`}
                            className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-200 mb-5 hover:bg-orange-50 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                            </svg>
                            {post.category.name}
                        </Link>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs">By</span>
                            <div className="flex items-center gap-2">
                                {authorAvatar ? (
                                    <img src={authorAvatar} alt={post.author?.name} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold border-2 border-white shadow">
                                        {post.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                )}
                                <span className="font-semibold text-slate-700">{post.author?.name || 'Admin'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {imgSrc && (
                <div className="max-w-5xl mx-auto px-5 -mt-6 mb-0 relative z-10">
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-white h-72 sm:h-96">
                        <img src={imgSrc} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-5 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-8 items-start">
                    <aside className="hidden lg:flex flex-col gap-5 sticky top-6 self-start">
                        <TableOfContents headings={headings} />
                        <ShareSection title={post.title} />
                    </aside>
                    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 min-w-0">
                        {post.excerpt && (
                            <p className="text-slate-600 text-base leading-relaxed mb-8 pb-8 border-b border-slate-100 font-medium">
                                {post.excerpt}
                            </p>
                        )}
                        <div ref={contentRef} className="blog-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
                        <CommentSection postId={post.id} />
                        <div className="mt-8 lg:hidden">
                            <ShareSection title={post.title} />
                        </div>
                    </article>
                    <aside className="hidden lg:block sticky top-6 self-start">
                        <NewsletterWidget />
                    </aside>
                </div>
            </div>

            <style jsx global>{`
                html { scroll-behavior: smooth; }
                .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4 { scroll-margin-top: 100px; }
                .blog-content { color: #374151; font-size: 1rem; line-height: 1.8; font-family: Georgia, 'Times New Roman', serif; }
                .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4 { font-family: system-ui,-apple-system,sans-serif; font-weight: 800; color: #1e293b; margin-top: 2em; margin-bottom: 0.6em; line-height: 1.25; scroll-margin-top: 80px; }
                .blog-content h1 { font-size: 1.9rem; }
                .blog-content h2 { font-size: 1.5rem; color: #1e3a5f; border-bottom: 3px solid #f97316; padding-bottom: 0.35em; display: inline-block; }
                .blog-content h3 { font-size: 1.2rem; color: #1e3a5f; }
                .blog-content p  { margin-bottom: 1.4em; }
                .blog-content a  { color: #f97316; text-decoration: underline; }
                .blog-content a:hover { color: #ea580c; }
                .blog-content ul,.blog-content ol { margin: 1.2em 0 1.4em 0; padding-left: 0; list-style: none; }
                .blog-content ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.6em; }
                .blog-content ul li::before { content: ''; position: absolute; left: 0; top: 0.35em; bottom: 0.2em; width: 4px; background: #f97316; border-radius: 2px; }
                .blog-content ol { counter-reset: li; }
                .blog-content ol li { position: relative; padding-left: 2rem; margin-bottom: 0.6em; counter-increment: li; }
                .blog-content ol li::before { content: counter(li); position: absolute; left: 0; top: 0; width: 1.4rem; height: 1.4rem; background: #f97316; color: white; font-size: 0.75rem; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 0.15em; }
                .blog-content blockquote { border-left: 4px solid #f97316; background: #fff7ed; margin: 1.5em 0; padding: 1em 1.5em; border-radius: 0 0.75rem 0.75rem 0; color: #92400e; font-style: italic; }
                .blog-content img { max-width: 100%; border-radius: 0.75rem; margin: 1.5em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .blog-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9rem; font-family: system-ui,sans-serif; }
                .blog-content th { background: #1e3a5f; color: white; padding: 0.75em 1em; text-align: left; font-weight: 700; }
                .blog-content td { padding: 0.65em 1em; border-bottom: 1px solid #e2e8f0; color: #475569; }
                .blog-content tr:nth-child(even) td { background: #f8fafc; }
                .blog-content code { background: #f1f5f9; color: #e11d48; padding: 0.15em 0.4em; border-radius: 0.3em; font-size: 0.875em; font-family: 'Courier New',monospace; }
                .blog-content pre { background: #0f172a; color: #e2e8f0; padding: 1.25em 1.5em; border-radius: 0.75rem; overflow-x: auto; margin: 1.5em 0; font-size: 0.875rem; line-height: 1.7; }
                .blog-content pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
                .blog-content hr { border: none; border-top: 2px solid #f1f5f9; margin: 2em 0; }
            `}</style>
        </div>
    );
}