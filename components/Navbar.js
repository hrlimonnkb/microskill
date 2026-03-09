"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu as MenuIcon, X, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const logoSrc = "/logo.png";
const IMG_URL = "https://api.microskill.com.bd";

// ✅ Helper — ইমেজ URL ঠিক করার ফাংশন
const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image; 
    if (image.startsWith('/')) return `${IMG_URL}${image}`; 
    return `${IMG_URL}/${image}`; 
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, loading, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { href: "/", text: "হোম" },
        { href: "/courses", text: "কোর্সসমূহ" },
        { href: "/become-a-teacher", text: "শেখাতে চাই" },
        { href: "/contact", text: "যোগাযোগ" },
        { href: "/faq", text: "প্রশ্নোত্তর" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') setIsDropdownOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    // ✅ AuthSection: যেখানে প্রোফাইল পিকচার এবং লগইন লজিক থাকে
    const AuthSection = ({ isMobile = false }) => {
        if (loading) {
            return <div className={`h-10 w-44 rounded-lg bg-gray-200 animate-pulse ${isMobile ? 'w-full' : ''}`}></div>;
        }

        if (user) {
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
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}

                        {/* ইমেজ না থাকলে বা এরর হলে এই Initial লেটারটি দেখাবে */}
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
                            <div className="px-3 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="py-1">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-[#f97316] hover:text-white"
                                >
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    ড্যাশবোর্ড
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-[#f97316] hover:text-white"
                                >
                                    <Settings className="mr-2 h-5 w-5" />
                                    সেটিংস
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-red-500 hover:text-white"
                                >
                                    <LogOut className="mr-2 h-5 w-5" />
                                    লগআউট
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full' : ''}`}>
                <Link
                    href="/signin"
                    className="px-3 py-2 text-base font-medium text-gray-700 hover:text-[#f97316]"
                    onClick={() => isMobile && setIsMenuOpen(false)}
                >
                    লগইন
                </Link>
                <Link
                    href="/signup"
                    className="px-5 py-3 text-sm text-center font-semibold text-white rounded-lg transition-colors w-full md:w-auto bg-[#f97316] hover:bg-[#c2570c]"
                    onClick={() => isMobile && setIsMenuOpen(false)}
                >
                    একটি ফ্রি একাউন্ট খুলুন
                </Link>
            </div>
        );
    };

    return (
        <nav className="bg-white sticky top-0 z-50 w-full shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <Image src={logoSrc} width={120} height={60} alt="Logo" className="h-10 w-auto" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop Search */}
                        <div className="hidden md:block relative w-80">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="কি শিখতে চাও?"
                                className="w-full pl-11 pr-32 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:border-[#f97316] focus:ring-[#f97316]"
                            />
                            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-[#f97316] rounded-md text-sm font-semibold hover:bg-orange-100">
                                অন্বেষণ করো
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-base text-gray-700 font-medium hover:text-[#f97316] transition-colors"
                                >
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center">
                        <AuthSection />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white py-4 absolute w-full shadow-lg border-t">
                    <div className="px-4 space-y-4">
                        {/* Mobile Search */}
                        <div className="relative w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="কি শিখতে চাও?"
                                className="w-full pl-11 pr-32 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:border-[#f97316] focus:ring-[#f97316]"
                            />
                            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-[#f97316] rounded-md text-sm font-semibold hover:bg-orange-100">
                                অন্বেষণ করো
                            </button>
                        </div>

                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-base font-medium text-gray-700 hover:text-[#f97316]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}

                        <div className="border-t border-gray-200 pt-4">
                            <AuthSection isMobile={true} />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;