"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Hls from 'hls.js';
import {
    PlayCircle, Lock, ChevronLeft, ChevronRight, BookOpen,
    FileText, Bookmark, ThumbsUp, ThumbsDown, Menu, X, Settings
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

export default function CoursePlayerPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [activeTab, setActiveTab] = useState('notes');
    const [availableQualities, setAvailableQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        fetchCourseData();
    }, [slug]);

    useEffect(() => {
        if (currentLesson) {
            loadLessonVideo();
        }
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [currentLesson]);

    const fetchCourseData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('কোর্স লোড করতে সমস্যা হয়েছে');

            const data = await response.json();
            setCourse(data);

            if (data.sections?.[0]?.lessons?.[0]) {
                setCurrentLesson(data.sections[0].lessons[0]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            setLoading(false);
        }
    };

    const loadLessonVideo = async () => {
        if (!currentLesson) return;

        try {
            const token = localStorage.getItem('authToken');

            console.log('🎬 Loading video for lesson:', currentLesson.id);

            const response = await fetch(`${API_BASE_URL}/api/courses/get-video-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ lessonId: currentLesson.id })
            });

            if (!response.ok) {
                throw new Error('ভিডিও লোড করতে সমস্যা হয়েছে');
            }

            const data = await response.json();

            if (!data.success || !data.playbackUrl) {
                throw new Error('ভিডিও URL পাওয়া যায়নি');
            }

            console.log('✅ Video URL received:', data.playbackUrl);

            setVideoUrl(data.playbackUrl);

            // Load video with HLS.js
            if (videoRef.current && data.playbackUrl) {
                if (Hls.isSupported()) {
                    if (hlsRef.current) {
                        hlsRef.current.destroy();
                    }

                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hls.loadSource(data.playbackUrl);
                    hls.attachMedia(videoRef.current);

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log('✅ Video loaded successfully');
                        
                        // ✅ Get available quality levels
                        const levels = hls.levels.map((level, index) => ({
                            index: index,
                            height: level.height,
                            width: level.width,
                            bitrate: level.bitrate,
                            label: `${level.height}p`
                        }));
                        
                        setAvailableQualities(levels);
                        console.log('📊 Available qualities:', levels);
                    });

                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (data.fatal) {
                            console.error('❌ HLS Error:', data);
                        }
                    });

                    hlsRef.current = hls;
                } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    videoRef.current.src = data.playbackUrl;
                }
            }

        } catch (error) {
            console.error('Error loading video:', error);
            alert(`ভিডিও লোড করতে সমস্যা: ${error.message}`);
        }
    };

    const changeQuality = (qualityIndex) => {
        if (!hlsRef.current) return;

        if (qualityIndex === 'auto') {
            hlsRef.current.currentLevel = -1; // Auto quality
            setCurrentQuality('auto');
            console.log('🎬 Quality set to: Auto');
        } else {
            hlsRef.current.currentLevel = qualityIndex;
            setCurrentQuality(availableQualities[qualityIndex].label);
            console.log('🎬 Quality set to:', availableQualities[qualityIndex].label);
        }

        setShowQualityMenu(false);
    };

    const handleLessonClick = (lesson) => {
        setCurrentLesson(lesson);
    };

    const handlePrevious = () => {
        if (!course || !currentLesson) return;

        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);

        if (currentIndex > 0) {
            setCurrentLesson(allLessons[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (!course || !currentLesson) return;

        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);

        if (currentIndex < allLessons.length - 1) {
            setCurrentLesson(allLessons[currentIndex + 1]);
        }
    };

    const saveNote = () => {
        if (!noteTitle.trim() || !noteContent.trim()) {
            alert('নোট টাইটেল এবং কন্টেন্ট লিখুন');
            return;
        }

        console.log('Saving note:', { noteTitle, noteContent, lessonId: currentLesson.id });
        
        alert('✅ নোট সেভ হয়েছে!');
        setNoteTitle('');
        setNoteContent('');
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
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
                {/* Sidebar - Lesson List */}
                <div className={`${sidebarOpen ? 'w-96' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
                    <div className="p-4">
                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Search Lesson"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
                            />
                        </div>

                        {/* Chapters */}
                        <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
                            {course.sections?.map((section) => (
                                <div key={section.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <h3 className="text-sm font-semibold mb-2 text-[#f97316]">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1">
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Video Player */}
                  {/* Video Player Container */}
                    <div className="bg-black">
                        {/* Video Element */}
                        <div className="relative">
                            <video
                                ref={videoRef}
                                controls
                                controlsList="nodownload"
                                className="w-full aspect-video"
                            />

                            {/* Toggle Sidebar Button */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition backdrop-blur-sm"
                            >
                                {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                            </button>

                            {/* Quality Selector */}
                            <div className="absolute top-4 right-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                                        className="px-4 py-2 bg-black/60 hover:bg-black/80 rounded-lg transition backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2"
                                    >
                                        <Settings size={16} />
                                        {currentQuality}
                                    </button>

                                    {showQualityMenu && (
                                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[150px] z-50">
                                            <button
                                                onClick={() => changeQuality('auto')}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                                                    currentQuality === 'auto' ? 'bg-orange-50 text-[#f97316] font-semibold' : 'text-gray-700'
                                                }`}
                                            >
                                                Auto
                                            </button>
                                            {availableQualities.map((quality, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => changeQuality(index)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                                                        currentQuality === quality.label ? 'bg-orange-50 text-[#f97316] font-semibold' : 'text-gray-700'
                                                    }`}
                                                >
                                                    {quality.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Custom Controls Bar */}
                        <div className="bg-black border-t border-gray-800 px-6 py-3 flex items-center justify-center gap-3">
                            <button
                                onClick={handlePrevious}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-md transition-all flex items-center gap-2 shadow-lg"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-md transition-all flex items-center gap-2 shadow-lg"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    {/* Bottom Section - Tabs */}
                    <div className="bg-white flex-1 flex flex-col border-t border-gray-200">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
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
                            {activeTab === 'notes' && (
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Write Something Amazing...</h2>
                                    
                                    <input
                                        type="text"
                                        placeholder="Note Title"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 text-gray-900"
                                    />

                                    <textarea
                                        placeholder="Write Something Amazing..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg h-64 resize-none focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 mb-4 text-gray-900"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            onClick={saveNote}
                                            className="px-6 py-3 bg-gradient-to-r from-[#f97316] to-[#ea670c] text-white font-semibold rounded-lg hover:shadow-lg transition"
                                        >
                                            Preview & Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bookmarks' && (
                                <div className="text-center py-16">
                                    <Bookmark size={56} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 text-lg">এখনও কোনো বুকমার্ক যোগ করা হয়নি</p>
                                </div>
                            )}

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
        </div>
    );
}