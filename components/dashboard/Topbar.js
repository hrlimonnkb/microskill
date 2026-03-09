"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, Bell, Menu, LayoutDashboard, Settings, LogOut } from 'lucide-react';

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
        // নাম থাকলে প্রথম অক্ষর নেবে, না থাকলে 'U'
        const userInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center justify-center rounded-full focus:outline-none border-2 border-gray-200 hover:border-[#f97316] transition-all overflow-hidden h-10 w-10 bg-white"
                >
                    <span className="sr-only">Open user menu</span>

                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={user.name || 'User'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                // ইমেজ লোড না হলে সেটি সরিয়ে Initial লেটার দেখাবে
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}

                    {/* ইমেজ না থাকলে বা লোড হতে ফেইল করলে এই লেটারটি দেখাবে */}
                    <div 
                        className={`${imageSrc ? 'hidden' : 'flex'} h-full w-full bg-orange-100 items-center justify-center`}
                        style={!imageSrc ? { display: 'flex' } : {}}
                    >
                        <span className="text-[#f97316] font-bold text-lg">
                            {userInitial}
                        </span>
                    </div>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#f97316] hover:text-white transition-colors">
                                <LayoutDashboard className="mr-2 h-5 w-5" /> ড্যাশবোর্ড
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#f97316] hover:text-white transition-colors">
                                <Settings className="mr-2 h-5 w-5" /> সেটিংস
                            </Link>
                            <button 
                                onClick={() => { logout(); setIsDropdownOpen(false); }} 
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
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
                        className="pl-10 pr-4 py-2 w-64 border rounded-lg bg-gray-100 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] focus:outline-none transition-all"
                    />
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-[#f97316] relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Topbar;