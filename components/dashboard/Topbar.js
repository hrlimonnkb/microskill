"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, Bell, Menu, UserCircle, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const IMG_URL = "https://api.microskill.com.bd";

// ✅ Helper — সঠিক image URL বানাও
const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return `${IMG_URL}${image}`;
    return `${IMG_URL}/${image}`;
};

const Topbar = ({ setIsSidebarOpen }) => {
    const { user, loading, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const ProfileDropdown = () => {
        if (loading) return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>;
        if (!user) return null;

        const imageSrc = getImageSrc(user.image);

        return (
            <div className="relative" ref={dropdownRef}>
                {/* ✅ Animated gradient ring button */}
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="rounded-full p-[3px] focus:outline-none"
                    style={{
                        background: 'linear-gradient(135deg, #f97316, #ec4899, #a855f7, #f97316)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientSpin 3s linear infinite',
                    }}
                >
                    <div className="bg-white rounded-full p-[2px]">
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
                </button>

                {/* ✅ CSS animation — inline style tag */}
                <style>{`
                    @keyframes gradientSpin {
                        0%   { background-position: 0% 50%; }
                        50%  { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#f97316] hover:text-white">
                                <LayoutDashboard className="mr-2 h-5 w-5" /> ড্যাশবোর্ড
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#f97316] hover:text-white">
                                <Settings className="mr-2 h-5 w-5" /> সেটিংস
                            </Link>
                            <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <LogOut className="mr-2 h-5 w-5" /> লগআউট
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="অনুসন্ধান..."
                        className="pl-10 pr-4 py-2 w-64 border rounded-lg bg-gray-100 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#f97316] focus:outline-none"
                    />
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-[#f97316] relative">
                    <Bell size={24} />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Topbar;