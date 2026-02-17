"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Award, ArrowRight, Search } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DynamicPageHeader from '@/components/DynamicPageHeader';

const API_BASE_URL = 'https://api.microskill.com.bd';

const TeacherCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 p-4 flex flex-col items-center text-center">
        <Skeleton circle width={100} height={100} className="mb-4" />
        <Skeleton height={20} width="70%" className="mb-2" />
        <Skeleton height={14} width="50%" className="mb-4" />
        <Skeleton count={2} height={12} width="90%" className="mb-4" />
        <Skeleton height={40} className="w-full mt-auto" />
    </div>
);

export default function AllTeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/teachers`);
                if (!response.ok) throw new Error('Failed to fetch teachers.');
                const data = await response.json();
                setTeachers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const pageTitle = "আমাদের দক্ষ প্রশিক্ষকবৃন্দ";
    const breadcrumbsList = [
        { name: "হোম", href: "/" },
        { name: "প্রশিক্ষক", href: "/teachers" }
    ];

    if (error) return <div className="p-4 text-center text-red-600 bg-red-50">Error: {error}</div>;

    return (
        <main>
            <DynamicPageHeader title={pageTitle} breadcrumbs={breadcrumbsList} />
            <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Search and Title Section */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">ফিল্ড এক্সপার্ট প্রশিক্ষক</h1>
                                <p className="text-slate-600 mt-1">কোর্স করুন নিজ নিজ ক্ষেত্রে অভিজ্ঞ ও দক্ষ প্রশিক্ষকদের কাছ থেকে।</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <input 
                                    type="text" 
                                    placeholder="প্রশিক্ষক খুঁজুন..." 
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f97316] bg-white"
                                />
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Array(8).fill(0).map((_, i) => <TeacherCardSkeleton key={i} />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teachers.map((teacher) => (
                                    <div key={teacher.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden group">
                                        <div className="p-6 flex flex-col items-center">
                                            {/* Profile Image */}
                                            <div className="relative mb-4">
                                                <img
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 group-hover:border-[#f97316] transition-colors duration-300"
                                                    src={teacher.profilePhoto ? `${API_BASE_URL}/${teacher.profilePhoto}` : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                                    alt={teacher.fullName}
                                                />
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-800 mb-1 text-center line-clamp-1">{teacher.fullName}</h3>
                                            <p className="text-sm font-medium text-[#ea670c] mb-3">{teacher.subjects?.[0] || 'Expert Instructor'}</p>
                                            
                                            <p className="text-sm text-slate-500 text-center mb-4 line-clamp-2 h-10">
                                                {teacher.shortBio || "No bio available at the moment."}
                                            </p>

                                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                {teacher.skills?.slice(0, 2).map((skill, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                          <Link href={`/teachers/${teacher.username}`}>
    <span className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#f97316] text-white text-sm font-semibold rounded-lg hover:bg-[#c2570c] transition-colors duration-200 cursor-pointer">
        প্রোফাইল দেখুন
        <ArrowRight size={16} className="ml-2" />
    </span>
</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SkeletonTheme>
        </main>
    );
}