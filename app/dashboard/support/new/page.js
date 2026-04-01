'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, authHeaders } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

const CATEGORIES = [
    { val: 'TECHNICAL', label: 'Technical সমস্যা',  desc: 'ভিডিও, login ইত্যাদি' },
    { val: 'BILLING',   label: 'Payment / Billing',  desc: 'Payment, refund'       },
    { val: 'CONTENT',   label: 'Course Content',     desc: 'Course নিয়ে প্রশ্ন'   },
    { val: 'GENERAL',   label: 'সাধারণ প্রশ্ন',     desc: 'যেকোনো বিষয়'          },
    { val: 'OTHER',     label: 'অন্যান্য',           desc: 'অন্য বিষয়'            },
];

const PRIORITIES = [
    { val: 'LOW',    label: 'কম',      desc: '৪৮ ঘন্টা', color: 'border-gray-200   text-gray-600'   },
    { val: 'MEDIUM', label: 'মাঝারি', desc: '২৪ ঘন্টা', color: 'border-yellow-300 text-yellow-700' },
    { val: 'HIGH',   label: 'বেশি',   desc: '৮ ঘন্টা',  color: 'border-orange-300 text-orange-600' },
    { val: 'URGENT', label: 'জরুরি',  desc: '২ ঘন্টা',  color: 'border-red-300    text-red-600'    },
];

export default function NewTicketPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    // Admin এর এই page দরকার নেই — dashboard এ পাঠাও
    useEffect(() => {
        if (!authLoading && isAdmin) router.replace('/dashboard/support');
    }, [authLoading, isAdmin]);

    const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', courseId: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [courses, setCourses]         = useState([]);

    useEffect(() => {
        if (authLoading || isAdmin) return;
        async function loadCourses() {
            try {
                const res  = await fetch(`${API_BASE}/api/course/enrolled`, { headers: authHeaders() });
                const data = await res.json();
                setCourses(data.courses || data.content || []);
            } catch { /* silent */ }
        }
        loadCourses();
    }, [authLoading]);

    // KB suggestions debounce
    useEffect(() => {
        if (form.title.length < 5) { setSuggestions([]); return; }
        const t = setTimeout(async () => {
            try {
                const res  = await fetch(`${API_BASE}/api/support/kb/search?q=${encodeURIComponent(form.title)}`);
                const data = await res.json();
                setSuggestions(data.articles || []);
            } catch { /* silent */ }
        }, 500);
        return () => clearTimeout(t);
    }, [form.title]);

    function update(key, val) { setForm(p => ({...p, [key]: val})); if (error) setError(''); }

    async function handleSubmit() {
        if (!form.title.trim())       return setError('শিরোনাম দিন');
        if (!form.description.trim()) return setError('বিস্তারিত লিখুন');
        setSubmitting(true); setError('');
        try {
            const res  = await fetch(`${API_BASE}/api/support/tickets`, {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ ...form, courseId: form.courseId ? parseInt(form.courseId) : undefined }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'কিছু একটা সমস্যা হয়েছে');
            router.push(`/dashboard/support/${data.ticket.id}`);
        } catch { setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।'); }
        finally { setSubmitting(false); }
    }

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin"/></div>;

    return (
        <div className="min-h-screen bg-orange-50/30">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <nav className="flex items-center gap-2 text-sm text-orange-400 mb-8">
                    <Link href="/dashboard/support" className="hover:text-[#f97316]">সাপোর্ট</Link>
                    <span>/</span>
                    <span className="text-orange-700 font-medium">নতুন টিকেট</span>
                </nav>

                <h1 className="text-2xl font-extrabold text-orange-900 mb-2">নতুন সাপোর্ট টিকেট</h1>
                <p className="text-orange-400 text-sm mb-8">সমস্যাটি বিস্তারিত লিখুন, দ্রুত সাহায্য পাবেন</p>

                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">শিরোনাম <span className="text-red-400">*</span></label>
                        <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                            placeholder="সমস্যাটি সংক্ষেপে লিখুন..."
                            className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] text-gray-700 placeholder-gray-400"
                            disabled={submitting}/>
                        {suggestions.length > 0 && (
                            <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl p-3">
                                <p className="text-xs font-semibold text-orange-600 mb-2">এই article গুলো সাহায্য করতে পারে:</p>
                                <ul className="space-y-1">
                                    {suggestions.map(a => (
                                        <li key={a.id}>
                                            <Link href={`/dashboard/support/help/${a.slug}`} target="_blank" className="text-sm text-[#f97316] hover:underline block truncate">→ {a.title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ক্যাটাগরি <span className="text-red-400">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {CATEGORIES.map(c => (
                                <button key={c.val} type="button" onClick={() => update('category', c.val)}
                                    className={`p-3 rounded-xl border text-left transition ${form.category === c.val ? 'border-[#f97316] bg-orange-50 ring-1 ring-[#f97316]/30' : 'border-orange-100 hover:border-orange-300'}`}>
                                    <div className={`text-sm font-semibold ${form.category === c.val ? 'text-[#f97316]' : 'text-gray-700'}`}>{c.label}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PRIORITIES.map(p => (
                                <button key={p.val} type="button" onClick={() => update('priority', p.val)}
                                    className={`p-3 rounded-xl border text-left transition ${form.priority === p.val ? 'border-[#f97316] bg-orange-50' : `${p.color.split(' ')[0]} hover:bg-orange-50`}`}>
                                    <div className={`text-sm font-bold ${form.priority === p.val ? 'text-[#f97316]' : p.color.split(' ')[1]}`}>{p.label}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course */}
                    {courses.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course <span className="text-gray-400 font-normal">(optional)</span></label>
                            <select value={form.courseId} onChange={e => update('courseId', e.target.value)}
                                className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 text-gray-700 bg-white" disabled={submitting}>
                                <option value="">Course নির্বাচন করুন</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিস্তারিত <span className="text-red-400">*</span></label>
                        <textarea rows={6} value={form.description} onChange={e => update('description', e.target.value)}
                            placeholder="সমস্যাটি বিস্তারিত লিখুন..."
                            className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] text-gray-700 placeholder-gray-400 resize-none"
                            disabled={submitting}/>
                    </div>

                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                        {submitting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>পাঠানো হচ্ছে...</> : 'টিকেট পাঠান'}
                    </button>
                </div>
            </div>
        </div>
    );
}