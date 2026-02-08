"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userEmail = searchParams.get('email');
        if (userEmail) {
            setFormData(prev => ({ ...prev, email: userEmail }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (formData.password.length < 6) {
            setStatus({ type: 'error', message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'পাসওয়ার্ড দুটি মিলছে না।' });
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.microskill.com.bd';
            const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: formData.email, 
                    code: formData.code, 
                    password: formData.password 
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
            }

            setStatus({ type: 'success', message: 'সফলভাবে পাসওয়ার্ড পরিবর্তন হয়েছে! লগইন পেজে নেওয়া হচ্ছে...' });
            
            setTimeout(() => router.push('/signin'), 2500);

        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ইনপুট ফিল্ডের স্টাইল (ফিক্স করা হয়েছে)
    const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#ea670c] focus:border-transparent outline-none";

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">নতুন পাসওয়ার্ড সেট করুন</h2>
                <p className="text-sm text-gray-500 mt-2">আপনার ইমেইলে ({formData.email}) পাঠানো ৪-ডিজিটের কোড দিন।</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* OTP Code Input */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">ভেরিফিকেশন কোড</label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            name="code"
                            type="text"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="৪-ডিজিটের কোড"
                            required
                            autoComplete="off"
                            className={inputClass} // <--- ফিক্স করা ক্লাস ব্যবহার করা হয়েছে
                        />
                    </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">নতুন পাসওয়ার্ড</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className={inputClass} // <--- ফিক্স করা ক্লাস
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">পাসওয়ার্ড নিশ্চিত করুন</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className={inputClass} // <--- ফিক্স করা ক্লাস
                        />
                    </div>
                </div>

                {/* Status Message */}
                {status.message && (
                    <div className={`p-3 rounded-lg text-sm text-center ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {status.message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full text-white bg-[#ea670c] hover:bg-[#c2570c] font-semibold py-2.5 rounded-lg flex justify-center items-center transition-colors disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'পাসওয়ার্ড পরিবর্তন করুন'}
                </button>
            </form>
        </div>
    );
}

const LoadingFallback = () => (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#ea670c] animate-spin mb-4" />
        <p className="text-gray-500">লোডিং...</p>
    </div>
);

const ResetPasswordPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordContent />
        </Suspense>
    </div>
);

export default ResetPasswordPage;