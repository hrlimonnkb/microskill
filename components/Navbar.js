"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Updated icons to match new design
import { Search, Menu as MenuIcon, X, UserCircle, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// !! 1. UPDATE THIS PATH to your new logo
const logoSrc = "/logo.png"; // Example: "/weekend-logo.png"

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, loading, logout } = useAuth();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 2. Updated Nav Links to match the image
  const navLinks = [
  { href: "/", text: "হোম" },
  { href: "/courses", text: "কোর্সসমূহ" },
  { href: "/become-a-teacher", text: "শেখাতে চাই" },
  { href: "/contact", text: "যোগাযোগ" },
  { href: "/faq", text: "প্রশ্নোত্তর" },
];

    const IMG_URL="http://localhost:3001"

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    // 3. AuthSection updated for new styles
    const AuthSection = ({ isMobile = false }) => {
        if (loading) {
            return <div className={`h-10 w-44 rounded-lg bg-gray-200 animate-pulse ${isMobile ? 'w-full' : ''}`}></div>;
        }

        if (user) {
            // Logged-in view (dropdown) - updated to emerald theme
            return (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="flex items-center gap-2 rounded-full p-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
                    >
                        <span className="sr-only">Open user menu</span>
                        {user.image ? (
                            <img
                                className="h-9 w-9 rounded-full"
                                src={`${IMG_URL}/${user.image}`}
                                alt={user.name || 'User'}
                                width={36}
                                height={36}
                            />
                        ) : (
                            <UserCircle className="h-9 w-9 text-gray-600" />
                        )}
                        <span className="hidden sm:inline">{user.name}</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform opacity-100 scale-100 z-50">
                            <div className="py-1">
                                <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-[#f97316] hover:text-white">
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    ড্যাশবোর্ড
                                </Link>
                                <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-[#f97316] hover:text-white">
                                    <Settings className="mr-2 h-5 w-5" />
                                    সেটিংস
                                </Link>
                                <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-red-500 hover:text-white">
                                    <LogOut className="mr-2 h-5 w-5" />
                                    লগআউট
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Logged-out view (matches image)
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
                    
                    <div className="flex items-center">
                        {/* 4. Updated Logo */}
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            {/* Make sure logoSrc is correct */}
                            <Image src={logoSrc} width={120} height={60} alt="Weekend Logo" className="h-10 w-auto" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 5. New Search Bar */}
                        <div className="hidden md:block relative w-80">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="কি শিখতে চাও?" 
                                className="w-full pl-11 pr-32 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:border-[#f97316] focus:ring-[#f97316]" 
                            />
                            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-[#f97316] rounded-md text-sm font-semibold hover:bg-emerald-100">
                                  অন্বেষণ করো
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        {/* 6. Updated Desktop Menu Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    className={`text-base hover:text-[#f97316] ${
                                        link.text === "Home" 
                                        ? 'text-[#f97316] font-bold' 
                                        : 'text-gray-700 font-medium'
                                    }`}
                                >
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 7. Right Section (Auth) */}
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

            {/* 8. Updated Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white py-4 absolute w-full shadow-lg">
                    <div className="px-4 space-y-4">
                        
                        {/* Mobile Search Bar */}
                        <div className="relative w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Want to learn?" 
                                className="w-full pl-11 pr-32 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:border-[#f97316] focus:ring-[#f97316]" 
                            />
                         <button className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-[#f97316] rounded-md text-sm font-semibold hover:bg-emerald-100">
  অন্বেষণ করো
  <ChevronDown className="h-4 w-4" />
</button>

                        </div>
                        
                        {/* Mobile Nav Links */}
                        {navLinks.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                className={`block text-base font-medium ${
                                    link.text === "Home" 
                                    ? 'text-[#f97316] font-bold' 
                                    : 'text-gray-700'
                                }`} 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}
                        
                        {/* Mobile Auth Section */}
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            <AuthSection isMobile={true} />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;