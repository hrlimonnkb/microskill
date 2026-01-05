"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const TableSkeleton = () => (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
        {/* Skeleton code remains here */}
    </SkeletonTheme>
);

export default function AllCoursesPage() {
    const { user, token, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        const fetchCourses = async () => {
            if (!user) {
                setError("Please log in to view courses.");
                setLoading(false);
                return;
            }

            let fetchUrl = '';
            if (user.role.toUpperCase() === 'ADMIN') {
                fetchUrl = `${API_BASE_URL}/api/courses`;
            } else if (user.role.toUpperCase() === 'TEACHER') {
                fetchUrl = `${API_BASE_URL}/api/courses/my-courses`;
            } else {
                setError("You do not have permission to view this page.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(fetchUrl, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch courses.');
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [authLoading, user, token]);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete course.");
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (authLoading || loading) return <div className="container mx-auto p-8"><TableSkeleton /></div>;
    if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user?.role.toUpperCase() === 'ADMIN' ? 'All Courses' : 'My Courses'}
                    </h1>
                    <p className="mt-1 text-gray-600">
                        {user?.role.toUpperCase() === 'ADMIN' ? 'Manage all courses in the system.' : 'Manage the courses created by you.'}
                    </p>
                </div>
                <Link href="/dashboard/courses/add" passHref>
                   <span className="bg-[#ea670c] text-white font-bold py-2 px-4 rounded-md hover:bg-[#c2570c]">Add New Course</span>
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            {/* Table Headers */}
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Instructor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Price</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-16">
                                                <img className="h-10 w-16 rounded object-cover" src={course.thumbnail ? `${API_BASE_URL}/${course.thumbnail}` : 'https://placehold.co/100x60/e2e8f0/64748b?text=Course'} alt={course.title} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{course.title}</div>
                                                <div className="text-sm text-gray-500">{course.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.instructor?.fullName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        {course.isFree ? <span className="text-green-600">Free</span> : `BDT ${course.price}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link href={`/courses/${course.slug}`} passHref>
                                                <span className="p-2 text-gray-500 hover:text-[#ea670c] rounded-full" title="View Course"><Eye size={18} /></span>
                                            </Link>
                                            {(user?.role.toUpperCase() === 'TEACHER' || user?.id === course.instructor.userId) && (
                                                <>
                                                    <Link href={`/dashboard/courses/edit/${course.slug}`} passHref>
                                                        <span className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Edit Course"><Edit size={18} /></span>
                                                    </Link>
                                                    <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full" title="Delete Course">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}