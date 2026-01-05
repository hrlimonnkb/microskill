"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "কোড পাঠানো সম্ভব হয়নি।");
            }

            setMessage({ type: 'success', text: data.message });
            
            // ২ সেকেন্ড পর রিডাইরেক্ট
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">পাসওয়ার্ড ভুলে গেছেন?</h2>
                    <p className="text-sm text-gray-500 mt-2">আপনার ইমেইল দিন, আমরা একটি রিসেট কোড পাঠাব।</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">ইমেইল অ্যাড্রেস</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ea670c] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full text-white bg-[#ea670c] hover:bg-[#c2570c] font-semibold py-2.5 rounded-lg flex justify-center items-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'রিসেট কোড পাঠান'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/signin" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#ea670c] transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        লগইন পেজে ফিরে যান
                    </Link>
                </div>
            </div>
        </div>
    );
}