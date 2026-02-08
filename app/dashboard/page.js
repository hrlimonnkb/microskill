"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    BookOpen, Award, TrendingUp, Clock, Users, DollarSign,
    CheckCircle, PlayCircle, Plus, BarChart3, Eye
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentCourses, setRecentCourses] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
                // Fetch teacher/admin stats
                await fetchTeacherStats(token);
            } else {
                // Fetch student stats
                await fetchStudentStats(token);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentStats = async (token) => {
        // Fetch enrolled courses
        const enrollmentRes = await fetch(`${API_BASE_URL}/api/courses/my-enrollments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const enrollmentData = await enrollmentRes.json();
        const enrollments = enrollmentData.enrollments || [];

        // Calculate stats
        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.progress === 100).length;
        const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
        const totalPoints = completedCourses * 100; // 100 points per completed course

        setStats({
            totalCourses,
            completedCourses,
            inProgressCourses,
            certificates: completedCourses,
            totalPoints
        });

        // Recent courses (last 6)
        setRecentCourses(enrollments.slice(0, 6));
    };

 const fetchTeacherStats = async (token) => {
    console.log('🎓 Fetching Teacher Stats...');
    
    // Fetch teacher's courses
    const coursesRes = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📥 Teacher Courses API Status:', coursesRes.status);
    
    if (!coursesRes.ok) {
        const errorText = await coursesRes.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch courses (Status: ${coursesRes.status})`);
    }
    
    const coursesData = await coursesRes.json();
    console.log('✅ Courses Data:', coursesData);
    
    const courses = Array.isArray(coursesData) ? coursesData : [];
    console.log('📚 Total Courses:', courses.length);

    // ✅ প্রতিটা course এর enrollment count debug করো
    courses.forEach((course, index) => {
        console.log(`\nCourse ${index + 1}: ${course.title}`);
        console.log('   _count object:', course._count);
        console.log('   Enrollments:', course._count?.enrollments || 0);
    });

    // Calculate stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => {
        const enrollments = course._count?.enrollments || 0;
        console.log(`   Adding ${enrollments} students from "${course.title}"`);
        return sum + enrollments;
    }, 0);
    const totalRevenue = courses.reduce((sum, course) => {
        const enrollments = course._count?.enrollments || 0;
        const revenue = course.price * enrollments;
        console.log(`   Revenue from "${course.title}": ৳${revenue}`);
        return sum + revenue;
    }, 0);
    const activeCourses = courses.filter(c => {
        const hasEnrollments = (c._count?.enrollments || 0) > 0;
        console.log(`   "${c.title}" active: ${hasEnrollments}`);
        return hasEnrollments;
    }).length;

    console.log('\n📊 Final Stats Calculated:');
    console.log('   Total Courses:', totalCourses);
    console.log('   Total Students:', totalStudents);
    console.log('   Total Revenue: ৳', totalRevenue);
    console.log('   Active Courses:', activeCourses);

    setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        activeCourses
    });

    setRecentCourses(courses.slice(0, 6));
    console.log('✅ Teacher stats loaded successfully');
};

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#f97316]"></div>
            </div>
        );
    }

    // Student Dashboard
    if (user?.role === 'STUDENT') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        স্বাগতম, {user?.name || 'শিক্ষার্থী'}!
                    </h1>
                    <p className="text-gray-600">
                        আপনার শেখার যাত্রা চালিয়ে যান এবং নতুন দক্ষতা অর্জন করুন
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-4">
                            <BookOpen size={32} />
                            <span className="text-3xl font-bold">{stats?.totalCourses || 0}</span>
                        </div>
                        <h3 className="text-lg font-semibold">মোট কোর্স</h3>
                        <p className="text-blue-100 text-sm">এনরোল করা কোর্স</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle size={32} />
                            <span className="text-3xl font-bold">{stats?.completedCourses || 0}</span>
                        </div>
                        <h3 className="text-lg font-semibold">সম্পন্ন কোর্স</h3>
                        <p className="text-green-100 text-sm">সফলভাবে শেষ করা</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Award size={32} />
                            <span className="text-3xl font-bold">{stats?.certificates || 0}</span>
                        </div>
                        <h3 className="text-lg font-semibold">সার্টিফিকেট</h3>
                        <p className="text-yellow-100 text-sm">অর্জিত সার্টিফিকেট</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp size={32} />
                            <span className="text-3xl font-bold">{stats?.totalPoints || 0}</span>
                        </div>
                        <h3 className="text-lg font-semibold">মোট পয়েন্ট</h3>
                        <p className="text-purple-100 text-sm">অর্জিত পয়েন্ট</p>
                    </div>
                </div>

                {/* In Progress Courses */}
                {stats?.inProgressCourses > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-8">
                        <div className="flex items-center gap-3">
                            <Clock size={24} className="text-orange-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {stats.inProgressCourses}টি কোর্স চলমান আছে
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    আপনার শেখা চালিয়ে যান এবং কোর্স সম্পন্ন করুন
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Courses */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">আমার কোর্সসমূহ</h2>
                        <Link href="/dashboard/enrolled-courses">
                            <span className="text-[#f97316] font-semibold hover:underline cursor-pointer">
                                সব দেখুন →
                            </span>
                        </Link>
                    </div>

                    {recentCourses.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-md text-center">
                            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                এখনও কোনো কোর্সে এনরোল করেননি
                            </h3>
                            <p className="text-gray-600 mb-6">
                                আমাদের কোর্স লাইব্রেরি ব্রাউজ করুন এবং শেখা শুরু করুন
                            </p>
                            <Link href="/courses">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-xl transition-all cursor-pointer">
                                    <Plus size={20} />
                                    কোর্স ব্রাউজ করুন
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentCourses.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                                >
                                    <div className="relative h-40">
                                        <img
                                            src={enrollment.course.thumbnail 
                                                ? `${API_BASE_URL}/${enrollment.course.thumbnail}` 
                                                : 'https://placehold.co/400x240/e2e8f0/64748b?text=Course'}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3">
                                            {enrollment.progress === 100 ? (
                                                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    সম্পন্ন
                                                </span>
                                            ) : (
                                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    {enrollment.progress}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                            {enrollment.course.title}
                                        </h3>
                                        <div className="mb-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-[#f97316] h-2 rounded-full transition-all"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/course/${enrollment.course.slug}`}>
                                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#f97316] text-white font-semibold rounded-lg hover:bg-[#ea670c] transition-colors">
                                                <PlayCircle size={18} />
                                                {enrollment.progress === 0 ? 'শুরু করুন' : 
                                                 enrollment.progress === 100 ? 'পুনরায় দেখুন' : 'চালিয়ে যান'}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/courses">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all cursor-pointer">
                            <BookOpen size={32} className="mb-3" />
                            <h3 className="text-xl font-semibold mb-2">নতুন কোর্স খুঁজুন</h3>
                            <p className="text-blue-100">হাজারো কোর্স ব্রাউজ করুন এবং নতুন কিছু শিখুন</p>
                        </div>
                    </Link>
                    
                    <Link href="/dashboard/enrolled-courses">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all cursor-pointer">
                            <BarChart3 size={32} className="mb-3" />
                            <h3 className="text-xl font-semibold mb-2">আমার অগ্রগতি</h3>
                            <p className="text-green-100">আপনার কোর্স অগ্রগতি এবং পারফরম্যান্স দেখুন</p>
                        </div>
                    </Link>
                </div>
            </div>
        );
    }

    // Teacher/Admin Dashboard
    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    স্বাগতম, {user?.name || 'ইন্সট্রাক্টর'}!
                </h1>
                <p className="text-gray-600">
                    আপনার কোর্স এবং শিক্ষার্থীদের পরিচালনা করুন
                </p>
            </div>

            {/* Teacher Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen size={32} />
                        <span className="text-3xl font-bold">{stats?.totalCourses || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold">মোট কোর্স</h3>
                    <p className="text-blue-100 text-sm">তৈরি কোর্স</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={32} />
                        {console.log(stats)}
                        <span className="text-3xl font-bold">{stats?.totalStudents || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold">মোট শিক্ষার্থী</h3>
                    <p className="text-green-100 text-sm">এনরোল করা শিক্ষার্থী</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={32} />
                        <span className="text-3xl font-bold">৳{stats?.totalRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold">মোট আয়</h3>
                    <p className="text-yellow-100 text-sm">কোর্স থেকে আয়</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <BarChart3 size={32} />
                        <span className="text-3xl font-bold">{stats?.activeCourses || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold">সক্রিয় কোর্স</h3>
                    <p className="text-purple-100 text-sm">শিক্ষার্থী সহ কোর্স</p>
                </div>
            </div>

            {/* My Courses Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">আমার কোর্সসমূহ</h2>
                    <div className="flex gap-3">
                        <Link href="/teacher/courses/create">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-xl transition-all cursor-pointer">
                                <Plus size={20} />
                                নতুন কোর্স
                            </span>
                        </Link>
                        <Link href="/teacher/courses">
                            <span className="text-[#f97316] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                                সব দেখুন →
                            </span>
                        </Link>
                    </div>
                </div>

                {recentCourses.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            এখনও কোনো কোর্স তৈরি করেননি
                        </h3>
                        <p className="text-gray-600 mb-6">
                            আপনার প্রথম কোর্স তৈরি করুন এবং শেখানো শুরু করুন
                        </p>
                        <Link href="/teacher/courses/create">
                            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-xl transition-all cursor-pointer">
                                <Plus size={20} />
                                কোর্স তৈরি করুন
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                            >
                                <div className="relative h-40">
                                    <img
                                        src={course.thumbnail 
                                            ? `${API_BASE_URL}/${course.thumbnail}` 
                                            : 'https://placehold.co/400x240/e2e8f0/64748b?text=Course'}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Users size={12} />
                                            {course._count?.enrollments || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {course._count?.enrollments || 0} শিক্ষার্থী
                                        </span>
                                        <span className="font-bold text-[#f97316]">
                                            {course.isFree ? 'ফ্রি' : `৳${course.price}`}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/course/${course.slug}`} className="flex-1">
                                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-[#f97316] hover:text-[#f97316] transition-colors">
                                                <Eye size={16} />
                                                দেখুন
                                            </button>
                                        </Link>
                                        <Link href={`/teacher/courses/edit/${course.id}`} className="flex-1">
                                            <button className="w-full px-3 py-2 bg-[#f97316] text-white font-semibold rounded-lg hover:bg-[#ea670c] transition-colors">
                                                এডিট
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/teacher/courses/create">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all cursor-pointer">
                        <Plus size={32} className="mb-3" />
                        <h3 className="text-xl font-semibold mb-2">নতুন কোর্স তৈরি করুন</h3>
                        <p className="text-blue-100">আপনার জ্ঞান শেয়ার করুন</p>
                    </div>
                </Link>
                
                <Link href="/teacher/courses">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all cursor-pointer">
                        <BookOpen size={32} className="mb-3" />
                        <h3 className="text-xl font-semibold mb-2">কোর্স পরিচালনা করুন</h3>
                        <p className="text-green-100">আপনার সব কোর্স দেখুন</p>
                    </div>
                </Link>
                
                <Link href="/teacher/analytics">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all cursor-pointer">
                        <BarChart3 size={32} className="mb-3" />
                        <h3 className="text-xl font-semibold mb-2">এনালিটিক্স</h3>
                        <p className="text-purple-100">পারফরম্যান্স দেখুন</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}