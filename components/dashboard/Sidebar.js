"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Home, BookOpen, BarChart2, Settings, X, Users, ChevronDown, User2, UserCircle, UserPen, Newspaper, Contact } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState({});
    const { user } = useAuth();

    const allNavLinks = [
        { 
            href: "/dashboard", 
            icon: Home, 
            text: "ড্যাশবোর্ড",
            roles: ['ADMIN', 'TEACHER', 'STUDENT'] 
        },
        {
            id: 'teachers',
            icon: Users,
            text: "শিক্ষক ম্যানেজমেন্ট",
            roles: ['TEACHER'],
            children: [
                { href: "/dashboard/teacher/add-teacher", text: "শিক্ষক যোগ করুন" },
                { href: "/dashboard/teacher/teachers", text: "সকল শিক্ষক" },
            ]
        },
        {
            id: 'courses',
            icon: BookOpen,
            text: "কোর্স",
            roles: ['ADMIN', 'TEACHER'],
            children: [
                { href: "/dashboard/course/add-course", text: "কোর্স যোগ করুন" },
                { href: "/dashboard/course/all-course", text: "সকল কোর্স" },
            ]
        },
        {
            id: 'blogs',
            icon: Newspaper,
            text: "ব্লগ",
            roles: ['ADMIN'],
            children: [
                { href: "/dashboard/blog-categories/new", text: "ব্লগ ক্যাটেগরি" },
                { href: "/dashboard/blog-categories", text: "সকল ক্যাটেগরি" },
                { href: "/dashboard/blog/new", text: "ব্লগ যোগ করুন" },
                { href: "/dashboard/blog", text: "সকল ব্লগ" },
                { href: "/dashboard/comments", text: "সকল মন্তব্য" },
            ]
        },
        {
            id: 'Orders',
            icon: BookOpen,
            text: "অর্ডার",
            roles: ['ADMIN', 'TEACHER', 'STUDENT'],
            children: [
                { href: "/dashboard/orders", text: "সকল অর্ডার" },
            ]
        },
        {
            id: 'Certificates',
            icon: BookOpen,
            text: "সার্টিফিকেট",
            roles: ['ADMIN', 'TEACHER', 'STUDENT'],
            children: [
                { href: "/dashboard/certificates",     text: "আমার সার্টিফিকেট", roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
                { href: "/dashboard/all-certificates", text: "সকল সার্টিফিকেট",  roles: ['ADMIN', 'TEACHER'] },
            ]
        },
        {
            id: 'teachers-admin',
            icon: Users,
            text: "শিক্ষক ম্যানেজমেন্ট",
            roles: ['ADMIN'],
            children: [
                { href: "/dashboard/teacher/add-teacher", text: "শিক্ষক যোগ করুন" },
                { href: "/dashboard/teacher/teachers", text: "সকল শিক্ষক" },
            ]
        },
        
        { 
            href: "/dashboard/users/all-user", 
            icon: User2, 
            text: "স্টুডেন্টস",
            roles: ['ADMIN'] 
        },
        { 
            href: "/dashboard/contact", 
            icon: Contact, 
            text: "যোগাযোগ বার্তা",
            roles: ['ADMIN'] 
        },
        // { 
        //     href: "/dashboard/analytics", 
        //     icon: BarChart2, 
        //     text: "অ্যানালিটিক্স",
        //     roles: ['ADMIN'] 
        // },
        { 
            href: "/dashboard/settings", 
            icon: Settings, 
            text: "সেটিংস",
            roles: ['ADMIN', 'TEACHER', 'STUDENT'] 
        },
    ];

    const userRole = user?.role?.toUpperCase();

    const navLinks = allNavLinks.filter(link => {
        if (!userRole) return false;
        return link.roles.includes(userRole);
    });

    useEffect(() => {
        const activeMenu = navLinks.find(link => 
            link.children?.some(child => pathname.startsWith(child.href))
        );
        if (activeMenu) {
            setOpenMenus(prev => ({ ...prev, [activeMenu.id]: true }));
        }
    }, [pathname]);

    const handleMenuToggle = (id) => {
        setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const NavItem = ({ link }) => {
        const isParentActive = link.children?.some(child => pathname.startsWith(child.href));
        const isChildActive = (href) => pathname === href;

        if (!link.children) {
            const isActive = pathname === link.href;
            return (
                <Link
                    href={link.href}
                    className={`flex items-center p-3 my-1 rounded-lg transition-colors ${
                        isActive ? 'bg-[#ea670c] text-white shadow-lg' : 'text-gray-300 hover:bg-indigo-900 hover:text-white'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <link.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{link.text}</span>
                </Link>
            );
        }

        // ── Child-level role filter ──────────────────────────────
        const visibleChildren = link.children.filter(child =>
            !child.roles || child.roles.includes(userRole)
        );

        if (visibleChildren.length === 0) return null;

        const isOpen = openMenus[link.id];
        return (
            <div>
                <button
                    onClick={() => handleMenuToggle(link.id)}
                    className={`w-full flex items-center justify-between p-3 my-1 rounded-lg transition-colors ${
                        isParentActive ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-indigo-900 hover:text-white'
                    }`}
                >
                    <div className="flex items-center">
                        <link.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">{link.text}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60' : 'max-h-0'}`}>
                    <div className="pl-8 pt-1 border-l-2 border-gray-700 ml-5">
                        {visibleChildren.map(child => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center p-2 my-1 rounded-md text-sm transition-colors ${
                                    isChildActive(child.href) ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                                }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {child.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40 md:relative md:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700 h-20">
                    <Link href="/" className="flex items-center space-x-2">
                        <ShoppingBag className="text-[#fb8a3c]" size={32} />
                        <span className="font-bold text-2xl">ই-লার্ণ</span>
                    </Link>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {navLinks.map(link => <NavItem key={link.id || link.href} link={link} />)}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;