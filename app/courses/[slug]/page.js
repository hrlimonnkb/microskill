// ============================================
// File 2: app/courses/[slug]/page.jsx (Single Course)
// ============================================
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { User, Clock, PlayCircle, Lock, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import VideoModal from '@/components/VideoModal';
const iframeStyles = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    border: 'none',
    backgroundColor: 'black'
};
const API_BASE_URL = 'https://api.microskill.com.bd';

const Skeleton = ({ className }) => <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />;

const FormSection = ({ title, icon, children }) => (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800 mb-5 flex items-center">{icon}{title}</h2>
        <div className="space-y-4">{children}</div>
    </section>
);

const parseIntroVideo = (introVideo) => {
    if (!introVideo) return null;

    // যদি URL-এ সরাসরি .m3u8 বা .mpd থাকে, তবে সেটাকে embed URL-এ রূপান্তর করতে হবে আইফ্রেমের জন্য
    if (typeof introVideo === 'string' && introVideo.includes('video.gumlet.io')) {
        const parts = introVideo.split('/');
        const assetId = parts[parts.length - 2]; // URL থেকে অ্যাসেট আইডি বের করা
        if (assetId) {
            console.log("🔄 Converting .m3u8 to Embed URL for Iframe:", assetId);
            return `https://play.gumlet.io/embed/${assetId}`;
        }
    }

    if (typeof introVideo === 'string' && (introVideo.startsWith('http://') || introVideo.startsWith('https://'))) {
        return introVideo;
    }

    try {
        const parsed = typeof introVideo === 'string' ? JSON.parse(introVideo) : introVideo;
        return parsed.playbackUrl || `https://play.gumlet.io/embed/${parsed.assetId || introVideo}`;
    } catch (e) {
        return `https://play.gumlet.io/embed/${introVideo}`;
    }
};

