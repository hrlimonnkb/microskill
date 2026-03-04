"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, AtSign, Camera, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://api.microskill.com.bd';
const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return `${API_BASE_URL}${image}`;
    return `${API_BASE_URL}/${image}`;
};
export default function SettingsPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Profile form
    const [profileForm, setProfileForm] = useState({ name: '', username: '', mobileNumber: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Password form
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // ── Load user from localStorage ──
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setProfileForm({
                    name: parsed.name || '',
                    username: parsed.username || '',
                    mobileNumber: parsed.mobileNumber || '',
                });
            }
        } catch (e) {
            console.error('User parse error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Avatar Upload ──
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('ছবির সাইজ ২MB এর বেশি হতে পারবে না');
            return;
        }

        setAvatarLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch(`${API_BASE_URL}/api/auth/update-avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.image) {
                const updatedUser = { ...user, image: data.image };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                alert(data.message || 'আপলোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert('সার্ভারে সংযোগ করতে সমস্যা হয়েছে');
        } finally {
            setAvatarLoading(false);
        }
    };


    // ── Profile Update ──
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });

        if (!profileForm.name || !profileForm.username) {
            setProfileMsg({ type: 'error', text: 'নাম এবং ইউজারনেম আবশ্যক' });
            return;
        }

        setProfileLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm),
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, ...profileForm };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setProfileMsg({ type: 'success', text: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
            } else {
                setProfileMsg({ type: 'error', text: data.message || 'আপডেট করতে সমস্যা হয়েছে' });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে' });
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Password Change ──
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'সব ঘর পূরণ করুন' });
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মিলছে না' });
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordMsg({ type: 'error', text: data.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' });
            }
        } catch (err) {
            setPasswordMsg({ type: 'error', text: 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে' });
        } finally {
            setPasswordLoading(false);
        }
    };
    const imageSrc = user?.image ? getImageSrc(user.image) : null;
    const TABS = [
        { id: 'profile', label: 'প্রোফাইল', icon: User },
        { id: 'password', label: 'পাসওয়ার্ড', icon: Lock },
        { id: 'account', label: 'অ্যাকাউন্ট', icon: Mail },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#f97316]" size={36} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">সেটিংস</h1>
                    <p className="text-gray-500 text-sm mt-1">আপনার প্রোফাইল ও অ্যাকাউন্ট পরিচালনা করুন</p>
                </div>

                {/* ── Profile Card with Avatar Upload ── */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6 flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-[#f97316]">
                            {console.log(user)}

                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt={user.name || 'User'}
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 rounded-full object-cover block"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-[#f97316] font-bold text-base">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Hover overlay for upload */}
                        <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                            {avatarLoading
                                ? <Loader2 size={18} className="text-white animate-spin" />
                                : <Camera size={18} className="text-white" />
                            }
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={avatarLoading}
                            />
                        </label>
                    </div>

                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">{user?.name}</h2>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                        <p className="text-slate-400 text-xs mt-0.5">ছবিতে hover করে পরিবর্তন করুন</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium
                            ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {user?.role === 'ADMIN' ? 'Admin' : 'Student'}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-6">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition
                                    ${activeTab === tab.id
                                        ? 'bg-[#f97316] text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Tab: Profile ── */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                            <User size={20} className="text-[#f97316]" />
                            প্রোফাইল তথ্য
                        </h3>

                        {profileMsg.text && (
                            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg mb-4
                                ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {profileMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">পূর্ণ নাম *</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="আপনার পূর্ণ নাম"
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারনেম *</label>
                                <div className="relative">
                                    <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.username}
                                        onChange={e => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                                        placeholder="ইউজারনেম"
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">মোবাইল নম্বর</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.mobileNumber}
                                        onChange={e => setProfileForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                                        placeholder="০১XXXXXXXXX"
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full bg-[#f97316] hover:bg-[#c2570c] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {profileLoading ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Tab: Password ── */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                            <Lock size={20} className="text-[#f97316]" />
                            পাসওয়ার্ড পরিবর্তন
                        </h3>

                        {user?.provider === 'google' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
                                ⚠️ আপনি Google দিয়ে লগইন করেছেন। পাসওয়ার্ড পরিবর্তন করতে পারবেন না।
                            </div>
                        )}

                        {passwordMsg.text && (
                            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg mb-4
                                ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="বর্তমান পাসওয়ার্ড"
                                        disabled={user?.provider === 'google'}
                                        className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316] disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">নতুন পাসওয়ার্ড *</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                                        disabled={user?.provider === 'google'}
                                        className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316] disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordForm.newPassword && (
                                    <div className="mt-1.5 flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors
                                                ${passwordForm.newPassword.length >= i * 3
                                                    ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                                                    : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন *</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="পাসওয়ার্ড আবার লিখুন"
                                        disabled={user?.provider === 'google'}
                                        className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none disabled:bg-slate-50 disabled:text-slate-400
                                            ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                                                ? 'border-red-400 focus:border-red-400'
                                                : 'border-slate-300 focus:border-[#f97316]'}`}
                                    />
                                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">পাসওয়ার্ড দুটি মিলছে না</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading || user?.provider === 'google'}
                                className="w-full bg-[#f97316] hover:bg-[#c2570c] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                {passwordLoading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Tab: Account Info ── */}
                {activeTab === 'account' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                            <Mail size={20} className="text-[#f97316]" />
                            অ্যাকাউন্ট তথ্য
                        </h3>

                        <div className="space-y-1">
                            {[
                                { label: 'ইমেইল', value: user?.email, icon: Mail },
                                { label: 'ইউজারনেম', value: user?.username ? `@${user.username}` : '—', icon: AtSign },
                                { label: 'মোবাইল', value: user?.mobileNumber || 'যোগ করা হয়নি', icon: Phone },
                                { label: 'অ্যাকাউন্ট টাইপ', value: user?.provider === 'google' ? ' Google Account' : ' Email Account', icon: User },
                                {
                                    label: 'ভূমিকা',
                                    value: user?.role === 'ADMIN' ? ' Admin' : user?.role === 'TEACHER' ? 'Teacher' : ' Student',
                                    icon: User
                                },
                                {
                                    label: 'ইমেইল যাচাই',
                                    value: user?.emailVerified ? ' যাচাই হয়েছে' : ' যাচাই হয়নি',
                                    icon: CheckCircle,
                                    highlight: user?.emailVerified ? 'text-green-600' : 'text-red-500'
                                },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Icon size={15} />
                                            {item.label}
                                        </div>
                                        <span className={`text-sm font-medium ${item.highlight || 'text-slate-800'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-6 pt-4 border-t border-red-100">
                            <p className="text-sm font-semibold text-red-600 mb-3"> বিপদ অঞ্চল</p>
                            <button
                                onClick={() => {
                                    if (confirm('আপনি কি সত্যিই লগআউট করতে চান?')) {
                                        localStorage.removeItem('authToken');
                                        localStorage.removeItem('user');
                                        window.location.href = '/login';
                                    }
                                }}
                                className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-lg transition text-sm"
                            >
                                লগআউট করুন
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}