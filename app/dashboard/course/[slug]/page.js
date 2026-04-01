"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    PlayCircle, ChevronLeft, FileText, Bookmark, Menu, X, CheckCircle, Plus, Trash2
} from 'lucide-react';

const API_BASE_URL = 'https://api.microskill.com.bd';

export default function CoursePlayerPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // ✅ Teacher check — role TEACHER বা ADMIN হলে teacher view
   // ✅ Teacher check — role TEACHER/ADMIN এবং এই কোর্সের instructor হলেই teacher view
const [isOwnCourse, setIsOwnCourse] = useState(false);
const isTeacher = isOwnCourse && (user?.role === 'TEACHER' || user?.role === 'ADMIN');

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [activeTab, setActiveTab] = useState('notes');
    const [openSections, setOpenSections] = useState({});

    // ✅ Resources State
    const [lessonResources, setLessonResources] = useState([]);

    // ✅ Teacher — Add Resource State
    const [resType, setResType] = useState('link');
    const [resTitle, setResTitle] = useState('');
    const [resContent, setResContent] = useState('');
    const [savingResource, setSavingResource] = useState(false);

    // ✅ Progress & Notes State (Student only)
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [courseProgress, setCourseProgress] = useState(null);
    const [savedNotes, setSavedNotes] = useState([]);
    const [savingNote, setSavingNote] = useState(false);

    // ✅ Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const videoRef = useRef(null);

    // ============================================================
    // useEffects
    // ============================================================

    useEffect(() => {
        console.log('🎯 Component mounted, fetching course data...');
        console.log('👤 User role:', user?.role, '| isTeacher:', isTeacher);
        fetchCourseData();
    }, [slug]);

    useEffect(() => {
        if (currentLesson && course) {
            fetchLessonResources();

            // Student only features
            if (!isTeacher) {
                fetchLessonProgress();
                fetchLessonNotes();
            }

            // ✅ Auto open the section that contains current lesson
            const parentSection = course.sections?.find(section =>
                section.lessons?.some(lesson => lesson.id === currentLesson.id)
            );
            if (parentSection) {
                setOpenSections(prev => ({
                    ...prev,
                    [parentSection.id]: true
                }));
            }
        }
    }, [currentLesson]);

    // ✅ Triggers video load when lesson changes
    useEffect(() => {
        if (currentLesson) {
            loadLessonVideo();
        }
    }, [currentLesson]);

    // ✅ Teacher default tab = resources, Student = notes
    useEffect(() => {
        if (isTeacher) {
            setActiveTab('resources');
        } else {
            setActiveTab('notes');
        }
    }, [isTeacher]);

    // ============================================================
    // Toggle Section
    // ============================================================

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // ============================================================
    // Fetch Course Data
    // ============================================================

    const fetchCourseData = async () => {
        try {
            console.log('\n=== 🎬 Fetching Course Data ===');
            console.log('Slug:', slug);

            const token = localStorage.getItem('authToken');
            console.log('Token exists:', !!token);

            if (!token) {
                console.error('❌ No token found, redirecting to login');
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📥 Response Status:', response.status);
            console.log('📥 Response OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`কোর্স লোড করতে সমস্যা হয়েছে (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('✅ Course Data Received:', data);
            console.log('📚 Sections:', data.sections?.length || 0);
            console.log('📝 First Lesson:', data.sections?.[0]?.lessons?.[0]?.title || 'No lessons');

            setCourse(data);

            // ✅ Check: এই course কি এই teacher এর নিজের?
            if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
                const token = localStorage.getItem('authToken');
                try {
                    const ownerCheck = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (ownerCheck.ok) {
                        const myCourses = await ownerCheck.json();
                        const owned = myCourses.some(c => c.id === data.id);
                        setIsOwnCourse(owned);
                        console.log('🔑 Is own course:', owned, '| Course ID:', data.id);
                    }
                } catch (err) {
                    console.error('❌ Course ownership check failed:', err);
                    setIsOwnCourse(false);
                }
            }

            if (data.sections?.[0]?.lessons?.[0]) {
                console.log('✅ Setting first lesson:', data.sections[0].lessons[0].title);
                setCurrentLesson(data.sections[0].lessons[0]);
            } else {
                console.warn('⚠️ No lessons found in course');
            }

            setLoading(false);
            console.log('✅ Course loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching course:', error);
            console.error('❌ Error details:', error.message);
            setModalMessage(`❌ কোর্স লোড করতে সমস্যা: ${error.message}`);
            setShowSuccessModal(true);
            setLoading(false);
        }
    };

    // ============================================================
    // Load Lesson Video
    // ============================================================

    const loadLessonVideo = async () => {
        if (!currentLesson) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No token');

            const response = await fetch(`${API_BASE_URL}/api/courses/get-video-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ lessonId: currentLesson.id })
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'URL নেই');

            setVideoUrl(data.embedUrl);
            console.log('✅ Embed URL set:', data.embedUrl);

        } catch (error) {
            console.error('❌ loadLessonVideo failed:', error);
            setModalMessage(`❌ ভিডিও লোড করতে সমস্যা: ${error.message}`);
            setShowSuccessModal(true);
        }
    };

    // ============================================================
    // Navigation
    // ============================================================

    const handleLessonClick = (lesson) => {
        setCurrentLesson(lesson);
    };

    const handlePrevious = () => {
        if (!course || !currentLesson) return;
        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex > 0) setCurrentLesson(allLessons[currentIndex - 1]);
    };

    const handleNext = () => {
        if (!course || !currentLesson) return;
        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < allLessons.length - 1) setCurrentLesson(allLessons[currentIndex + 1]);
    };

    // ============================================================
    // Fetch Resources (both teacher & student)
    // ============================================================

    const fetchLessonResources = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('📎 Fetching resources for lesson:', currentLesson.id);

            const response = await fetch(`${API_BASE_URL}/api/resources/lesson/${currentLesson.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLessonResources(data.resources || []);
                console.log('✅ Resources loaded:', data.resources.length);
            } else {
                console.warn('⚠️ Could not fetch resources:', response.status);
                setLessonResources([]);
            }
        } catch (error) {
            console.error('❌ Error fetching resources:', error);
            setLessonResources([]);
        }
    };

    // ============================================================
    // Teacher — Add Resource
    // ============================================================

    const addResource = async () => {
        if (!resTitle.trim()) {
            setModalMessage('❌ Title আবশ্যক');
            setShowSuccessModal(true);
            return;
        }
        if (resType === 'link' && !resContent.trim()) {
            setModalMessage('❌ Link URL দিন');
            setShowSuccessModal(true);
            return;
        }

        setSavingResource(true);

        try {
            const token = localStorage.getItem('authToken');
            console.log('💾 Saving resource...', {
                courseId: course.id,
                lessonId: currentLesson.id,
                type: resType,
                title: resTitle
            });

            const response = await fetch(`${API_BASE_URL}/api/resources/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: course.id,
                    lessonId: currentLesson.id,
                    type: resType,
                    title: resTitle,
                    content: resContent
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Resource saved:', data.resource.id);
                setModalMessage('✅ Resource সফলভাবে যোগ হয়েছে!');
                setShowSuccessModal(true);
                setResTitle('');
                setResContent('');
                fetchLessonResources();
            } else {
                setModalMessage(`❌ ${data.message}`);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('❌ Error saving resource:', error);
            setModalMessage('❌ Resource সেভ করতে সমস্যা হয়েছে');
            setShowSuccessModal(true);
        } finally {
            setSavingResource(false);
        }
    };

    // ============================================================
    // Teacher — Delete Resource
    // ============================================================

    const deleteResource = async (resourceId) => {
        if (!window.confirm('এই resource ডিলিট করবেন?')) return;

        try {
            const token = localStorage.getItem('authToken');
            console.log('🗑️ Deleting resource:', resourceId);

            const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Resource deleted');
                setModalMessage('✅ Resource ডিলিট হয়েছে');
                setShowSuccessModal(true);
                fetchLessonResources();
            } else {
                setModalMessage(`❌ ${data.message}`);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            setModalMessage('❌ ডিলিট করতে সমস্যা হয়েছে');
            setShowSuccessModal(true);
        }
    };

    // ============================================================
    // Fetch Lesson Progress (Student only)
    // ============================================================

    const fetchLessonProgress = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/progress/lesson/${currentLesson.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLessonCompleted(data.progress?.completed || false);
                console.log('📊 Lesson progress loaded:', data.progress);
            }
        } catch (error) {
            console.error('Error fetching lesson progress:', error);
        }
    };

    // ============================================================
    // Fetch Lesson Notes (Student only)
    // ============================================================

    const fetchLessonNotes = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/notes/lesson/${currentLesson.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedNotes(data.notes || []);
                console.log('📝 Loaded notes:', data.notes.length);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    // ============================================================
    // Mark Lesson Complete (Student only)
    // ============================================================

    const markLessonComplete = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('📝 Marking lesson as complete...');

            const response = await fetch(`${API_BASE_URL}/api/progress/lesson/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lessonId: currentLesson.id,
                    courseId: course.id,
                    watchedDuration: 0
                })
            });

            if (!response.ok) throw new Error('Failed to mark lesson complete');

            const data = await response.json();

            setLessonCompleted(true);
            setCourseProgress(data.courseProgress);

            console.log('✅ Lesson completed!', data.courseProgress);

            setModalMessage(`✅ Lesson সম্পন্ন হয়েছে! কোর্স প্রোগ্রেস: ${data.courseProgress.progress}%`);
            setShowSuccessModal(true);

        } catch (error) {
            console.error('❌ Error marking lesson complete:', error);
            setModalMessage('❌ Lesson complete করতে সমস্যা হয়েছে');
            setShowSuccessModal(true);
        }
    };

    // ============================================================
    // Save Note (Student only)
    // ============================================================

    const saveNote = async () => {
        if (!noteTitle.trim() || !noteContent.trim()) {
            alert('নোট টাইটেল এবং কন্টেন্ট লিখুন');
            return;
        }

        setSavingNote(true);

        try {
            const token = localStorage.getItem('authToken');
            console.log('💾 Saving note...');

            const response = await fetch(`${API_BASE_URL}/api/notes/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lessonId: currentLesson.id,
                    courseId: course.id,
                    title: noteTitle,
                    content: noteContent,
                    timestamp: Math.floor(videoRef.current?.currentTime || 0)
                })
            });

            if (!response.ok) throw new Error('Failed to save note');

            const data = await response.json();
            console.log('✅ Note saved!', data.note);

            setModalMessage('✅ নোট সফলভাবে সেভ হয়েছে!');
            setShowSuccessModal(true);
            setNoteTitle('');
            setNoteContent('');
            fetchLessonNotes();

        } catch (error) {
            console.error('❌ Error saving note:', error);
            setModalMessage('❌ নোট সেভ করতে সমস্যা হয়েছে');
            setShowSuccessModal(true);
        } finally {
            setSavingNote(false);
        }
    };

    // ============================================================
    // Delete Note (Student only)
    // ============================================================

    const deleteNote = async (noteId) => {
        if (!window.confirm('এই নোটটি ডিলিট করতে চান?')) return;

        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setModalMessage('✅ নোট ডিলিট হয়েছে');
                setShowSuccessModal(true);
                fetchLessonNotes();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setModalMessage('❌ নোট ডিলিট করতে সমস্যা হয়েছে');
            setShowSuccessModal(true);
        }
    };

    // ============================================================
    // Loading & Error States
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#f97316]"></div>
            </div>
        );
    }

    if (!course || !currentLesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-gray-800 text-xl mb-4">কোর্স লোড করতে সমস্যা হয়েছে</p>
                    <Link href="/dashboard/enrolled-courses">
                        <button className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea670c]">
                            আমার কোর্সে ফিরে যান
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // ============================================================
    // Render
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/enrolled-courses">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <ChevronLeft size={20} className="text-gray-700" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="font-semibold text-gray-900">{course.title}</h1>
                            <p className="text-sm text-gray-500">{currentLesson.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* ✅ Teacher badge */}
                        {isTeacher && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold border border-orange-200">
                                👨‍🏫 Teacher View
                            </span>
                        )}
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            Running Module: 1/1
                        </span>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700">
                            📖 সিলেবাস
                        </button>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700">
                            🎓 প্রোগ্রেস
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex max-w-[1800px] mx-auto">

                {/* ── Sidebar ── */}
                <div className={`${sidebarOpen ? 'w-96' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
                    <div className="p-4">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Search Lesson"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
                            />
                        </div>

                        <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
                            {course.sections?.map((section) => {
                                const isOpen = openSections[section.id] ?? false;
                                return (
                                    <div key={section.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between px-3 py-3 hover:bg-orange-50 transition"
                                        >
                                            <h3 className="text-sm font-semibold text-[#f97316] text-left">
                                                {section.title}
                                            </h3>
                                            <span
                                                className="text-[#f97316] text-xs transition-transform duration-300"
                                                style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                ▼
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div className="px-3 pb-3 space-y-1 border-t border-gray-200 pt-2">
                                                {section.lessons?.map((lesson) => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonClick(lesson)}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                                                            currentLesson.id === lesson.id
                                                                ? 'bg-[#f97316] text-white shadow-md'
                                                                : 'hover:bg-white text-gray-700 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <PlayCircle size={16} />
                                                            <span className="font-medium">{lesson.title}</span>
                                                        </div>
                                                        {lesson.duration && (
                                                            <span className={`text-xs ml-5 ${
                                                                currentLesson.id === lesson.id ? 'text-orange-100' : 'text-gray-500'
                                                            }`}>
                                                                ⏱️ {lesson.duration}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="flex-1 flex flex-col">

                    {/* Video Player */}
                    <div className="bg-black">
                        <div className="relative w-full aspect-video">
                            {videoUrl ? (
                                <iframe
                                    src={videoUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#f97316]" />
                                </div>
                            )}

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition backdrop-blur-sm"
                            >
                                {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                            </button>
                        </div>

                        {/* Controls Bar */}
                        <div className="bg-black border-t border-gray-800 px-6 py-3 flex items-center justify-between gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrevious}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-md transition-all shadow-lg"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-md transition-all shadow-lg"
                                >
                                    Next
                                </button>
                            </div>

                            {/* ✅ Student only: Complete button */}
                            {!isTeacher && (
                                <button
                                    onClick={markLessonComplete}
                                    disabled={lessonCompleted}
                                    className={`px-6 py-2 font-semibold rounded-md transition-all flex items-center gap-2 shadow-lg ${
                                        lessonCompleted
                                            ? 'bg-green-600 text-white cursor-not-allowed'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                                    }`}
                                >
                                    <CheckCircle size={18} />
                                    {lessonCompleted ? '✓ সম্পন্ন হয়েছে' : 'সম্পন্ন করুন'}
                                </button>
                            )}

                            {/* ✅ Teacher hint */}
                            {isTeacher && (
                                <span className="text-orange-400 text-sm font-semibold">
                                    👨‍🏫 Resources ট্যাবে গিয়ে এই lesson এ content যোগ করুন
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Bottom Tabs ── */}
                    <div className="bg-white flex-1 flex flex-col border-t border-gray-200">

                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200 bg-gray-50">

                            {/* ✅ Notes — Student only */}
                            {!isTeacher && (
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`px-6 py-3 text-sm font-semibold transition ${
                                        activeTab === 'notes'
                                            ? 'text-[#f97316] border-b-2 border-[#f97316] bg-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    📝 Notes
                                </button>
                            )}

                            {/* ✅ Bookmarks — Student only */}
                            {!isTeacher && (
                                <button
                                    onClick={() => setActiveTab('bookmarks')}
                                    className={`px-6 py-3 text-sm font-semibold transition ${
                                        activeTab === 'bookmarks'
                                            ? 'text-[#f97316] border-b-2 border-[#f97316] bg-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    🔖 Bookmarks
                                </button>
                            )}

                            {/* ✅ Resources — Both teacher & student */}
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`px-6 py-3 text-sm font-semibold transition ${
                                    activeTab === 'resources'
                                        ? 'text-[#f97316] border-b-2 border-[#f97316] bg-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                📎 Resources
                                {lessonResources.length > 0 && (
                                    <span className="ml-2 bg-[#f97316] text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {lessonResources.length}
                                    </span>
                                )}
                            </button>

                            {/* ✅ Copyright — Both */}
                            <button
                                onClick={() => setActiveTab('copyright')}
                                className={`px-6 py-3 text-sm font-semibold transition ${
                                    activeTab === 'copyright'
                                        ? 'text-[#f97316] border-b-2 border-[#f97316] bg-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                ⚖️ Copyright Warning
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 overflow-y-auto flex-1">

                            {/* ── Notes Tab (Student only) ── */}
                            {activeTab === 'notes' && !isTeacher && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                                        <h2 className="text-xl font-semibold mb-4 text-gray-900">নতুন নোট লিখুন</h2>

                                        <input
                                            type="text"
                                            placeholder="নোট টাইটেল"
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 text-gray-900"
                                        />

                                        <textarea
                                            placeholder="আপনার নোট লিখুন..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg h-40 resize-none focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 mb-4 text-gray-900"
                                        />

                                        <button
                                            onClick={saveNote}
                                            disabled={savingNote}
                                            className="px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                                        >
                                            {savingNote ? 'সেভ হচ্ছে...' : '💾 নোট সেভ করুন'}
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                                            সেভ করা নোটসমূহ ({savedNotes.length})
                                        </h3>

                                        {savedNotes.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500">এখনও কোনো নোট যোগ করা হয়নি</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {savedNotes.map((note) => (
                                                    <div key={note.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#f97316] transition">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                                                            <button onClick={() => deleteNote(note.id)} className="text-red-500 hover:text-red-700 transition">
                                                                <X size={20} />
                                                            </button>
                                                        </div>
                                                        <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>📅 {new Date(note.createdAt).toLocaleDateString('bn-BD')}</span>
                                                            {note.timestamp && (
                                                                <span>⏱️ {Math.floor(note.timestamp / 60)}:{String(note.timestamp % 60).padStart(2, '0')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Bookmarks Tab (Student only) ── */}
                            {activeTab === 'bookmarks' && !isTeacher && (
                                <div className="text-center py-16">
                                    <Bookmark size={56} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 text-lg">এখনও কোনো বুকমার্ক যোগ করা হয়নি</p>
                                </div>
                            )}

                            {/* ── Resources Tab (Teacher: add+manage | Student: view only) ── */}
                            {activeTab === 'resources' && (
                                <div className="max-w-4xl mx-auto">

                                    {/* ✅ TEACHER: Add Resource Form */}
                                    {isTeacher && (
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                                            <h2 className="text-xl font-semibold mb-5 text-gray-900 flex items-center gap-2">
                                                <Plus size={22} className="text-[#f97316]" />
                                                এই Lesson এ Resource যোগ করুন
                                            </h2>

                                            {/* Type Selector */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type *</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { value: 'link', label: '🔗 Link' },
                                                        { value: 'notice', label: '📢 Notice' }
                                                    ].map(t => (
                                                        <button
                                                            key={t.value}
                                                            type="button"
                                                            onClick={() => setResType(t.value)}
                                                            className="px-5 py-2 text-sm font-semibold rounded-lg transition"
                                                            style={resType === t.value
                                                                ? { backgroundColor: '#f97316', color: '#fff' }
                                                                : { backgroundColor: '#f1f5f9', color: '#475569' }}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                                <input
                                                    type="text"
                                                    value={resTitle}
                                                    onChange={e => setResTitle(e.target.value)}
                                                    placeholder={resType === 'link' ? 'যেমন: Assignment PDF Link' : 'যেমন: Important Notice'}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 bg-white"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {resType === 'link' ? 'URL *' : 'Notice Text (optional)'}
                                                </label>
                                                {resType === 'link' ? (
                                                    <input
                                                        type="url"
                                                        value={resContent}
                                                        onChange={e => setResContent(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 bg-white"
                                                    />
                                                ) : (
                                                    <textarea
                                                        value={resContent}
                                                        onChange={e => setResContent(e.target.value)}
                                                        placeholder="Notice এর বিস্তারিত লিখুন..."
                                                        rows={4}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 resize-none bg-white"
                                                    />
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addResource}
                                                disabled={savingResource}
                                                className="px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                {savingResource ? 'যোগ হচ্ছে...' : 'Resource যোগ করুন'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Resource List Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {isTeacher
                                                ? `এই Lesson এর Resources (${lessonResources.length})`
                                                : '📎 Lesson Resources'
                                            }
                                        </h3>
                                        {lessonResources.length > 0 && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                                                {lessonResources.length} টি
                                            </span>
                                        )}
                                    </div>

                                    {/* Resource List */}
                                    {lessonResources.length === 0 ? (
                                        <div className="text-center py-16 bg-gray-50 rounded-xl">
                                            <div className="text-5xl mb-3">📂</div>
                                            <p className="text-gray-500 text-lg">
                                                {isTeacher ? 'এখনো কোনো resource যোগ করা হয়নি' : 'এই lesson এ কোনো resource নেই'}
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {isTeacher
                                                    ? 'উপরের ফর্ম থেকে link বা notice যোগ করুন'
                                                    : 'Instructor এখনো কিছু যোগ করেননি'
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {lessonResources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#f97316] transition"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Icon */}
                                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                                            resource.type === 'link' ? 'bg-blue-100' : 'bg-yellow-100'
                                                        }`}>
                                                            {resource.type === 'link' ? '🔗' : '📢'}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                                    resource.type === 'link'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {resource.type === 'link' ? 'Link' : 'Notice'}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-semibold text-gray-900 text-base">
                                                                {resource.title}
                                                            </h4>

                                                            {resource.content && (
                                                                resource.type === 'link' ? (
                                                                    <a
                                                                        href={resource.content}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline break-all"
                                                                    >
                                                                        {resource.content}
                                                                    </a>
                                                                ) : (
                                                                    <p className="mt-2 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {resource.content}
                                                                    </p>
                                                                )
                                                            )}

                                                            <p className="text-xs text-gray-400 mt-2">
                                                                📅 {new Date(resource.createdAt).toLocaleDateString('bn-BD')}
                                                            </p>
                                                        </div>

                                                        {/* Right Actions */}
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {resource.type === 'link' && resource.content && (
                                                                <a
                                                                    href={resource.content}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                                                                >
                                                                    Open ↗
                                                                </a>
                                                            )}

                                                            {/* ✅ Delete — Teacher only */}
                                                            {isTeacher && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteResource(resource.id)}
                                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Delete resource"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Copyright Tab ── */}
                            {activeTab === 'copyright' && (
                                <div className="max-w-4xl mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-8">
                                    <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                                        ⚠️ কপিরাইট সতর্কতা
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        এই কোর্সের সকল কন্টেন্ট কপিরাইট আইন দ্বারা সুরক্ষিত। কোনো ভিডিও, নোট বা অন্য কোনো উপাদান
                                        কপি, ডিস্ট্রিবিউট বা শেয়ার করা সম্পূর্ণ নিষিদ্ধ। এই নিয়ম লঙ্ঘন করলে আইনি ব্যবস্থা নেওয়া হবে।
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* ── Success / Error Modal ── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                {modalMessage.includes('✅') ? (
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={40} className="text-green-600" />
                                    </div>
                                ) : (
                                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <X size={40} className="text-red-600" />
                                    </div>
                                )}
                            </div>

                            <p className="text-lg font-semibold text-gray-800 mb-6">
                                {modalMessage}
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-xl transition-all"
                            >
                                ঠিক আছে
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}