export default function CoursePage() {
    const params = useParams();
    const slug = params?.slug;
    const router = useRouter();
    const [modalPlaybackUrl, setModalPlaybackUrl] = useState(null);
    const [modalLicenseUrl, setModalLicenseUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalUserEmail, setModalUserEmail] = useState(null);
    const [showIntroVideo, setShowIntroVideo] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [introVideoUrl, setIntroVideoUrl] = useState('');
    const [openSections, setOpenSections] = useState({});
    const [modalVideoUrl, setModalVideoUrl] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [relatedCourses, setRelatedCourses] = useState([]);
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
                // Fetch Related Courses
                const relRes = await fetch(`${API_BASE_URL}/api/courses`);
                if (relRes.ok) {
                    const allCourses = await relRes.json();
                    const filtered = allCourses.filter(c =>
                        (c.category === data.category || c.instructorId === data.instructorId) && c.id !== data.id
                    ).slice(0, 3); // সর্বোচ্চ ৩টি কোর্স দেখাবে
                    setRelatedCourses(filtered);
                }
                const parsedIntroUrl = parseIntroVideo(data.introVideo);
                if (parsedIntroUrl) {
                    setIntroVideoUrl(parsedIntroUrl);
                }
                console.log('Intro Video URL parsed:', parsedIntroUrl); // ডিবাগ: URL চেক করো, Gumlet embed কিনা দেখো
                if (data.sections?.[0]) {
                    setOpenSections({ [data.sections[0].id]: true });
                }

                // ✅ Check enrollment status
                await checkEnrollmentStatus(data.id);

            } catch (err) {
                setError(err.message);
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [slug]);

    // ✅ Check if user is enrolled
    // ✅ Check if user is enrolled
    const checkEnrollmentStatus = async (courseId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log('⚠️ No token found - user not logged in');
                setIsEnrolled(false);
                return;
            }

            console.log('🔑 Token found:', token.substring(0, 20) + '...');

            const res = await fetch(`${API_BASE_URL}/api/courses/check-enrollment/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Check enrollment response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                setIsEnrolled(data.isEnrolled);
                console.log('✅ Enrollment status:', data.isEnrolled);
            }
        } catch (err) {
            console.error('Error checking enrollment:', err);
        }
    };

    // ✅ Enroll in course
    const handleEnroll = async () => {
        try {
            const token = localStorage.getItem('authToken');

            console.log('🔐 Enrolling with token:', token ? 'Token exists' : 'No token');

            if (!token) {
                console.log('⚠️ Not logged in - redirecting to login');
                window.location.href = '/login';
                return;
            }

            // ✅ Checkout page এ redirect করো
            console.log('🛒 Redirecting to checkout for course:', course.slug);
            router.push(`/checkout/${course.slug}`);
            return;

        } catch (err) {
            console.error('Enroll error:', err);
            alert('এনরোল করতে সমস্যা হয়েছে');
        }
    };

    const handleLessonSelect = async (lesson) => {
        // ✅ Enrollment check করো
        if (lesson.isLocked && !isEnrolled) {
            alert('এই লেসনটি দেখতে কোর্সে এনরোল করুন।');
            return;
        }

        console.log('🎬 Lesson clicked:', lesson.id, lesson.title);

        try {
            const token = localStorage.getItem('authToken'); // ✅ Token নাও

            if (!token) {
                alert('প্রথমে লগইন করুন');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/courses/get-video-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ Token পাঠাও
                },
                body: JSON.stringify({ lessonId: lesson.id })
            });

            console.log('📡 API Response status:', res.status);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Unknown error' }));
                console.error('❌ API Error:', errData);
                throw new Error(errData.message || 'Failed to fetch video URL');
            }

            const data = await res.json();
            console.log('✅ Backend returned:', data);

 // ব্যাকএন্ড থেকে playbackUrl অথবা embedUrl যেকোনো একটি এলেই সেটা গ্রহণ করবে
const videoUrl = data.embedUrl || data.playbackUrl;

if (!data.success || !videoUrl) {
    console.error("❌ API returned missing video data:", data);
    throw new Error('ভিডিও লিংক পাওয়া যায়নি');
}

let finalPlaybackUrl = videoUrl;

// যদি সরাসরি .m3u8 লিংক আসে, সেটাকে আইফ্রেমের জন্য এমবেড লিংকে কনভার্ট করা
if (finalPlaybackUrl.includes('video.gumlet.io')) {
    const urlParts = finalPlaybackUrl.split('/');
    const assetIdFromUrl = urlParts[urlParts.length - 2];
    finalPlaybackUrl = `https://play.gumlet.io/embed/${assetIdFromUrl}`;
} 
// যদি শুধু আইডি আসে তবে এমবেড ফরম্যাট করা
else if (!finalPlaybackUrl.startsWith('http')) {
    finalPlaybackUrl = `https://play.gumlet.io/embed/${finalPlaybackUrl}`;
}

