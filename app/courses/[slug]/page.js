// ============================================
// File 2: app/courses/[slug]/page.jsx (Single Course)
// ============================================
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Clock, PlayCircle, Lock, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import VideoModal from '@/components/VideoModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const Skeleton = ({ className }) => <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />;

const FormSection = ({ title, icon, children }) => (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800 mb-5 flex items-center">{icon}{title}</h2>
        <div className="space-y-4">{children}</div>
    </section>
);

// Helper function to parse intro video data
const parseIntroVideo = (introVideo) => {
    if (!introVideo) return null;
    
    // যদি ব্যাকএন্ড থেকে সরাসরি Signed URL স্ট্রিং আসে
    if (typeof introVideo === 'string' && introVideo.startsWith('http')) {
        return introVideo;
    }

    try {
        const parsed = JSON.parse(introVideo);
        return parsed.playbackUrl || `https://video.gumlet.io/${parsed.assetId}/embed`;
    } catch {
        return `https://video.gumlet.io/${introVideo}/embed`;
    }
};

export default function CoursePage() {
    const params = useParams();
    const slug = params?.slug;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [introVideoUrl, setIntroVideoUrl] = useState('');
    const [openSections, setOpenSections] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVideoUrl, setModalVideoUrl] = useState('');

    useEffect(() => {
        if (!slug) {
            setError('Course slug is missing');
            setLoading(false);
            return;
        }

        const fetchCourse = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`);
                
                if (!response.ok) {
                    throw new Error('Course not found.');
                }
                
                const data = await response.json();
                setCourse(data);

                const parsedIntroUrl = parseIntroVideo(data.introVideo);
                if (parsedIntroUrl) {
                    setIntroVideoUrl(parsedIntroUrl);
                }
                
                if (data.sections?.[0]) {
                    setOpenSections({ [data.sections[0].id]: true });
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [slug]);

    const handleLessonSelect = (lesson) => {
        if (lesson.isLocked) {
            alert("এই লেসনটি দেখার জন্য আপনাকে কোর্সটিতে এনরোল করতে হবে।");
            return;
        }

        const videoUrl = lesson.videoUrl;

        if (videoUrl) {
            setModalVideoUrl(videoUrl);
            setIsModalOpen(true);
        } else {
            alert("ভিডিও পাওয়া যায়নি।");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalVideoUrl('');
    };

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-96 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                <p className="text-red-600 text-xl mb-4">{error}</p>
                <Link href="/courses" className="text-blue-600 hover:underline">
                    কোর্সের পেজে ফিরে যান
                </Link>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-xl mb-4">Course not found</p>
                <Link href="/courses" className="text-blue-600 hover:underline">
                    কোর্সের পেজে ফিরে যান
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
                    <Link href="/courses" className="hover:text-[#ea670c]">কোর্সের বিবরণ</Link>
                    <span className="mx-2">/</span>
                    <span>{course.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content */}
                    <main className="lg:col-span-2 space-y-8">

                        {/* Intro Video Player */}
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
                            {introVideoUrl ? (
                                <iframe
                                    src={introVideoUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Course intro video"
                                />
                            ) : course.thumbnail ? (
                                <img 
                                    src={`${API_BASE_URL}/${course.thumbnail}`} 
                                    alt={course.title} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <p>No preview available</p>
                                </div>
                            )}
                        </div>

                        {/* Course Title */}
                        <header>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
                            <p className="text-slate-600">{course.description}</p>
                        </header>

                        {/* Learning Objectives */}
                        {course.outcomes && (
                            <FormSection title="যা শিখবেন" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <ul className="space-y-2">
                                    {course.outcomes.split(',').map((outcome, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span className="text-slate-700">{outcome.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </FormSection>
                        )}

                        {/* Course Syllabus */}
                        <FormSection title="কোর্স সিলেবাস" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            {course.sections && course.sections.length > 0 ? (
                                course.sections.map((section, sectionIndex) => (
                                    <div key={section.id} className="border-b border-slate-200 last:border-b-0">
                                        <button 
                                            onClick={() => toggleSection(section.id)} 
                                            className="w-full flex justify-between items-center py-4 text-left hover:bg-slate-50 px-2 rounded"
                                            aria-expanded={openSections[section.id]}
                                        >
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                Section {sectionIndex + 1}: {section.title}
                                            </h3>
                                            {openSections[section.id] ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                        
                                        <div className={`overflow-hidden transition-all duration-300 ${openSections[section.id] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                                            <ul className="pl-2 pb-4 space-y-1">
                                                {section.lessons && section.lessons.map((lesson, lessonIndex) => {
                                                    const isLocked = !(sectionIndex === 0 && lessonIndex === 0);

                                                    return (
                                                        <li key={lesson.id}>
                                                            <button 
                                                                onClick={() => handleLessonSelect({ ...lesson, isLocked })} 
                                                                className="w-full text-left flex items-center justify-between p-3 rounded-md hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition" 
                                                                disabled={isLocked}
                                                                aria-label={`${lesson.title} ${isLocked ? '(লক করা)' : ''}`}
                                                            >
                                                                <div className="flex items-center">
                                                                    {isLocked ? (
                                                                        <Lock size={16} className="mr-3 text-slate-400" />
                                                                    ) : (
                                                                        <PlayCircle size={16} className="mr-3 text-green-600" />
                                                                    )}
                                                                    <span className="text-slate-700">{lesson.title}</span>
                                                                </div>
                                                                {lesson.duration && (
                                                                    <span className="text-sm text-slate-500 flex items-center">
                                                                        <Clock size={14} className="mr-1" />
                                                                        {lesson.duration}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-600">কোন সিলেবাস পাওয়া যায়নি।</p>
                            )}
                        </FormSection>

                        {/* Instructor Info */}
                        {course.instructor && (
                            <FormSection title="ইন্সট্রাক্টর সম্পর্কে" icon={<User className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <div className="flex items-start gap-4">
                                    {course.instructor.profilePhoto && (
                                        <img 
                                            src={`${API_BASE_URL}/${course.instructor.profilePhoto}`}
                                            alt={course.instructor.fullName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {course.instructor.fullName}
                                        </h3>
                                        {course.instructor.shortBio && (
                                            <p className="text-slate-600 mt-2">{course.instructor.shortBio}</p>
                                        )}
                                    </div>
                                </div>
                            </FormSection>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                            <div className="mb-6">
                                <p className="text-3xl font-bold text-slate-900 mb-2">
                                    {course.isFree ? 'ফ্রি কোর্স' : `৳ ${course.price}`}
                                </p>
                                {!course.isFree && (
                                    <p className="text-sm text-slate-500 line-through">৳ {Math.round(course.price * 1.5)}</p>
                                )}
                            </div>

                            <button className="w-full bg-[#f97316] hover:bg-[#c2570c] text-white font-bold py-3 px-4 rounded-lg mb-4 transition">
                                {course.isFree ? 'ফ্রিতে শুরু করুন' : 'এখনই কিনুন'}
                            </button>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">মোট লেসন:</span>
                                    <span className="font-semibold">{course.numberOfLessons || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">সময়কাল:</span>
                                    <span className="font-semibold">{course.duration || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">ভাষা:</span>
                                    <span className="font-semibold">{course.language || 'বাংলা'}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Video Modal */}
            <VideoModal 
                isOpen={isModalOpen} 
                videoUrl={modalVideoUrl} 
                onClose={closeModal} 
            />
        </div>
    );
}



