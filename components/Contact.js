'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import DynamicPageHeader from './DynamicPageHeader';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

export default function ContactPage() {
    const pageTitle = "যোগাযোগ করুন";
    const breadcrumbsList = [
        { name: "হোম", href: "/" },
        { name: "যোগাযোগ", href: "/contact" }
    ];

    // ── Form state ─────────────────────────────────────────────
    const [form, setForm]     = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [msg, setMsg]       = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (status !== 'idle') { setStatus('idle'); setMsg(''); }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('loading');
        setMsg('');

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMsg(data.message || 'বার্তা পাঠানো হয়েছে!');
                setForm({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
                setMsg(data.message || 'কিছু একটা সমস্যা হয়েছে।');
            }
        } catch {
            setStatus('error');
            setMsg('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
        }
    }

    return (
        <main>
            <DynamicPageHeader title={pageTitle} breadcrumbs={breadcrumbsList} />

            <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">

                {/* Decorative dots */}
                <div className="absolute top-10 right-10 z-0">
                    <div className="grid grid-cols-5 gap-2 opacity-30">
                        {Array(25).fill(0).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-[#fdac74] rounded-full" />
                        ))}
                    </div>
                </div>

                {/* Bottom-left boxes */}
                <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 z-0">
                    <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-[#fdac74] rounded-lg opacity-80 rotate-12" />
                    <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-[#fdac74] rounded-lg opacity-80 ml-10 -mt-12" />
                </div>

                {/* Bottom-right boxes */}
                <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 z-0">
                    <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-orange-300 rounded-lg opacity-80 -rotate-12" />
                    <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-orange-300 rounded-lg opacity-80 ml-10 -mt-12" />
                </div>

                {/* Main card */}
                <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 max-w-6xl w-full mx-auto z-10">

                    <div className="text-center mb-12">
                        <h2 className="text-xl font-bold text-[#f97316] uppercase tracking-wider border-b-2 border-[#f97316] inline-block pb-1">
                            যোগাযোগ করুন
                        </h2>
                    </div>

                    {/* Video */}
                    <div className="mb-10">
                        <iframe
                            loading="lazy"
                            title="Gumlet video player"
                            src="https://play.gumlet.io/embed/69785a5711ec7dfcb96808c7?background=false&autoplay=false&loop=false&disableControls=false"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                            className="w-full h-64 md:h-80 rounded-xl"
                        />
                    </div>

                    {/* 2-column grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* ── Form ── */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                আপনার বার্তা দিন
                            </h3>

                            {/* Success message */}
                            {status === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                                    {msg}
                                </div>
                            )}

                            {/* Error message */}
                            {status === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                                    {msg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* নাম */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="পুরো নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] text-gray-900 placeholder-gray-400 transition"
                                        required
                                        disabled={status === 'loading'}
                                    />
                                </div>

                                {/* ইমেইল */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="ইমেইল ঠিকানা"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] text-gray-900 placeholder-gray-400 transition"
                                        required
                                        disabled={status === 'loading'}
                                    />
                                </div>

                                {/* বার্তা */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">আপনার বার্তা</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="আপনার বার্তা"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316] text-gray-900 placeholder-gray-400 resize-none transition"
                                        required
                                        disabled={status === 'loading'}
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                        {form.message.length} / ২০০০
                                    </p>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-[#f97316] hover:bg-[#ea670c] cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            পাঠানো হচ্ছে...
                                        </>
                                    ) : 'পাঠান'}
                                </button>
                            </form>
                        </div>

                        {/* ── Info ── */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-800 font-bold mb-2">Micro Skill</p>
                                <p className="text-gray-600 leading-relaxed">
                                    B 2/13 Ground Floor Double <br />
                                    Story Ramesh Nagar, Near Raja Garden <br />
                                    Chowk, Delhi 110015
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-800 font-semibold">+91 9599222724</p>
                            </div>

                            <div>
                                <p className="text-gray-800 font-semibold">hello@info.com.ng</p>
                            </div>

                            {/* Social icons */}
                            <div className="flex space-x-4">
                                <Link href="#" className="text-gray-500 hover:text-pink-600 transition-colors">
                                    <Instagram size={24} />
                                </Link>
                                <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                                    <Facebook size={24} />
                                </Link>
                                <Link href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                                    <Linkedin size={24} />
                                </Link>
                                <Link href="#" className="text-gray-500 hover:text-sky-500 transition-colors">
                                    <Twitter size={24} />
                                </Link>
                            </div>

                            {/* Map */}
                            <div className="mt-6">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.815277156903!2d77.1492657150827!3d28.63529398241644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03217ac51a7b%3A0xb3b0067a7f7636e7!2sRamesh%20Nagar%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1678888888888!5m2!1sen!2sin"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    className="rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}