"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Facebook, Youtube, Linkedin, BookOpen, CheckCircle, ArrowLeft, ArrowRight, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';

const API_BASE_URL = 'https://api.microskill.com.bd';

export default function TeacherProfileBySlug() {
    const { slug } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [teacherCourses, setTeacherCourses] = useState([]);
    const [randomTeachers, setRandomTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ১. সকল টিচার এবং কোর্স ফেচ করা
                const [teachersRes, coursesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/teachers`),
                    fetch(`${API_BASE_URL}/api/courses`)
                ]);

                const teachersData = await teachersRes.json();
                const coursesData = await coursesRes.json();

                // ২. কারেন্ট টিচার খুঁজে বের করা
                const currentTeacher = teachersData.find(t => t.username === slug);
                setTeacher(currentTeacher);

                if (currentTeacher) {
                    // ৩. এই টিচারের কোর্সগুলো ফিল্টার করা (Instructor FullName বা ID দিয়ে)
                    const filteredCourses = coursesData.filter(course => 
                        course.instructor?.fullName === currentTeacher.fullName
                    );
                    setTeacherCourses(filteredCourses);

                    // ৪. র‍্যান্ডম ৩ জন টিচার সিলেক্ট করা (নিজে বাদে)
                    const others = teachersData
                        .filter(t => t.username !== slug)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3);
                    setRandomTeachers(others);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) return <div className="text-center py-20">লোড হচ্ছে...</div>;
    if (!teacher) return <div className="text-center py-20 font-bold">প্রশিক্ষক পাওয়া যায়নি।</div>;

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header - আগের মতই থাকবে */}
            <div className="bg-[#062c25] text-white pt-16 pb-28 px-4 relative overflow-hidden">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <img 
                        src={teacher.profilePhoto ? `${API_BASE_URL}/${teacher.profilePhoto}` : 'https://placehold.co/200x200'} 
                        className="w-48 h-48 rounded-xl object-cover border-4 border-[#0a4238] shadow-2xl"
                        alt={teacher.fullName}
                    />
                    <div className="flex-1 text-center md:text-left">
                        <Link href="/teachers" className="inline-flex items-center text-emerald-400 text-sm mb-4 hover:text-emerald-300">
                            <ArrowLeft size={16} className="mr-1" /> সকল প্রশিক্ষক
                        </Link>
                        <h1 className="text-4xl font-bold mb-2">{teacher.fullName}</h1>
                        <p className="text-[#f97316] font-medium text-lg mb-4">{teacher.subjects?.join(', ')}</p>
                        <div className="flex justify-center md:justify-start gap-5">
                            <Facebook size={22} className="cursor-pointer hover:text-[#f97316]" />
                            <Linkedin size={22} className="cursor-pointer hover:text-[#f97316]" />
                            <Youtube size={22} className="cursor-pointer hover:text-[#f97316]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* পরিচিতি */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">পরিচিতি</h2>
                            <p className="text-slate-600 leading-relaxed">{teacher.detailedBio || teacher.shortBio}</p>
                        </div>

                        {/* টিচারের কোর্সসমূহ */}
                        {teacherCourses.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">আমার কোর্সসমূহ ({teacherCourses.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {teacherCourses.map(course => (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                                            <img src={`${API_BASE_URL}/${course.thumbnail}`} className="w-full h-40 object-cover" alt={course.title} />
                                            <div className="p-4">
                                                <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{course.title}</h3>
                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                                    <span className="flex items-center"><Users size={14} className="mr-1" /> {course._count?.enrollments} শিক্ষার্থী</span>
                                                    <span className="flex items-center"><Clock size={14} className="mr-1" /> {course.duration}</span>
                                                </div>
                                                <Link href={`/courses/${course.slug}`} className="w-full block text-center bg-slate-100 text-slate-800 py-2 rounded-lg font-semibold group-hover:bg-[#f97316] group-hover:text-white transition-all">
                                                    কোর্সটি দেখুন
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <aside className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <BookOpen className="mr-2 text-[#ea670c]" size={22} /> এক নজরে
                            </h3>
                            <div className="space-y-4 text-sm">
                                {console.log(teacher)
                                }
                                <div className="flex justify-between border-b pb-2"><span className='text-black'>ভাষা</span><span className="font-bold text-black">{teacher.preferredLanguage}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className='text-black'>মোড</span><span className="font-bold text-black">{teacher.teachingMode}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className='text-black'>ইউজার</span><span className="font-bold text-black">@{teacher.username}</span></div>
                      
                                <div className="flex justify-between"><span className='text-black'>ই-মেইল</span><span className="font-bold text-black">{teacher.email}</span></div>
                            </div>
                            {/* সরাসরি কল করার বাটন */}
<a 
    href={`tel:${teacher.mobileNumber}`} 
    className="w-full mt-8 bg-[#f97316] text-white py-4 rounded-xl font-bold hover:bg-[#c2570c] transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 group"
>
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="group-hover:animate-bounce"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
    সরাসরি কল করুন
</a>
                        </div>
                    </aside>
                </div>

                {/* অন্যান্য শিক্ষক (Random 3 Teachers) */}
                <section className="mt-20">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">অন্যান্য দক্ষ প্রশিক্ষকবৃন্দ</h2>
                            <p className="text-slate-500">আপনার পছন্দের আরও মেন্টর খুঁজে নিন</p>
                        </div>
                        <Link href="/teachers" className="text-[#f97316] font-bold flex items-center hover:underline">
                            সবাইকে দেখুন <ArrowRight size={18} className="ml-1" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {randomTeachers.map(t => (
                            <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-xl transition-all duration-300">
                                <img 
                                    src={`${API_BASE_URL}/${t.profilePhoto}`} 
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-slate-50" 
                                    alt={t.fullName} 
                                />
                                <h4 className="text-xl font-bold text-slate-800 line-clamp-1">{t.fullName}</h4>
                                <p className="text-[#ea670c] text-sm mb-4 font-medium">{t.subjects?.[0]}</p>
                                <Link href={`/teachers/${t.username}`} className="inline-block px-6 py-2 border-2 border-[#f97316] text-[#f97316] rounded-full font-bold hover:bg-[#f97316] hover:text-white transition-all">
                                    প্রোফাইল দেখুন
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}