console.log("🎯 Setting Modal Playback URL:", finalPlaybackUrl);
setModalPlaybackUrl(finalPlaybackUrl);
setModalLicenseUrl(data.licenseUrl || null);
            setModalUserEmail(data.userEmail || null); // ✅ User email save করো
            setIsModalOpen(true);

        } catch (err) {
            console.error('❌ Fetch error:', err);
            alert(`ভিডিও লোড করতে সমস্যা হয়েছে: ${err.message}`);
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
{/* Intro Video Player - Final Force Fit Fix */}
{/* Intro Video Player - Final Solution */}
<div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl">
    {/* এটা নিশ্চিত করবে ১৬:৯ রেশিও এবং কোনো গ্যাপ থাকবে না */}
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        {showIntroVideo && introVideoUrl ? (
            <iframe
                src={`${introVideoUrl}${introVideoUrl.includes('?') ? '&' : '?'}autoplay=1`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Course intro video"
            />
        ) : (
            <div
                className="absolute inset-0 cursor-pointer group"
                onClick={() => {
                    if (introVideoUrl) {
                        setShowIntroVideo(true);
                    }
                }}
            >
                {/* Thumbnail */}
                {course.thumbnail ? (
                    <img
                        src={`${API_BASE_URL}/${course.thumbnail}`}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                        <p className="text-slate-400">No preview available</p>
                    </div>
                )}

                {/* Overlay & Play Button */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transition group-hover:scale-110">
                        <PlayCircle className="w-10 h-10 text-[#f97316]" />
                    </div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/60 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                        কোর্স প্রিভিউ দেখুন
                    </span>
                </div>
            </div>
        )}
    </div>
</div>

                        {/* Course Title */}
                        <header>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
                            <p className="text-slate-600">{course.description}</p>
                        </header>

                        {/* Learning Objectives */}
                        {course.outcomes && (
                            <FormSection title="যা শিখবেন" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]" />}>
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
                        <FormSection title="কোর্স সিলেবাস" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]" />}>
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
                                                    // ✅ Enrolled হলে সব lesson unlock, না হলে শুধু first lesson free
                                                    const isLocked = !isEnrolled && !(sectionIndex === 0 && lessonIndex === 0);

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
                        {/* Instructor Info - Enhanced UI */}
                        {course.instructor && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mt-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">ইন্সট্রাক্টর পরিচিতি</h2>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Profile Photo & Socials */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-100 mb-3">
                                            <img
                                                src={`${API_BASE_URL}/${course.instructor.profilePhoto}`}
                                                alt={course.instructor.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            {/* সোশ্যাল আইকনগুলো স্ট্যাটিক রাখা হলো, ডাটাবেজে থাকলে ম্যাপ করতে পারেন */}
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded cursor-pointer hover:bg-blue-100 transition"><User size={18} /></div>
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded cursor-pointer hover:bg-emerald-100 transition"><PlayCircle size={18} /></div>
                                        </div>
                                    </div>

                                    {/* Right: Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <h3 className="text-2xl font-bold text-slate-900">{course.instructor.fullName}</h3>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm font-medium">ডিজিটাল মার্কেটিং</span>
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm font-medium">মেটা এডস</span>
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm font-medium">গুগল এডস</span>
                                        </div>

                                        <div className="space-y-3 text-slate-700 leading-relaxed">
                                            <p className="font-semibold text-[#ea670c]">{course.instructor.shortBio}</p>
                                            <p className="text-sm">{course.instructor.detailedBio || "প্রফেশনাল মিডিয়া স্ট্র্যাটেজি এবং প্ল্যানিং বিশেষজ্ঞ।"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Related Courses Section */}
                        {relatedCourses.length > 0 && (
                            <section className="mt-12">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">রিলেটেড কোর্সসমূহ</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedCourses.map((relCourse) => (
                                        <Link href={`/courses/${relCourse.slug}`} key={relCourse.id} className="group">
                                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                                                <div className="aspect-video relative">
                                                    <img
                                                        src={`${API_BASE_URL}/${relCourse.thumbnail}`}
                                                        alt={relCourse.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-slate-800 line-clamp-1">{relCourse.title}</h4>
                                                    <p className="text-[#ea670c] font-bold mt-2">৳ {relCourse.price}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 relative">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 sticky top-24 z-10">

                            <div className="mb-6">
                                <p className="text-3xl font-bold text-slate-900 mb-2">
                                    {course.isFree ? 'ফ্রি কোর্স' : `৳ ${course.price}`}
                                </p>
                                {!course.isFree && (
                                    <p className="text-sm text-slate-500 line-through">৳ {Math.round(course.price * 1.5)}</p>
                                )}
                            </div>

                            {isEnrolled ? (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
                                    <p className="font-semibold">✅ আপনি এনরোল করেছেন</p>
                                    <p className="text-sm mt-1">সব লেসন এখন আনলক</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrollmentLoading}
                                    className="w-full bg-[#f97316] hover:bg-[#c2570c] text-white font-bold py-3 px-4 rounded-lg mb-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {enrollmentLoading ? (
                                        <span className="flex items-center justify-center">
                                            <span className="animate-spin mr-2">⏳</span>
                                            অপেক্ষা করুন...
                                        </span>
                                    ) : (
                                        course.isFree ? 'ফ্রিতে এনরোল করুন' : `৳${course.price} - এখনই কিনুন`
                                    )}
                                </button>
                            )}

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
                isOpen={isModalOpen && modalPlaybackUrl}
                playbackUrl={modalPlaybackUrl || ''}
                licenseUrl={modalLicenseUrl || ''}
                userEmail={modalUserEmail} // ✅ User email pass করো
                onClose={() => {
                    setIsModalOpen(false);
                    setModalPlaybackUrl(null);
                    setModalLicenseUrl(null);
                    setModalUserEmail(null); // ✅ Email clear করো
                }}
            />
        </div>
    );
}