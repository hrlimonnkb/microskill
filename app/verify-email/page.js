"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, Loader2 } from 'lucide-react';

const VerifyEmailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        const userEmail = searchParams.get('email');
        if (userEmail) {
            setEmail(userEmail);
        } else {
            router.push('/signup');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (countdown === 0 || success) return;
        const timer = setInterval(() => setCountdown((prev) => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, [countdown, success]);

    const handleInputChange = (e, index) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value !== '' && index < 3) {
                inputRefs.current[index + 1].focus();
            }
        }
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };
    
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 4);
        if (/^[0-9]{4}$/.test(pasteData)) {
            const newCode = pasteData.split('');
            setCode(newCode);
            inputRefs.current[3].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const verificationCode = code.join('');
        if (verificationCode.length !== 4) {
            setError('অনুগ্রহ করে ৪-ডিজিটের কোডটি সম্পূর্ণ করুন।');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://api.microskill.com.bd/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setSuccess('আপনার ইমেইল সফলভাবে যাচাই করা হয়েছে! আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...');
            setTimeout(() => router.push('/signin'), 3000);
        } catch (err) {
            setError(err.message || 'একটি ত্রুটি ঘটেছে।');
        } finally {
            setLoading(false);
        }
    };
    
    // এই ফাংশনটি এখনও implement করা হয়নি, আপনি resend code এর জন্য API তৈরি করে নিতে পারেন
    const handleResendCode = () => {
        if (countdown > 0) return;
        console.log("Resending code to:", email);
        setResending(true);
        // এখানে কোড আবার পাঠানোর জন্য একটি API কল করতে হবে
        // আপাতত, আমরা শুধু কাউন্টডাউন রিসেট করছি
        setTimeout(() => {
            setSuccess('একটি নতুন কোড পাঠানো হয়েছে।');
            setCountdown(60);
            setResending(false);
        }, 1000);
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                <div className="inline-block bg-indigo-100 p-3 sm:p-4 rounded-full mb-4">
                    <MailCheck className="h-8 w-8 sm:h-10 sm:w-10 text-[#ea670c]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">আপনার ইমেইল যাচাই করুন</h1>
                <p className="text-gray-600 mb-6 px-4">
                    আমরা <strong className="text-gray-900 break-all">{email}</strong>-এ একটি ৪-ডিজিটের কোড পাঠিয়েছি।
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2 sm:gap-4 mb-6" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleInputChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl sm:text-3xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                                disabled={loading || success}
                            />
                        ))}
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg mb-4">{success}</p>}

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center bg-[#ea670c] hover:bg-[#c2570c] disabled:bg-[#fb8a3c] disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'অ্যাকাউন্ট যাচাই করুন'}
                    </button>
                </form>
                
                <div className="text-sm text-gray-600 mt-6">
                    <span>কোড পাননি? </span>
                    <button 
                        onClick={handleResendCode}
                        disabled={countdown > 0 || resending || success}
                        className="font-semibold text-[#ea670c] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {resending ? 'পাঠানো হচ্ছে...' : (countdown > 0 ? `${countdown} সেকেন্ড পরে আবার পাঠান` : 'আবার পাঠান')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const VerifyEmailPage = () => (
    // Suspense is used to handle loading state while fetching search params
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <VerifyEmailContent />
    </Suspense>
);

export default VerifyEmailPage;