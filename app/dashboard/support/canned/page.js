'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';
function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}

const EMPTY_FORM = { title: '', excerpt: '', content: '', categoryId: '', isPublished: false };

export default function KBManagePage() {
    const router = useRouter();
    const [articles, setArticles]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [authOk, setAuthOk]         = useState(false);

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId]     = useState(null);
    const [form, setForm]         = useState(EMPTY_FORM);
    const [saving, setSaving]     = useState(false);
    const [formErr, setFormErr]   = useState('');

    useEffect(() => {
        try {
            const t = localStorage.getItem('authToken');
            if (!t) { router.replace('/'); return; }
            const p = JSON.parse(atob(t.split('.')[1]));
            if (p?.role?.toUpperCase() !== 'ADMIN') { router.replace('/'); return; }
            setAuthOk(true);
        } catch { router.replace('/'); }
    }, []);

    useEffect(() => { if (authOk) fetchData(); }, [authOk]);

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

    function openEdit(a) {
        setEditId(a.id);
        setForm({ title: a.title, excerpt: a.excerpt || '', content: a.content, categoryId: a.categoryId, isPublished: a.isPublished });
        setFormErr('');
        setShowForm(true);
    }

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
            setShowForm(false);
            fetchData();
        } catch { setFormErr('নেটওয়ার্ক সমস্যা'); }
        finally { setSaving(false); }
    }

    async function deleteArticle(id) {
        if (!confirm('এই article টি মুছে ফেলবেন?')) return;
        await fetch(`${API_BASE}/api/support/kb/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchData();
    }

    async function togglePublish(a) {
        await fetch(`${API_BASE}/api/support/kb/${a.id}`, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ isPublished: !a.isPublished }),
        });
        fetchData();
    }

    if (!authOk) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-orange-900">Knowledge Base</h1>
                        <p className="text-orange-400 text-sm mt-1">Self-service help articles পরিচালনা করুন</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-bold rounded-xl hover:opacity-90 transition"
                    >
                        + নতুন Article
                    </button>
                </div>

                {/* Article list */}
                <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-orange-50/60 border-b border-orange-100">
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase">Article</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase hidden md:table-cell">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase hidden sm:table-cell">Views</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase hidden sm:table-cell">Helpful</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase">কাজ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-t border-orange-50 animate-pulse">
                                        {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-orange-50 rounded" /></td>)}
                                    </tr>
                                ))
                            ) : articles.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">কোনো article নেই</td></tr>
                            ) : (
                                articles.map(a => (
                                    <tr key={a.id} className="border-t border-orange-50 hover:bg-orange-50/30 transition">
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-gray-800 max-w-xs truncate">{a.title}</div>
                                            {a.excerpt && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.excerpt}</div>}
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{a.category?.name}</span>
                                        </td>
                                        <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-500">{a.viewCount}</td>
                                        <td className="px-4 py-4 hidden sm:table-cell text-xs">
                                            <span className="text-green-600 font-medium">{a.helpfulYes}✓</span>
                                            <span className="text-gray-400 ml-1">{a.helpfulNo}✗</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => togglePublish(a)} className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${a.isPublished ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                                {a.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(a)} className="px-3 py-1.5 text-xs border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition">Edit</button>
                                                <button onClick={() => deleteArticle(a.id)} className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Form Modal ── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-800">{editId ? 'Article Edit' : 'নতুন Article'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>

                            {formErr && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{formErr}</div>}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                    <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" placeholder="Article এর শিরোনাম"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                                    <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none bg-white text-gray-700">
                                        <option value="">Category বেছে নিন</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt</label>
                                    <textarea value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt: e.target.value}))} rows={2}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-none" placeholder="সংক্ষিপ্ত বিবরণ"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Content * <span className="text-xs text-gray-400 font-normal">(HTML বা plain text)</span></label>
                                    <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={10}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-y font-mono" placeholder="Article এর বিস্তারিত লিখুন..."/>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="pub" checked={form.isPublished} onChange={e => setForm(p => ({...p, isPublished: e.target.checked}))} className="accent-[#f97316] w-4 h-4"/>
                                    <label htmlFor="pub" className="text-sm font-medium text-gray-700">Published (সবাই দেখতে পাবে)</label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={save} disabled={saving}
                                    className="flex-1 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                                    {saving ? 'সেভ হচ্ছে...' : editId ? 'Update করুন' : 'তৈরি করুন'}
                                </button>
                                <button onClick={() => setShowForm(false)} className="px-5 py-3 border border-orange-200 text-gray-600 rounded-xl hover:bg-orange-50 transition">
                                    বাতিল
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}