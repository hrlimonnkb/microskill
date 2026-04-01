'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';
function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}

const CATS = ['TECHNICAL','BILLING','CONTENT','GENERAL','OTHER'];

export default function CannedResponsesPage() {
    const router = useRouter();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [authOk, setAuthOk]       = useState(false);
    const [catFilter, setCatFilter] = useState('');

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId]     = useState(null);
    const [form, setForm]         = useState({ title: '', content: '', category: 'GENERAL' });
    const [saving, setSaving]     = useState(false);
    const [err, setErr]           = useState('');

    useEffect(() => {
        try {
            const t = localStorage.getItem('authToken');
            if (!t) { router.replace('/'); return; }
            const p = JSON.parse(atob(t.split('.')[1]));
            if (p?.role?.toUpperCase() !== 'ADMIN') { router.replace('/'); return; }
            setAuthOk(true);
        } catch { router.replace('/'); }
    }, []);

    useEffect(() => { if (authOk) fetchData(); }, [authOk, catFilter]);

    async function fetchData() {
        setLoading(true);
        try {
            const params = catFilter ? `?category=${catFilter}` : '';
            const res  = await fetch(`${API_BASE}/api/support/canned${params}`, { headers: authHeaders() });
            const data = await res.json();
            setResponses(data.responses || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }

    function openCreate() { setEditId(null); setForm({ title: '', content: '', category: 'GENERAL' }); setErr(''); setShowForm(true); }
    function openEdit(r)  { setEditId(r.id); setForm({ title: r.title, content: r.content, category: r.category }); setErr(''); setShowForm(true); }

    async function save() {
        if (!form.title.trim())   return setErr('Title দিন');
        if (!form.content.trim()) return setErr('Content লিখুন');
        setSaving(true); setErr('');
        try {
            const url    = editId ? `${API_BASE}/api/support/canned/${editId}` : `${API_BASE}/api/support/canned`;
            const method = editId ? 'PUT' : 'POST';
            const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
            const data   = await res.json();
            if (!res.ok) return setErr(data.message || 'সমস্যা হয়েছে');
            setShowForm(false); fetchData();
        } catch { setErr('নেটওয়ার্ক সমস্যা'); }
        finally { setSaving(false); }
    }

    async function del(id) {
        if (!confirm('মুছে ফেলবেন?')) return;
        await fetch(`${API_BASE}/api/support/canned/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchData();
    }

    if (!authOk) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-orange-900">Canned Responses</h1>
                        <p className="text-orange-400 text-sm mt-1">Pre-written reply templates পরিচালনা করুন</p>
                    </div>
                    <button onClick={openCreate} className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white text-sm font-bold rounded-xl hover:opacity-90 transition">
                        + নতুন Template
                    </button>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['', ...CATS].map(c => (
                        <button key={c} onClick={() => setCatFilter(c)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                catFilter === c ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-gray-600 border-orange-200 hover:border-[#f97316]'
                            }`}>
                            {c || 'সব'}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-orange-100 p-5 animate-pulse">
                                <div className="h-4 bg-orange-50 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-orange-50 rounded w-full" />
                            </div>
                        ))
                    ) : responses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center text-gray-400">
                            কোনো template নেই। এখনই তৈরি করুন।
                        </div>
                    ) : (
                        responses.map(r => (
                            <div key={r.id} className="bg-white rounded-2xl border border-orange-100 p-5 hover:shadow-sm transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-800">{r.title}</h3>
                                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{r.category}</span>
                                            <span className="text-xs text-gray-400">{r.usageCount} বার ব্যবহার</span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{r.content}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition">Edit</button>
                                        <button onClick={() => del(r.id)} className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-800">{editId ? 'Template Edit' : 'নতুন Template'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                            {err && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{err}</div>}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                    <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" placeholder="Template এর নাম"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none bg-white text-gray-700">
                                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
                                    <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={6}
                                        className="w-full px-4 py-2.5 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 resize-none" placeholder="Reply এর content লিখুন..."/>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={save} disabled={saving}
                                    className="flex-1 py-3 bg-gradient-to-r from-[#f97316] to-[#fb8a3c] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
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