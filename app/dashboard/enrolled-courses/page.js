"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Play, BookOpen, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const API_BASE_URL = 'http://localhost:3001';

const EnrolledCourseCardSkeleton = () => (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <Skeleton height={160} className="w-full" />
        <div className="p-6">
            <Skeleton height={24} width="80%" className="mb-2" />
            <Skeleton height={16} width="60%" className="mb-4" />
            <Skeleton height={8} className="mb-2" />
            <Skeleton height={16} width="40%" className="mb-4" />
            <Skeleton height={40} className="w-full" />
        </div>
    </div>
);

export default function EnrolledCoursesPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

   const fetchEnrolledCourses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            console.log('🔍 DEBUG: Starting fetchEnrolledCourses');
            console.log('🔑 Token exists:', !!token);
            console.log('🔑 Token value:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
            
            if (!token) {
                console.error('❌ No token found in localStorage');
                throw new Error('আপনাকে লগইন করতে হবে');
            }

            const apiUrl = `${API_BASE_URL}/api/courses/my-enrollments`;
            console.log('📡 Calling API:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Response Status:', response.status);
            console.log('📥 Response OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response Error:', errorText);
                throw new Error(`কোর্স লোড করতে সমস্যা হয়েছে (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('✅ Response Data:', data);
            console.log('📊 Enrollments count:', data.enrollments?.length || 0);
            console.log('📋 Enrollments:', data.enrollments);

            setEnrollments(data.enrollments || []);
        } catch (err) {
            console.error('❌ fetchEnrolledCourses Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (progress) => {
        if (progress === 0) return 'bg-gray-300';
        if (progress < 30) return 'bg-gray-400';
        if (progress < 70) return 'bg-gray-600';
        return 'bg-black';
    };

    const getButtonText = (progress) => {
        if (progress === 0) return 'শুরু করুন';
        if (progress === 100) return 'পুনরায় দেখুন';
        return 'চালিয়ে যান';
    };

    const getButtonIcon = (progress) => {
        if (progress === 100) return <CheckCircle size={18} />;
        return <Play size={18} />;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border-2 border-gray-800 rounded-lg p-6 text-center">
                        <p className="text-gray-800 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                            আমার কোর্সসমূহ
                        </h1>
                        <p className="text-gray-600">
                            মোট {enrollments.length}টি কোর্সে এনরোল করেছেন
                        </p>
                    </div>

                    {/* Stats Overview */}
                    {!loading && enrollments.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white border-2 border-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">মোট কোর্স</p>
                                        <p className="text-4xl font-bold text-black mt-2">
                                            {enrollments.length}
                                        </p>
                                    </div>
                                    <BookOpen className="text-gray-800" size={40} />
                                </div>
                            </div>

                            <div className="bg-black text-white border-2 border-black rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-300 text-sm font-medium">সম্পন্ন কোর্স</p>
                                        <p className="text-4xl font-bold text-white mt-2">
                                            {enrollments.filter(e => e.progress === 100).length}
                                        </p>
                                    </div>
                                    <CheckCircle className="text-gray-300" size={40} />
                                </div>
                            </div>

                            <div className="bg-white border-2 border-gray-400 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">চলমান কোর্স</p>
                                        <p className="text-4xl font-bold text-black mt-2">
                                            {enrollments.filter(e => e.progress > 0 && e.progress < 100).length}
                                        </p>
                                    </div>
                                    <Clock className="text-gray-600" size={40} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Course Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(6).fill(0).map((_, i) => (
                                <EnrolledCourseCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="bg-white border-2 border-gray-300 rounded-xl p-12 text-center shadow-lg">
                            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-2xl font-bold text-black mb-2">
                                এখনও কোনো কোর্সে এনরোল করেননি
                            </h3>
                            <p className="text-gray-600 mb-6">
                                আমাদের কোর্স লাইব্রেরি থেকে আপনার পছন্দের কোর্স খুঁজে নিন
                            </p>
                            <Link href="/courses">
                                <span className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer">
                                    <BookOpen size={20} className="mr-2" />
                                    কোর্স ব্রাউজ করুন
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-black transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-40 overflow-hidden bg-gray-100">
                                        <img
                                            src={enrollment.course.thumbnail 
                                                ? `${API_BASE_URL}/${enrollment.course.thumbnail}` 
                                                : 'https://placehold.co/400x240/ffffff/000000?text=Course'}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3">
                                            {enrollment.progress === 100 ? (
                                                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                    <CheckCircle size={14} />
                                                    সম্পন্ন
                                                </span>
                                            ) : enrollment.progress > 0 ? (
                                                <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    চলমান
                                                </span>
                                            ) : (
                                                <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    নতুন
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                                            {enrollment.course.title}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-600 mb-4 flex items-center">
                                            <BookOpen size={14} className="mr-1" />
                                            {enrollment.course.instructor.fullName}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                    <BarChart3 size={14} />
                                                    অগ্রগতি
                                                </span>
                                                <span className="text-sm font-bold text-black">
                                                    {enrollment.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${getProgressColor(enrollment.progress)} transition-all duration-500 rounded-full`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Link 
                                                href={`/dashboard/course/${enrollment.course.slug}`}
                                                className="flex-1"
                                            >
                                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200">
                                                    {getButtonIcon(enrollment.progress)}
                                                    {getButtonText(enrollment.progress)}
                                                </button>
                                            </Link>
                                            
                                            <Link 
                                                href={`/course/${enrollment.course.slug}`}
                                            >
                                                <button className="px-4 py-2.5 border-2 border-gray-400 text-gray-700 font-semibold rounded-lg hover:border-black hover:text-black transition-all duration-200">
                                                    <BookOpen size={18} />
                                                </button>
                                            </Link>
                                        </div>

                                        {/* Enrolled Date */}
                                        <p className="text-xs text-gray-500 mt-4 text-center">
                                            এনরোল: {new Date(enrollment.enrolledAt).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SkeletonTheme>
    );
}