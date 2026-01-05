"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Menu, UserCircle, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const Topbar = ({ setIsSidebarOpen }) => {
    const { user, loading, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const IMG_URL="http://localhost:3001"
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

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {user.image ? (
                        <img className="h-10 w-10 rounded-full" src={`${IMG_URL}/${user.image}`} alt={user.name} width={40} height={40} />
                    ) : (
                        <UserCircle className="h-10 w-10 text-gray-600" />
                    )}
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <LayoutDashboard className="mr-2 h-5 w-5" /> ড্যাশবোর্ড
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Settings className="mr-2 h-5 w-5" /> সেটিংস
                            </Link>
                            <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
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
                    <input type="text" placeholder="অনুসন্ধান..." className="pl-10 pr-4 py-2 w-64 border rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500"/>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-[#ea670c] relative">
                    <Bell size={24} />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Topbar;