"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Film, Image as ImageIcon, BookOpen, DollarSign, Target, ListChecks, CheckCircle, GripVertical, User, Tag, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

// Reusable Components
const FormSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-5 flex items-center">
            {icon}
            {title}
        </h2>
        <div className="space-y-4">{children}</div>
    </div>
);

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = true, helpText, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 4, helpText, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, children, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900"
        >
            {children}
        </select>
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const FileUploadField = ({ id, onFileSelect, preview, Icon, acceptedFiles, helpText, fileInfo }) => (
    <div className="space-y-2">
        <div
            className={`px-6 py-8 border-2 border-slate-300 border-dashed rounded-lg transition-colors cursor-pointer text-center
                ${preview ? 'border-[#ea670c] bg-orange-50' : 'hover:border-[#ea670c] hover:bg-orange-50'}`}
            onClick={() => document.getElementById(id).click()}
        >
            {preview ? (
                <img src={preview} alt="Preview" className="mx-auto h-28 w-auto rounded-md shadow-md object-contain" />
            ) : (
                <div className="space-y-1">
                    <Icon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="mt-2 block text-sm font-semibold text-[#ea670c]">
                        {fileInfo ? 'Change file' : 'Upload a file'}
                    </div>
                    <div className="block text-xs text-slate-500">or drag and drop</div>
                </div>
            )}
        </div>

        <input
            id={id}
            type="file"
            className="hidden"
            onChange={onFileSelect}
            accept={acceptedFiles}
        />

        {fileInfo && (
            <div className="bg-slate-100 p-2 rounded-md text-xs text-slate-700 text-center">
                <p className="font-medium truncate">{fileInfo.name}</p>
                {fileInfo.size && <p className="text-slate-500">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
        )}
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

export default function EditCoursePage() {
    const { user, loading: authLoading, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [courseId, setCourseId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState(null);
    const [syllabus, setSyllabus] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [introVideo, setIntroVideo] = useState(null);
    const [introVideoPreview, setIntroVideoPreview] = useState('');
    const [existingIntroVideoUrl, setExistingIntroVideoUrl] = useState('');

    // Fetch course data
    useEffect(() => {
        if (!slug) return;

        const fetchCourseData = async () => {
            try {
                setIsLoadingData(true);
                const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`);
                if (!response.ok) throw new Error("Course not found");

                const data = await response.json();

                setCourseId(data.id);
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    category: data.category,
                    language: data.language,
                    instructorName: data.instructor.fullName,
                    instructorBio: data.instructor.shortBio,
                    duration: data.duration,
                    numberOfLessons: data.numberOfLessons,
                    outcomes: data.outcomes ? data.outcomes.split(',') : [''],
                    requirements: data.requirements ? data.requirements.split(',') : [''],
                    price: data.price,
                    isFree: data.isFree,
                });

                setSyllabus(data.sections.map(section => ({
                    ...section,
                    lessons: (section.lessons || []).map(lesson => ({
                        ...lesson,
                        existingVideoUrl: lesson.videoUrl || null,
                        videoFile: null,
                        previewVideoUrl: lesson.videoUrl || null
                    }))
                })));

                setThumbnailPreview(data.thumbnail ? `${API_BASE_URL}/${data.thumbnail}` : '');

                if (data.introVideo) {
                    if (typeof data.introVideo === 'string' && data.introVideo.startsWith('http')) {
                        setExistingIntroVideoUrl(data.introVideo);
                    } else {
                        try {
                            const parsed = JSON.parse(data.introVideo);
                            setExistingIntroVideoUrl(parsed.playbackUrl || `https://video.gumlet.io/${parsed.assetId}/embed`);
                        } catch {
                            setExistingIntroVideoUrl(`https://video.gumlet.io/${data.introVideo}/embed`);
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Error:', err);
                setError(err.message);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchCourseData();
    }, [slug]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleListChange = useCallback((key, index, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].map((item, i) => i === index ? value : item)
        }));
    }, []);

    const addListItem = useCallback((key) => {
        setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
    }, []);

    const removeListItem = useCallback((key, index) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index)
        }));
    }, []);

    const handleThumbnailChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleIntroVideoChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIntroVideo(file);
            setIntroVideoPreview(URL.createObjectURL(file));
            setExistingIntroVideoUrl('');
        }
    }, []);

    const handleSectionTitleChange = useCallback((sectionId, value) => {
        setSyllabus(prev => prev.map(s =>
            s.id === sectionId ? { ...s, title: value } : s
        ));
    }, []);

    const addSection = useCallback(() => {
        setSyllabus(prev => [...prev, {
            id: Date.now(),
            title: '',
            lessons: [{
                id: Date.now(),
                title: '',
                videoSource: 'upload',
                videoFile: null,
                videoUrl: '',
                existingVideoUrl: null,
                previewVideoUrl: null
            }]
        }]);
    }, []);

    const removeSection = useCallback((sectionId) => {
        setSyllabus(prev => prev.filter(s => s.id !== sectionId));
    }, []);

    const handleLessonChange = useCallback((sectionId, lessonId, field, value) => {
        setSyllabus(prev => prev.map(s =>
            s.id === sectionId ? {
                ...s,
                lessons: s.lessons.map(l => {
                    if (l.id !== lessonId) return l;

                    const updated = { ...l, [field]: value };

                    if (field === 'videoFile' && value) {
                        try {
                            updated.previewVideoUrl = URL.createObjectURL(value);
                            updated.existingVideoUrl = null;
                        } catch (err) {
                            console.error('Preview error:', err);
                        }
                    }

                    if (field === 'videoSource' && value === 'link') {
                        updated.videoFile = null;
                        updated.previewVideoUrl = null;
                    }

                    if (field === 'videoUrl') {
                        updated.previewVideoUrl = value;
                    }

                    return updated;
                })
            } : s
        ));
    }, []);

    const addLesson = useCallback((sectionId) => {
        setSyllabus(prev => prev.map(s =>
            String(s.id) === String(sectionId) ? {  // String comparison to avoid type issues
                ...s,
                lessons: [...s.lessons, {
                    id: Date.now(),
                    title: '',
                    videoSource: 'upload',
                    videoFile: null,
                    videoUrl: '',
                    existingVideoUrl: null,
                    previewVideoUrl: null
                }]
            } : s
        ));
    }, []);

    const removeLesson = useCallback((sectionId, lessonId) => {
        setSyllabus(prev => prev.map(s =>
            s.id === sectionId ? {
                ...s,
                lessons: s.lessons.filter(l => l.id !== lessonId)
            } : s
        ));
    }, []);

    const handleFreeCourseToggle = useCallback((e) => {
        setFormData(prev => ({
            ...prev,
            isFree: e.target.checked,
            price: e.target.checked ? '' : prev.price
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData || !courseId) {
            setError('Course data missing');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const syllabusForSubmission = syllabus.map(section => ({
                ...section,
                lessons: section.lessons.map(lesson => ({
                    ...lesson,
                    videoFileName: lesson.videoSource === 'upload' && lesson.videoFile ? lesson.videoFile.name : null,
                    videoFile: undefined
                }))
            }));

            const submissionData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submissionData.append(key, Array.isArray(value) ? value.join(',') : value);
            });

            submissionData.append('syllabus', JSON.stringify(syllabusForSubmission));

            if (thumbnail) submissionData.append('thumbnail', thumbnail);
            if (introVideo) submissionData.append('introVideo', introVideo);

            syllabus.forEach(section => {
                section.lessons.forEach(lesson => {
                    if (lesson.videoSource === 'upload' && lesson.videoFile) {
                        submissionData.append('lessonVideos', lesson.videoFile, lesson.videoFile.name);
                    }
                });
            });

            const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: submissionData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            setSuccess(result.message);
            setTimeout(() => router.push('/dashboard/courses/all'), 2000);
        } catch (err) {
            console.error('❌ Submit error:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || isLoadingData) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea670c] mx-auto mb-4"></div>
                    <p className="text-slate-600">{authLoading ? 'Authenticating...' : 'Loading course...'}</p>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg max-w-md">
                    {error || "Course not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                    }
                }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">কোর্স এডিট করুন</h1>
                    <p className="mt-1 text-slate-500">কোর্সের তথ্য আপডেট করুন।</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <FormSection title="বেসিক তথ্য" icon={<BookOpen className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <InputField name="title" value={formData.title} onChange={handleChange} label="কোর্সের শিরোনাম" />
                            <InputField name="slug" value={formData.slug} onChange={handleChange} label="স্লাগ (URL)" disabled />
                            <TextareaField name="description" value={formData.description} onChange={handleChange} label="কোর্সের বর্ণনা" />
                        </FormSection>

                        {/* Instructor Info */}
                        <FormSection title="ইন্সট্রাক্টর তথ্য" icon={<User className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <InputField name="instructorName" value={formData.instructorName} onChange={handleChange} label="ইন্সট্রাক্টরের নাম" disabled />
                            <TextareaField name="instructorBio" value={formData.instructorBio} onChange={handleChange} label="ইন্সট্রাক্টরের পরিচিতি" disabled />
                        </FormSection>

                        {/* Outcomes & Requirements */}
                        <FormSection title="আউটকাম ও রিকোয়ারমেন্ট" icon={<Target className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">এই কোর্স থেকে কি শিখবেন?</label>
                                {formData.outcomes.map((o, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={o}
                                            onChange={(e) => handleListChange('outcomes', i, e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                        <button type="button" onClick={() => removeListItem('outcomes', i)} className="p-2 text-red-500 rounded-md hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addListItem('outcomes')} className="text-sm font-semibold text-[#ea670c] hover:text-[#c2570c]">
                                    <Plus size={16} className="inline mr-1" /> আউটকাম যোগ করুন
                                </button>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">কোর্সের প্রয়োজনীয়তা</label>
                                {formData.requirements.map((r, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={r}
                                            onChange={(e) => handleListChange('requirements', i, e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                        <button type="button" onClick={() => removeListItem('requirements', i)} className="p-2 text-red-500 rounded-md hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addListItem('requirements')} className="text-sm font-semibold text-[#ea670c] hover:text-[#c2570c]">
                                    <Plus size={16} className="inline mr-1" /> রিকোয়ারমেন্ট যোগ করুন
                                </button>
                            </div>
                        </FormSection>

                        {/* Syllabus – FIXED AREA */}
                        <FormSection title="কোর্স সিলেবাস" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <div className="space-y-6">
                                {syllabus.map((section, sectionIndex) => (
                                    <div key={section.id} className="border bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                                                placeholder={`Section ${sectionIndex + 1} Title`}
                                                className="text-lg font-semibold w-full bg-transparent border-b border-slate-300 focus:border-[#ea670c] focus:outline-none px-2 py-1"
                                            />
                                            <button type="button" onClick={() => removeSection(section.id)} className="p-2 text-red-500 rounded-md hover:bg-red-100 ml-2">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                                            {section.lessons.map((lesson, lessonIndex) => (
                                                <div key={lesson.id} className="bg-white p-3 rounded-md border">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <GripVertical className="h-5 w-5 text-slate-400" />
                                                        <span className="text-sm font-medium">{lessonIndex + 1}.</span>
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => handleLessonChange(section.id, lesson.id, 'title', e.target.value)}
                                                            placeholder="Lesson Title"
                                                            className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#ea670c] focus:border-[#ea670c]"
                                                        />
                                                        <button type="button" onClick={() => removeLesson(section.id, lesson.id)} className="p-2 text-red-500 rounded-md hover:bg-red-50">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    <div className="pl-10">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-xs font-medium text-slate-600">Video Source:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleLessonChange(section.id, lesson.id, 'videoSource', 'upload')}
                                                                className={`px-3 py-1 text-xs rounded transition ${lesson.videoSource === 'upload' ? 'bg-[#ea670c] text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Upload
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleLessonChange(section.id, lesson.id, 'videoSource', 'link')}
                                                                className={`px-3 py-1 text-xs rounded transition ${lesson.videoSource === 'link' ? 'bg-[#ea670c] text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Link
                                                            </button>
                                                        </div>

                                                        {(lesson.existingVideoUrl || lesson.previewVideoUrl) && (
                                                            <div className="mb-4 bg-slate-50 p-3 rounded-md border border-slate-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="text-xs font-medium text-slate-700">
                                                                        {lesson.videoFile ? '🆕 নতুন ভিডিও' : '▶️ বর্তমান ভিডিও'}
                                                                    </p>
                                                                    {lesson.videoFile && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSyllabus(prev => prev.map(s =>
                                                                                    s.id === section.id ? {
                                                                                        ...s,
                                                                                        lessons: s.lessons.map(l =>
                                                                                            l.id === lesson.id ? {
                                                                                                ...l,
                                                                                                videoFile: null,
                                                                                                previewVideoUrl: l.existingVideoUrl || l.previewVideoUrl
                                                                                            } : l
                                                                                        )
                                                                                    } : s
                                                                                ));
                                                                            }}
                                                                            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                                                                        >
                                                                            <X size={12} className="mr-1" /> বাতিল
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="relative bg-black rounded overflow-hidden aspect-video">
                                                                    <iframe
                                                                        src={lesson.previewVideoUrl}
                                                                        className="w-full h-full"
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        title={lesson.title}
                                                                    />
                                                                </div>

                                                                {lesson.videoFile && (
                                                                    <div className="mt-2 text-xs text-slate-600">
                                                                        <p className="font-medium truncate">📁 {lesson.videoFile.name}</p>
                                                                        <p className="text-slate-500">📦 {(lesson.videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {lesson.videoSource === 'upload' ? (
                                                            <div className="mt-3">
                                                                <div
                                                                    className={`px-4 py-6 border-2 border-dashed rounded-md text-center cursor-pointer transition
                                                                        ${lesson.videoFile ? 'border-[#ea670c] bg-orange-50' : 'border-slate-300 hover:border-[#ea670c] hover:bg-orange-50'}`}
                                                                    onClick={() => document.getElementById(`lesson-video-${lesson.id}`).click()}
                                                                >
                                                                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                                                                    <p className="text-sm font-medium text-slate-700">
                                                                        {lesson.videoFile
                                                                            ? lesson.videoFile.name
                                                                            : (lesson.existingVideoUrl ? 'নতুন ভিডিও আপলোড করুন' : 'ভিডিও আপলোড করুন')}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-1">ক্লিক করুন বা ড্র্যাগ অ্যান্ড ড্রপ করুন</p>
                                                                </div>

                                                                <input
                                                                    id={`lesson-video-${lesson.id}`}
                                                                    type="file"
                                                                    accept="video/*"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleLessonChange(section.id, lesson.id, 'videoFile', file);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="url"
                                                                value={lesson.videoUrl || ''}
                                                                onChange={(e) => handleLessonChange(section.id, lesson.id, 'videoUrl', e.target.value)}
                                                                placeholder="https://youtube.com/watch?v=..."
                                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#ea670c]"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* FIXED: type="button" added here */}
                                            <button
                                                type="button"
                                                onClick={() => addLesson(section.id)}
                                                className="text-sm font-semibold text-[#ea670c] ml-10 hover:text-[#c2570c] mt-4 block"
                                            >
                                                <Plus size={16} className="inline mr-1" /> Add Lesson
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Also fixed for Add Section */}
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="w-full text-center py-3 border-2 border-dashed rounded-lg text-[#ea670c] font-semibold hover:bg-orange-50 transition"
                                >
                                    <Plus size={20} className="inline mr-2" /> Add Section
                                </button>
                            </div>
                        </FormSection>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <FormSection title="কোর্স মেটাডেটা" icon={<Tag className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <SelectField label="ক্যাটাগরি" name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="web-development">Web Development</option>
                                </SelectField>
                                <SelectField label="ভাষা" name="language" value={formData.language} onChange={handleChange}>
                                    <option value="বাংলা">বাংলা</option>
                                    <option value="English">English</option>
                                </SelectField>
                                <InputField label="কোর্সের সময়কাল" name="duration" value={formData.duration} onChange={handleChange} />
                                <InputField label="মোট লেসন সংখ্যা" name="numberOfLessons" type="number" value={formData.numberOfLessons} onChange={handleChange} />
                            </FormSection>

                            <FormSection title="মূল্য নির্ধারণ" icon={<DollarSign className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-md">
                                    <input type="checkbox" id="isFree" checked={formData.isFree} onChange={handleFreeCourseToggle} className="h-4 w-4 rounded" />
                                    <label htmlFor="isFree" className="text-sm">This is a free course</label>
                                </div>
                                {!formData.isFree && (
                                    <InputField label="মূল্য (BDT)" name="price" type="number" value={formData.price} onChange={handleChange} />
                                )}
                            </FormSection>

                            <FormSection title="কোর্স মিডিয়া" icon={<ImageIcon className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">থাম্বনেইল</label>
                                    <FileUploadField
                                        id="thumbnail-upload"
                                        onFileSelect={handleThumbnailChange}
                                        preview={thumbnailPreview}
                                        Icon={ImageIcon}
                                        acceptedFiles="image/*"
                                        fileInfo={thumbnail}
                                    />
                                </div>

                                <hr className="my-6 border-slate-200" />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">ইন্ট্রো ভিডিও</label>

                                    {(existingIntroVideoUrl || introVideoPreview) && (
                                        <div className="mb-4">
                                            <p className="text-xs text-slate-600 mb-2 font-medium">
                                                {introVideoPreview ? '🆕 নতুন ভিডিও' : '▶️ বর্তমান ভিডিও'}
                                            </p>
                                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                                <iframe
                                                    src={introVideoPreview || existingIntroVideoUrl}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Intro video"
                                                />
                                            </div>
                                            {introVideoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIntroVideo(null);
                                                        setIntroVideoPreview('');
                                                    }}
                                                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                                                >
                                                    <X size={14} className="mr-1" /> বাতিল করুন
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <FileUploadField
                                        id="intro-video-upload"
                                        onFileSelect={handleIntroVideoChange}
                                        preview={introVideoPreview}
                                        Icon={Film}
                                        acceptedFiles="video/*"
                                        fileInfo={introVideo}
                                    />
                                </div>
                            </FormSection>

                            <FormSection title="পাবলিশ" icon={<CheckCircle className="mr-3 h-6 w-6 text-green-600"/>}>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#ea670c] text-white font-bold py-3 px-4 rounded-md hover:bg-[#c2570c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            আপডেট হচ্ছে...
                                        </>
                                    ) : (
                                        'কোর্স আপডেট করুন'
                                    )}
                                </button>
                            </FormSection>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 p-3 bg-red-100 text-red-800 rounded-md text-center fixed bottom-5 right-5 shadow-lg z-50">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-6 p-3 bg-green-100 text-green-800 rounded-md text-center fixed bottom-5 right-5 shadow-lg z-50">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}