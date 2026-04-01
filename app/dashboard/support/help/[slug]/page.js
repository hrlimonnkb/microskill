'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, authHeaders } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';
const EMPTY_FORM = { title: '', excerpt: '', content: '', categoryId: '', isPublished: false };

// ═══════════════════════════════════════════════════════════════
export default function KBPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin"/></div>;

    return isAdmin ? <AdminKBView /> : <StudentKBView />;
}

// ───────────────────────────────────────────────────────────────
// ADMIN — CRUD
// ───────────────────────────────────────────────────────────────
function AdminKBView() {
    const [articles, setArticles]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showForm, setShowForm]     = useState(false);
    const [editId, setEditId]         = useState(null);
    const [form, setForm]             = useState(EMPTY_FORM);
    const [saving, setSaving]         = useState(false);
    const [formErr, setFormErr]       = useState('');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/support/kb?limit=100`);
            const data = await res.json();
            setArticles(data.articles || []);
            setCategories(data.categories || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }

    function openCreate() { setEditId(null); setForm(EMPTY_FORM); setFormErr(''); setShowForm(true); }
    function openEdit(a)  { setEditId(a.id); setForm({ title: a.title, excerpt: a.excerpt || '', content: a.content, categoryId: String(a.categoryId), isPublished: a.isPublished }); setFormErr(''); setShowForm(true); }

    async function save() {
        if (!form.title.trim())   return setFormErr('Title দিন');
        if (!form.content.trim()) return setFormErr('Content লিখুন');
        if (!form.categoryId)     return setFormErr('Category বেছে নিন');
        setSaving(true); setFormErr('');
        try {
            const url    = editId ? `${API_BASE}/api/support/kb/${editId}` : `${API_BASE}/api/support/kb`;
            const method = editId ? 'PUT' : 'POST';
            const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
            const data   = await res.json();
            if (!res.ok) return setFormErr(data.message || 'সমস্যা হয়েছে');
            setShowForm(false); fetchData();
        } catch { setFormErr('নেটওয়ার্ক সমস্যা'); }
        finally { setSaving(false); }
    }

    async function del(id) {
        if (!confirm('মুছে ফেলবেন?')) return;
        await fetch(`${API_BASE}/api/support/kb/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchData();
    }

    async function togglePublish(a) {
        await fetch(`${API_BASE}/api/support/kb/${a.id}`, {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ isPublished: !a.isPublished }),
        });
        fetchData();
    }

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-orange-900">Knowledge Base</h1>
                        <p className="text-orange-400 text-sm mt-1">Self-service help articles পরিচালনা করুন</p>
                    </div>
                    <button onClick={openCreate} className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-bold rounded-xl hover:opacity-90 transition">+ নতুন Article</button>
                </div>

                <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-orange-50/60 border-b border-orange-100">
                                {['Article','Category','Views','Helpful','Status','কাজ'].map(h => (
                                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase ${['Views','Helpful'].includes(h) ? 'hidden sm:table-cell' : ''} ${['Category'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_,i) => <tr key={i} className="border-t border-orange-50 animate-pulse">{[...Array(6)].map((_,j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-orange-50 rounded"/></td>)}</tr>)
                            ) : articles.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">কোনো article নেই</td></tr>
                            ) : articles.map(a => (
                                <tr key={a.id} className="border-t border-orange-50 hover:bg-orange-50/30 transition">
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-gray-800 max-w-xs truncate">{a.title}</div>
                                        {a.excerpt && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.excerpt}</div>}
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell"><span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{a.category?.name}</span></td>
                                    <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-500">{a.viewCount}</td>
                                    <td className="px-4 py-4 hidden sm:table-cell text-xs"><span className="text-green-600 font-medium">{a.helpfulYes}✓</span> <span className="text-gray-400">{a.helpfulNo}✗</span></td>
                                    <td className="px-4 py-4">
                                        <button onClick={() => togglePublish(a)} className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${a.isPublished ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {a.isPublished ? 'Published' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(a)} className="px-3 py-1.5 text-xs border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition">Edit</button>
                                            <button onClick={() => del(a.id)} className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Form modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-800">{editId ? 'Article Edit' : 'নতুন Article'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                            {formErr && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{formErr}</div>}
                            <div className="space-y-4">
                                {[['Title *','title','text'],['Excerpt','excerpt','text']].map(([label, key, type]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                                        <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                                            className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30"/>
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                                    <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none bg-white text-gray-700">
                                        <option value="">Category বেছে নিন</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Content * <span className="text-xs text-gray-400 font-normal">(HTML)</span></label>
                                    <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={10}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-y font-mono"/>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="pub" checked={form.isPublished} onChange={e => setForm(p => ({...p, isPublished: e.target.checked}))} className="accent-[#f97316] w-4 h-4"/>
                                    <label htmlFor="pub" className="text-sm font-medium text-gray-700">Published</label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={save} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                                    {saving ? 'সেভ হচ্ছে...' : editId ? 'Update করুন' : 'তৈরি করুন'}
                                </button>
                                <button onClick={() => setShowForm(false)} className="px-5 py-3 border border-orange-200 text-gray-600 rounded-xl hover:bg-orange-50 transition">বাতিল</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────
// STUDENT — Browse
// ───────────────────────────────────────────────────────────────
function StudentKBView() {
    const [articles, setArticles]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [catFilter, setCatFilter]   = useState('');
    const [search, setSearch]         = useState('');
    const [inputVal, setInputVal]     = useState('');

    useEffect(() => { fetchData(); }, [catFilter, search]);

    useEffect(() => {
        const t = setTimeout(() => setSearch(inputVal), 400);
        return () => clearTimeout(t);
    }, [inputVal]);

    async function fetchData() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 20 });
            if (catFilter) params.set('categoryId', catFilter);
            if (search)    params.set('search', search);
            const res  = await fetch(`${API_BASE}/api/support/kb?${params}`);
            const data = await res.json();
            setArticles(data.articles || []);
            setCategories(data.categories || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen bg-orange-50/30">
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Hero */}
                <div className="bg-gradient-to-r from-[#f97316] to-[#fb8a3c] rounded-3xl p-10 text-white text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2">Help Center</h1>
                    <p className="text-orange-100 mb-6">আপনার সমস্যার সমাধান নিজেই খুঁজুন</p>
                    <div className="relative max-w-md mx-auto">
                        <input value={inputVal} onChange={e => setInputVal(e.target.value)} type="text"
                            placeholder="সমস্যা লিখে খুঁজুন..."
                            className="w-full px-5 py-3.5 pr-12 rounded-2xl text-gray-700 focus:outline-none text-sm shadow-lg"/>
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button onClick={() => setCatFilter('')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!catFilter ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316]'}`}>সব</button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setCatFilter(String(cat.id))}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${catFilter === String(cat.id) ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316]'}`}>
                            {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
                        </button>
                    ))}
                </div>

                {/* Articles */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-2xl border border-orange-100 p-5 animate-pulse h-28"/>)}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
                        <p className="text-gray-400 mb-4">কোনো article পাওয়া যায়নি</p>
                        <Link href="/dashboard/support/new" className="text-[#f97316] text-sm font-medium hover:underline">টিকেট খুলুন →</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {articles.map(a => (
                            <Link key={a.id} href={`/dashboard/support/help/${a.slug}`}>
                                <div className="bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                                    <h3 className="font-bold text-gray-800 leading-snug mb-2">{a.title}</h3>
                                    {a.excerpt && <p className="text-gray-500 text-sm line-clamp-2 flex-1 mb-3">{a.excerpt}</p>}
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{a.category?.name}</span>
                                        <span>{a.viewCount} বার পড়া হয়েছে</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-orange-100 p-8 text-center">
                    <h3 className="font-bold text-gray-800 mb-2">সমাধান পাননি?</h3>
                    <p className="text-gray-500 text-sm mb-4">আমাদের সাপোর্ট টিম সাহায্য করতে প্রস্তুত</p>
                    <Link href="/dashboard/support/new" className="inline-flex px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-semibold rounded-xl hover:opacity-90 transition text-sm">
                        সাপোর্ট টিকেট খুলুন →
                    </Link>
                </div>
            </div>
        </div>
    );
}