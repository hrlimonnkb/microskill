"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, User, MapPin, CreditCard, Tag, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8006';

const STEPS = [
    { id: 1, label: 'অর্ডার কনফার্মেশন', icon: CheckCircle },
    { id: 2, label: 'ডেলিভারি ঠিকানা', icon: MapPin },
    { id: 3, label: 'পেমেন্ট', icon: CreditCard },
];

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [discount, setDiscount] = useState(0);
    const [enrolling, setEnrolling] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('sslcommerz');
    const [showAddressForm, setShowAddressForm] = useState(true);
    const [addressForm, setAddressForm] = useState({
        userPhone: '',
        userAddress: '',
        userCity: '',
        userRegion: '',
        userPostalcode: '',
        userCountry: 'Bangladesh'
    });
    const [addressError, setAddressError] = useState('');

    // ✅ একটাই useEffect — token check + fetchCourse একসাথে
    useEffect(() => {
        if (!slug) return;

        // ── ১. Token Check ──
        const token = localStorage.getItem('authToken');

        if (!token) {
            router.push(`/login?redirect=/checkout/${slug}`);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                localStorage.removeItem('authToken');
                router.push(`/login?redirect=/checkout/${slug}`);
                return;
            }

            setIsLoggedIn(true);
            setCurrentStep(1);
        } catch {
            localStorage.removeItem('authToken');
            router.push(`/login?redirect=/checkout/${slug}`);
            return;
        }

        // ── ২. Course Fetch ──
        const fetchCourse = async () => {
            try {
                setLoading(true);
                console.log('🛒 Fetching course for checkout, slug:', slug);

                const res = await fetch(`${API_BASE_URL}/api/courses/${slug}`);

                console.log('📡 Response status:', res.status);

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error('❌ Course fetch failed:', errData);
                    throw new Error('Course not found');
                }

                const found = await res.json();
                console.log('✅ Course found:', found.title, '| ID:', found.id);

                setCourse(found);
                setDiscount(0);
                console.log('💰 Real price:', found.price);

            } catch (err) {
                console.error('❌ Checkout fetch error:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();

    }, [slug]); // ✅ slug change হলে re-run

    const originalPrice = course?.price || 0;
    const finalPrice = originalPrice;

    const handlePromoSubmit = () => {
        if (promoCode.toUpperCase() === 'SAVE10') {
            const extraDiscount = Math.round(originalPrice * 0.10);
            setDiscount(prev => prev + extraDiscount);
            setPromoApplied(true);
            setPromoError('');
        } else if (promoCode.trim() === '') {
            setPromoError('প্রোমো কোড লিখুন');
        } else {
            setPromoError('অবৈধ প্রোমো কোড');
        }
    };

    const handleFreeEnroll = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) { router.push(`/login?redirect=/checkout/${slug}`); return; }

            setEnrolling(true);
            const res = await fetch(`${API_BASE_URL}/api/courses/enroll/${course.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert('✅ সফলভাবে এনরোল হয়েছেন!');
                router.push(`/courses/${course.slug}`);
            } else {
                alert(data.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            console.error('❌ Free enroll error:', err);
            alert('এনরোল করতে সমস্যা হয়েছে');
        } finally {
            setEnrolling(false);
        }
    };

    const handleSSLCommerz = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) { router.push(`/login?redirect=/checkout/${slug}`); return; }

            if (!addressForm.userPhone || !addressForm.userAddress || !addressForm.userCity) {
                setAddressError('ফোন নম্বর, ঠিকানা এবং শহর আবশ্যক');
                return;
            }
            setAddressError('');
            setEnrolling(true);

            const res = await fetch(`${API_BASE_URL}/api/payment/sslcommerz/initiate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id, ...addressForm })
            });

            const data = await res.json();
            if (data.success && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                alert(data.message || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            console.error('❌ SSLCommerz error:', err);
            alert('পেমেন্ট শুরু করতে সমস্যা হয়েছে');
        } finally {
            setEnrolling(false);
        }
    };

    const handleStripe = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) { router.push(`/login?redirect=/checkout/${slug}`); return; }

            setEnrolling(true);
            const amountUSD = (course.price / 110).toFixed(2);

            const res = await fetch(`${API_BASE_URL}/api/payment/stripe/initiate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id, amountUSD: parseFloat(amountUSD) })
            });

            const data = await res.json();
            if (data.success && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                alert(data.message || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            console.error('❌ Stripe error:', err);
            alert('পেমেন্ট শুরু করতে সমস্যা হয়েছে');
        } finally {
            setEnrolling(false);
        }
    };

    const handleStartCourse = () => {
        if (course.isFree) {
            handleFreeEnroll();
        } else if (paymentMethod === 'sslcommerz') {
            handleSSLCommerz();
        } else {
            handleStripe();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-3">⏳</div>
                    <p className="text-slate-600">লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">কোর্স পাওয়া যায়নি</p>
                    <Link href="/courses" className="text-blue-600 hover:underline">কোর্সে ফিরে যান</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-10 relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0" />
                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isDone = step.id < currentStep;
                        return (
                            <div key={step.id} className="flex flex-col items-center z-10 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                    ${isActive
                                        ? 'bg-[#f97316] border-[#f97316] text-white'
                                        : isDone
                                            ? 'bg-[#f97316] border-[#f97316] text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                    }`}
                                >
                                    {isDone ? <CheckCircle size={20} /> : <span className="text-sm font-bold">{step.id}</span>}
                                </div>
                                <p className={`text-xs mt-2 font-medium text-center ${isActive ? 'text-[#f97316]' : 'text-slate-400'}`}>
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Course Info */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex gap-4">
                                <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                    {course.thumbnail ? (
                                        <img src={`${API_BASE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-bold text-slate-800 text-base leading-snug">{course.title}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {discount > 0 && <span className="text-[#f97316] line-through text-sm">৳{originalPrice}</span>}
                                        <span className="text-[#f97316] font-bold text-lg">৳{finalPrice}</span>
                                    </div>
                                    {course.isFree && (
                                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mt-1 font-medium">ফ্রি কোর্স</span>
                                    )}
                                </div>
                            </div>
                            {course.description && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-slate-600 text-sm line-clamp-3">{course.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-slate-700 mb-3">🎁 এই কোর্সে পাচ্ছেন—</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                {course.numberOfLessons > 0 && <li className="flex items-center gap-2"><span className="text-green-500">•</span>{course.numberOfLessons}টি ভিডিও লেসন</li>}
                                {course.duration && <li className="flex items-center gap-2"><span className="text-green-500">•</span>মোট {course.duration} সময়কাল</li>}
                                {course.language && <li className="flex items-center gap-2"><span className="text-green-500">•</span>{course.language} ভাষায় পরিচালিত</li>}
                                <li className="flex items-center gap-2"><span className="text-green-500">•</span>লাইফটাইম অ্যাক্সেস</li>
                                <li className="flex items-center gap-2"><span className="text-green-500">•</span>সার্টিফিকেট অফ কমপ্লিশন</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
                            <h3 className="font-bold text-slate-800 text-lg mb-5">অর্ডার সারসংক্ষেপ</h3>

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-slate-700">
                                    <span className="text-sm">{course.title}</span>
                                    <span className="font-semibold">{course.isFree ? 'ফ্রি' : `৳${originalPrice}`}</span>
                                </div>
                                <div className="flex justify-between text-slate-700 border-t border-slate-100 pt-2">
                                    <span className="text-sm">মোট</span>
                                    <span className="font-semibold">{course.isFree ? 'ফ্রি' : `৳${originalPrice}`}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            {!course.isFree && (
                                <div className="mb-5">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">পেমেন্ট পদ্ধতি বেছে নিন:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => { setPaymentMethod('sslcommerz'); setShowAddressForm(true); }}
                                            className={`border-2 rounded-lg p-3 text-center transition ${paymentMethod === 'sslcommerz' ? 'border-[#f97316] bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <p className="font-bold text-sm text-slate-800">🇧🇩 bKash / Nagad</p>
                                            <p className="text-xs text-slate-500 mt-1">SSLCommerz</p>
                                            <p className="text-xs font-semibold text-[#f97316] mt-1">৳{course.price}</p>
                                        </button>
                                        <button
                                            onClick={() => { setPaymentMethod('stripe'); setShowAddressForm(false); }}
                                            className={`border-2 rounded-lg p-3 text-center transition ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <p className="font-bold text-sm text-slate-800">💳 Card / PayPal</p>
                                            <p className="text-xs text-slate-500 mt-1">Stripe</p>
                                            <p className="text-xs font-semibold text-blue-600 mt-1">${(course.price / 110).toFixed(2)} USD</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Address Form */}
                            {!course.isFree && paymentMethod === 'sslcommerz' && showAddressForm && (
                                <div className="mb-5 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <p className="text-sm font-semibold text-black">বিলিং তথ্য:</p>
                                    {addressError && <p className="text-red-500 text-xs bg-red-50 p-2 rounded">{addressError}</p>}
                                    <input
                                        type="text"
                                        placeholder="ফোন নম্বর *"
                                        value={addressForm.userPhone}
                                        onChange={e => setAddressForm(prev => ({ ...prev, userPhone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ঠিকানা *"
                                        value={addressForm.userAddress}
                                        onChange={e => setAddressForm(prev => ({ ...prev, userAddress: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="শহর *"
                                            value={addressForm.userCity}
                                            onChange={e => setAddressForm(prev => ({ ...prev, userCity: e.target.value }))}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="পোস্টাল কোড"
                                            value={addressForm.userPostalcode}
                                            onChange={e => setAddressForm(prev => ({ ...prev, userPostalcode: e.target.value }))}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Promo Code */}
                            <div className="mb-5">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                                            placeholder="প্রোমো কোড যোগ করুন"
                                            disabled={promoApplied}
                                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-green-400 disabled:bg-slate-50 disabled:text-slate-400"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePromoSubmit}
                                        disabled={promoApplied}
                                        className="bg-[#f97316] hover:bg-orange-600 disabled:bg-green-300 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap"
                                    >
                                        {promoApplied ? '✅ প্রয়োগ হয়েছে' : 'সাবমিট করুন'}
                                    </button>
                                </div>
                                {promoError && <p className="text-red-500 text-xs mt-1 ml-1">{promoError}</p>}
                                {promoApplied && <p className="text-green-600 text-xs mt-1 ml-1">✅ প্রোমো কোড সফলভাবে প্রয়োগ হয়েছে!</p>}
                            </div>

                            {/* Total */}
                            <div className="border-t border-slate-200 pt-4 mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800">সর্বমোট (ভ্যাট সহ)</span>
                                    <span className="font-bold text-slate-900 text-xl">৳{finalPrice}</span>
                                </div>
                                {course.isFree && <p className="text-green-600 text-sm mt-1 text-right">এটি একটি ফ্রি কোর্স!</p>}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleStartCourse}
                                disabled={enrolling}
                                className={`w-full font-bold py-3.5 rounded-lg transition text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${course.isFree || paymentMethod === 'sslcommerz'
                                        ? 'bg-[#f97316] hover:bg-[#c2570c] text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {enrolling ? (
                                    <><span className="animate-spin">⏳</span>অপেক্ষা করুন...</>
                                ) : (
                                    <>
                                        {course.isFree
                                            ? 'ফ্রিতে শুরু করুন'
                                            : paymentMethod === 'sslcommerz'
                                                ? '৳' + course.price + ' - bKash/Nagad দিয়ে পেমেন্ট করুন'
                                                : '$' + (course.price / 110).toFixed(2) + ' - Card দিয়ে পেমেন্ট করুন'
                                        }
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-3">
                                এনরোল করে আপনি আমাদের{' '}
                                <Link href="/terms" className="underline hover:text-slate-600">শর্তাবলী</Link>
                                {' '}মেনে নিচ্ছেন
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}