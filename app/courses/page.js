// ============================================
// File 1: app/courses/page.jsx (All Courses)
// ============================================
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Clock, Users, ArrowRight, ChevronDown } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DynamicPageHeader from '@/components/DynamicPageHeader';

const API_BASE_URL = 'https://api.microskill.com.bd';

const CourseCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
        <Skeleton height={180} className="w-full object-cover" />
        <div className="p-4">
            <Skeleton height={20} width="80%" className="mb-2" />
            <Skeleton height={16} width="60%" className="mb-3" />
            <Skeleton count={2} height={12} className="mb-3" />
            <div className="flex items-center text-sm text-slate-500 mb-3 space-x-4">
                <Skeleton width={80} />
                <Skeleton width={80} />
            </div>
            <div className="flex items-center mb-4">
                <Skeleton width={80} height={28} />
            </div>
            <Skeleton height={24} width="40%" className="mb-3" />
            <Skeleton height={40} className="w-full" />
        </div>
    </div>
);

export default function AllCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch courses.');
                }
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const pageTitle = "আমাদের কোর্স সমূহ";
    const breadcrumbsList = [
        { name: "হোম", href: "/" },
        { name: "আমাদের কোর্স সমূহ", href: "/courses" }
    ];

    if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <main>
            <DynamicPageHeader title={pageTitle} breadcrumbs={breadcrumbsList} />
            <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                        
                        {/* Sidebar */}
                        <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit sticky top-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-6">সকল কোর্স</h2>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="flex justify-between items-center text-slate-700 hover:text-[#ea670c] font-medium">
                                        <span>ডিজাইন</span>
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex justify-between items-center text-slate-700 hover:text-[#ea670c] font-medium">
                                        <span>ওয়েব ডেভেলপমেন্ট</span>
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex justify-between items-center text-[#ea670c] hover:text-[#c2570c] font-bold">
                                        <span>ডিজিটাল মার্কেটিং</span>
                                        <ChevronDown size={16} className="text-[#ea670c]" />
                                    </a>
                                </li>
                            </ul>
                        </aside>

                        {/* Main Content */}
                        <main className="w-full lg:w-3/4">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-slate-800">সকল কোর্স</h1>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array(6).fill(0).map((_, i) => <CourseCardSkeleton key={i} />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200">
                                            {console.log(course)}
                                            <img
                                                className="w-full h-48 object-cover"
                                                src={course.thumbnail ? `${API_BASE_URL}/${course.thumbnail}` : 'https://placehold.co/400x240/e2e8f0/64748b?text=Course'}
                                                alt={course.title}
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-slate-800 mb-1 leading-tight">{course.title}</h3>
                                                <p className="text-sm text-slate-600 flex items-center mb-3">
                                                    <User size={14} className="mr-1 text-slate-400" />
                                                    ইন্সট্রাক্টর {course.instructor?.fullName || 'N/A'}
                                                </p>
                                                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description}</p>
                                                
                                                <div className="flex items-center text-sm text-slate-500 mb-3 space-x-4">
                                                    <span className="flex items-center">
<Users size={14} className="mr-1 text-slate-400" /> {course._count?.enrollments || 0} শিক্ষার্থী
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock size={14} className="mr-1 text-slate-400" /> {course.duration}
                                                    </span>
                                                </div>

                                                <div className="flex items-center mb-4">
                                                    {course.isFree ? (
                                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                            ফ্রি কোর্স
                                                        </span>
                                                    ) : (
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                            {course.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xl font-bold text-slate-900 mb-4">
                                                    {course.isFree ? 'ফ্রি' : `৳ ${course.price}`}
                                                </p>

                                                <Link href={`/courses/${course.slug}`} passHref>
                                                    <span className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#f97316] text-white font-semibold rounded-md hover:bg-[#c2570c] transition-colors duration-200 text-center cursor-pointer">
                                                        কোর্সটি দেখুন
                                                        <ArrowRight size={18} className="ml-2" />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </SkeletonTheme>
        </main>
    );
}
