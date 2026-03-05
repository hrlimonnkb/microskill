"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Plus, Trash2, Film, Image as ImageIcon, BookOpen, DollarSign,
    Target, ListChecks, CheckCircle, GripVertical, User, Tag,
    X, Loader2, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import 'react-loading-skeleton/dist/skeleton.css';

const API_BASE_URL = 'https://api.microskill.com.bd';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const brand      = '#ea670c';
const brandHover = '#c2570a';
const brandLight = '#fff4ee';
const brandBorder= '#fbd9c0';

// ─── Reusable Components ───────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, children, accent = false }) => (
    <div className={`rounded-2xl border ${accent ? 'border-orange-200 bg-orange-50/30' : 'border-slate-200 bg-white'} shadow-sm overflow-hidden`}>
        <div className={`flex items-center gap-3 px-6 py-4 border-b ${accent ? 'border-orange-200 bg-orange-50/60' : 'border-slate-100 bg-slate-50/80'}`}>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200">
                <Icon className="h-4 w-4" style={{ color: brand }} />
            </span>
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
);

const Label = ({ children, required }) => (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {children}{required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
);

const inputBase = "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required, helpText, disabled }) => (
    <div>
        <Label required={required}>{label}</Label>
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
            required={required} disabled={disabled} className={inputBase} />
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 4, helpText, disabled }) => (
    <div>
        <Label>{label}</Label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
            disabled={disabled} className={`${inputBase} resize-none leading-relaxed`} />
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, children, helpText }) => (
    <div>
        <Label>{label}</Label>
        <select name={name} value={value} onChange={onChange}
            className={`${inputBase} appearance-none cursor-pointer`}>
            {children}
        </select>
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const ListItemInput = ({ value, index, onChange, onRemove, placeholder }) => (
    <div className="flex items-center gap-2 group">
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold select-none">
            {index + 1}
        </span>
        <input type="text" value={value} onChange={onChange} placeholder={placeholder}
            className={`${inputBase} flex-1`} />
        <button type="button" onClick={onRemove}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150">
            <X size={14} />
        </button>
    </div>
);

const FileUploadField = ({ onFileSelect, preview, Icon, acceptedFiles, helpText, fileInfo, label }) => (
    <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <label className="relative cursor-pointer block">
            <div className={`flex flex-col items-center justify-center gap-3 px-4 py-7 border-2 border-dashed rounded-xl transition-all duration-200
                ${preview ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/30'}`}>
                {preview ? (
                    <img src={preview} alt="Preview" className="h-28 w-auto rounded-lg shadow object-contain" />
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-semibold" style={{ color: brand }}>
                                {fileInfo ? 'ফাইল পরিবর্তন করুন' : 'ফাইল আপলোড করুন'}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5">অথবা ড্র্যাগ করুন</p>
                        </div>
                    </>
                )}
            </div>
            <input type="file" className="sr-only" onChange={onFileSelect} accept={acceptedFiles} />
        </label>
        {fileInfo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                <CheckCircle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                <span className="font-medium truncate">{fileInfo.name}</span>
                <span className="ml-auto flex-shrink-0 text-orange-500">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
        )}
        {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
);

// ─── Syllabus Builder ──────────────────────────────────────────────────────────

const LessonRow = ({ lesson, lessonIndex, sectionId, onChange, onRemove }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-3 hover:border-orange-300 hover:shadow-sm transition-all duration-150">
        <div className="flex items-center gap-2.5">
            <GripVertical className="h-4 w-4 text-slate-500 cursor-grab flex-shrink-0" />
            <span className="text-xs font-bold text-slate-400 flex-shrink-0">{String(lessonIndex + 1).padStart(2, '0')}</span>
            <input type="text" value={lesson.title}
                onChange={(e) => onChange(sectionId, lesson.id, 'title', e.target.value)}
                placeholder="Lesson Title"
                className="flex-1 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-400 transition-all"
            />
          <button type="button" onClick={() => onRemove(sectionId, lesson.id)}
    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
    <Trash2 size={14} />
</button>
        </div>
        <div className="mt-3 pl-10">
            <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs text-slate-500 font-medium">Video:</span>
                {['upload', 'link'].map(src => (
                    <button key={src} type="button"
                        onClick={() => onChange(sectionId, lesson.id, 'videoSource', src)}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full transition-all"
                        style={lesson.videoSource === src
                            ? { backgroundColor: brand, color: '#fff' }
                            : { backgroundColor: '#f1f5f9', color: '#475569' }}>
                        {src === 'upload' ? '↑ Upload' : '🔗 Link'}
                    </button>
                ))}
            </div>
            {lesson.videoSource === 'upload' ? (
                <div>
                    <input type="file" accept="video/*"
                        onChange={(e) => onChange(sectionId, lesson.id, 'videoFile', e.target.files[0])}
                        className="w-full text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:text-white file:cursor-pointer file:bg-[#ea670c]"
                    />
                    {lesson.videoFile && <span className="text-xs text-green-600 font-medium">✓ {lesson.videoFile.name}</span>}
                </div>
            ) : (
                <input type="url" value={lesson.videoUrl || ''}
                    onChange={(e) => onChange(sectionId, lesson.id, 'videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-400 transition-all"
                />
            )}
        </div>
    </div>
);

const SectionBlock = ({ section, sectionIndex, onTitleChange, onRemove, onLessonChange, onAddLesson, onRemoveLesson }) => (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: brand }}>
                {sectionIndex + 1}
            </span>
            <input type="text" value={section.title}
                onChange={(e) => onTitleChange(section.id, e.target.value)}
                placeholder={`Section ${sectionIndex + 1} শিরোনাম`}
                className="flex-1 text-sm font-semibold bg-transparent focus:outline-none text-black placeholder:text-black"
            />
           <button type="button" onClick={() => onRemove(section.id)}
    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
    <Trash2 size={15} />
</button>
        </div>
        <div className="p-4 space-y-2.5 bg-slate-50/50">
            {section.lessons.map((l, li) => (
                <LessonRow key={l.id} lesson={l} lessonIndex={li} sectionId={section.id}
                    onChange={onLessonChange} onRemove={onRemoveLesson} />
            ))}
            <button type="button" onClick={() => onAddLesson(section.id)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-dashed transition-all mt-1"
                style={{ color: brand, borderColor: brandBorder }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = brandLight}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Plus size={13} /> লেসন যোগ করুন
            </button>
        </div>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ManageCoursePage() {
    const { user, loading: authLoading, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;
    const isEditMode = !!slug;

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [courseId, setCourseId]   = useState(null);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');

    const [formData, setFormData] = useState({
        title: '', slug: '', description: '', category: '', language: 'বাংলা',
        instructorName: '', instructorBio: '', duration: '', numberOfLessons: '',
        outcomes: [''], requirements: [''], price: '', isFree: false
    });
    const [syllabus, setSyllabus] = useState([{
        id: Date.now(), title: 'Section 1: Introduction',
        lessons: [{ id: Date.now(), title: 'Welcome to the Course', videoSource: 'upload', videoFile: null, videoUrl: '' }]
    }]);
    const [thumbnail, setThumbnail]               = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [introVideo, setIntroVideo]             = useState(null);

    // Auto-slug from title
    useEffect(() => {
        if (!isEditMode) {
            const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, isEditMode]);

    // Fetch instructor profile
    useEffect(() => {
        if (!isEditMode && !authLoading && user && token) {
            (async () => {
                try {
                    const r = await fetch(`${API_BASE_URL}/api/teachers/my-profile`, { headers: { Authorization: `Bearer ${token}` } });
                    const p = r.ok ? await r.json() : null;
                    setFormData(prev => ({ ...prev, instructorName: p?.fullName || user.name || '', instructorBio: p?.shortBio || '' }));
                } catch {
                    setFormData(prev => ({ ...prev, instructorName: user.name || '' }));
                }
            })();
        }
    }, [isEditMode, authLoading, user, token]);

    // Fetch course for edit mode
    useEffect(() => {
        if (isEditMode) {
            (async () => {
                try {
                    const r = await fetch(`${API_BASE_URL}/api/courses/${slug}`);
                    if (!r.ok) throw new Error("কোর্সটি পাওয়া যায়নি।");
                    const data = await r.json();
                    setCourseId(data.id);
                    setFormData({
                        title: data.title, slug: data.slug, description: data.description,
                        category: data.category, language: data.language,
                        instructorName: data.instructor.fullName, instructorBio: data.instructor.shortBio,
                        duration: data.duration, numberOfLessons: data.numberOfLessons,
                        outcomes: data.outcomes ? data.outcomes.split(',') : [''],
                        requirements: data.requirements ? data.requirements.split(',') : [''],
                        price: data.price, isFree: data.isFree,
                    });
                    setSyllabus(data.sections.map(s => ({ ...s, lessons: s.lessons || [] })));
                    setThumbnailPreview(data.thumbnail ? `${API_BASE_URL}/${data.thumbnail}` : '');
                } catch (err) { setError(err.message); }
                finally { setIsLoading(false); }
            })();
        }
    }, [isEditMode, slug]);

    // ── Field handlers ────────────────────────────────────────────────────────
    const handleChange        = (e)      => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleListChange    = (k,i,v)  => setFormData(p => ({ ...p, [k]: p[k].map((x,j) => j===i ? v : x) }));
    const addListItem         = (k)      => setFormData(p => ({ ...p, [k]: [...p[k], ''] }));
    const removeListItem      = (k,i)    => setFormData(p => ({ ...p, [k]: p[k].filter((_,j) => j!==i) }));
    const handleFreeCourseToggle = (e)   => setFormData(p => ({ ...p, isFree: e.target.checked, price: e.target.checked ? '' : p.price }));

    const handleSectionTitleChange = (id,v) => setSyllabus(p => p.map(s => s.id===id ? {...s,title:v} : s));
    const addSection    = () => setSyllabus(p => [...p, { id: Date.now(), title:'', lessons:[{id:Date.now(),title:'',videoSource:'upload',videoFile:null,videoUrl:''}] }]);
    const removeSection = (id) => setSyllabus(p => p.filter(s => s.id!==id));
    const handleLessonChange = (sid,lid,field,value) =>
        setSyllabus(p => p.map(s => s.id===sid ? {...s, lessons:s.lessons.map(l => l.id===lid ? {...l,[field]:value} : l)} : s));
    const addLesson    = (sid) => setSyllabus(p => p.map(s => s.id===sid ? {...s, lessons:[...s.lessons,{id:Date.now(),title:'',videoSource:'upload',videoFile:null,videoUrl:''}]} : s));
    const removeLesson = (sid,lid) => setSyllabus(p => p.map(s => s.id===sid ? {...s, lessons:s.lessons.filter(l=>l.id!==lid)} : s));

    const handleThumbnailChange  = (e) => { const f=e.target.files[0]; if(f){setThumbnail(f);setThumbnailPreview(URL.createObjectURL(f));} };
    const handleIntroVideoChange = (e) => setIntroVideo(e.target.files[0]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setIsLoading(true);

        const syllabusForSubmission = syllabus.map(section => ({
            title: section.title,
            lessons: section.lessons.map(lesson => ({
                title: lesson.title, videoSource: lesson.videoSource,
                videoUrl: lesson.videoUrl || null,
                gumletAssetId: lesson.gumletAssetId || null,
                videoFileName: (lesson.videoSource==='upload' && lesson.videoFile) ? lesson.videoFile.name : null
            }))
        }));

        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('slug', formData.slug);
        fd.append('description', formData.description);
        fd.append('category', formData.category);
        fd.append('language', formData.language);
        fd.append('duration', formData.duration);
        fd.append('numberOfLessons', formData.numberOfLessons);
        fd.append('price', formData.price || 0);
        fd.append('isFree', formData.isFree);
        fd.append('outcomes', formData.outcomes.filter(Boolean).join(','));
        fd.append('requirements', formData.requirements.filter(Boolean).join(','));
        fd.append('syllabus', JSON.stringify(syllabusForSubmission));

        syllabus.forEach(section => {
            section.lessons.forEach(lesson => {
                if (lesson.videoSource === 'upload' && lesson.videoFile) fd.append('lessonVideos', lesson.videoFile);
            });
        });

        if (thumbnail) fd.append('thumbnail', thumbnail);
        if (introVideo) fd.append('introVideo', introVideo);

        try {
            const url = isEditMode ? `${API_BASE_URL}/api/courses/${courseId}` : `${API_BASE_URL}/api/courses/create`;
            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'একটি ত্রুটি ঘটেছে।');
            setSuccess(result.message);
            setTimeout(() => router.push('/dashboard/courses/all'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || (isEditMode && isLoading)) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
                    <p className="text-sm text-slate-500">লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Sticky Page Header ── */}
            <div className="bg-white border-b border-slate-200 fixed-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-9 h-9 rounded-xl"
                            style={{ backgroundColor: brandLight }}>
                            <Sparkles className="h-4 w-4" style={{ color: brand }} />
                        </span>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">
                                {isEditMode ? 'কোর্স এডিট করুন' : 'নতুন কোর্স তৈরি করুন'}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isEditMode ? 'কোর্সের তথ্য আপডেট করুন' : 'ফর্মটি পূরণ করে কোর্স পাবলিশ করুন'}
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                        <span>Dashboard</span><ChevronRight size={12} />
                        <span>Courses</span><ChevronRight size={12} />
                        <span className="font-semibold" style={{ color: brand }}>{isEditMode ? 'Edit' : 'Create'}</span>
                    </div>
                </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left: Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        <SectionCard title="বেসিক তথ্য" icon={BookOpen}>
                            <InputField required name="title" value={formData.title} onChange={handleChange}
                                label="কোর্সের শিরোনাম" placeholder="যেমন: Complete Web Development Bootcamp" />
                            <InputField name="slug" value={formData.slug} onChange={handleChange}
                                label="URL স্লাগ" placeholder="complete-web-development" disabled={isEditMode}
                                helpText="শিরোনাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়।" />
                            <TextareaField name="description" value={formData.description} onChange={handleChange}
                                label="কোর্সের বিবরণ" placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..." rows={5} />
                        </SectionCard>

                        <SectionCard title="ইন্সট্রাক্টর তথ্য" icon={User}>
                            <InputField name="instructorName" value={formData.instructorName} onChange={handleChange}
                                label="ইন্সট্রাক্টরের নাম" disabled helpText="প্রোফাইল থেকে স্বয়ংক্রিয়ভাবে নেওয়া হয়েছে।" />
                            <TextareaField name="instructorBio" value={formData.instructorBio} onChange={handleChange}
                                label="ইন্সট্রাক্টরের পরিচিতি" disabled rows={3} />
                        </SectionCard>

                        <SectionCard title="আউটকাম ও রিকোয়ারমেন্ট" icon={Target}>
                            {/* Outcomes */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label>এই কোর্স থেকে কি শিখবেন?</Label>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{ backgroundColor: brandLight, color: brand }}>
                                        {formData.outcomes.filter(Boolean).length} টি
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {formData.outcomes.map((o, i) => (
                                        <ListItemInput key={i} value={o} index={i}
                                            onChange={e => handleListChange('outcomes', i, e.target.value)}
                                            onRemove={() => removeListItem('outcomes', i)}
                                            placeholder={`আউটকাম #${i + 1} লিখুন`} />
                                    ))}
                                </div>
                                <button type="button" onClick={() => addListItem('outcomes')}
                                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold"
                                    style={{ color: brand }}>
                                    <Plus size={14} /> আউটকাম যোগ করুন
                                </button>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <Label>কোর্সের প্রয়োজনীয়তা</Label>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
                                        {formData.requirements.filter(Boolean).length} টি
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {formData.requirements.map((r, i) => (
                                        <ListItemInput key={i} value={r} index={i}
                                            onChange={e => handleListChange('requirements', i, e.target.value)}
                                            onRemove={() => removeListItem('requirements', i)}
                                            placeholder={`রিকোয়ারমেন্ট #${i + 1} লিখুন`} />
                                    ))}
                                </div>
                                <button type="button" onClick={() => addListItem('requirements')}
                                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold"
                                    style={{ color: brand }}>
                                    <Plus size={14} /> রিকোয়ারমেন্ট যোগ করুন
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard title="কোর্স সিলেবাস" icon={ListChecks}>
                            <div className="space-y-4">
                                {syllabus.map((s, si) => (
                                    <SectionBlock key={s.id} section={s} sectionIndex={si}
                                        onTitleChange={handleSectionTitleChange}
                                        onRemove={removeSection}
                                        onLessonChange={handleLessonChange}
                                        onAddLesson={addLesson}
                                        onRemoveLesson={removeLesson}
                                    />
                                ))}
                                <button type="button" onClick={addSection}
                                    className="w-full py-3.5 border-2 border-dashed rounded-2xl text-sm font-semibold transition-all"
                                    style={{ borderColor: brandBorder, color: brand }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = brandLight; e.currentTarget.style.borderColor = brand; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = brandBorder; }}>
                                    <Plus size={14} className="inline mr-1.5" /> নতুন সেকশন যোগ করুন
                                </button>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-5">

                            <SectionCard title="কোর্স মেটাডেটা" icon={Tag}>
                                <SelectField label="ক্যাটাগরি" name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">ক্যাটাগরি বাছুন</option>
                                    <option value="web-development">Web Development</option>
                                    <option value="design">Design</option>
                                    <option value="marketing">Digital Marketing</option>
                                    <option value="programming">Programming</option>
                                </SelectField>
                                <SelectField label="ভাষা" name="language" value={formData.language} onChange={handleChange}>
                                    <option value="বাংলা">বাংলা</option>
                                    <option value="English">English</option>
                                </SelectField>
                                <InputField label="কোর্সের সময়কাল" name="duration" value={formData.duration} onChange={handleChange} placeholder="যেমন: ১২ ঘণ্টা ৩০ মিনিট" />
                                <InputField label="মোট লেসন সংখ্যা" name="numberOfLessons" type="number" value={formData.numberOfLessons} onChange={handleChange} placeholder="যেমন: ৭৫" />
                            </SectionCard>

                            <SectionCard title="মূল্য নির্ধারণ" icon={DollarSign}>
                                <label className="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none"
                                    style={{ backgroundColor: formData.isFree ? brandLight : 'transparent', borderColor: formData.isFree ? brandBorder : '#e2e8f0' }}>
                                    <div className="relative flex-shrink-0">
                                        <input type="checkbox" id="isFree" checked={formData.isFree} onChange={handleFreeCourseToggle} className="sr-only" />
                                        <div className="w-10 h-5 rounded-full transition-all"
                                            style={{ backgroundColor: formData.isFree ? brand : '#cbd5e1' }}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-0.5 ml-0.5 ${formData.isFree ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">ফ্রি কোর্স</p>
                                        <p className="text-xs text-slate-500">শিক্ষার্থীরা বিনামূল্যে পড়তে পারবে</p>
                                    </div>
                                </label>
                                {!formData.isFree && (
                                    <InputField label="মূল্য (BDT)" name="price" type="number"
                                        value={formData.price} onChange={handleChange} placeholder="যেমন: ১৫০০" />
                                )}
                            </SectionCard>

                            <SectionCard title="কোর্স মিডিয়া" icon={ImageIcon}>
                                <FileUploadField label="থাম্বনেইল"
                                    onFileSelect={handleThumbnailChange} preview={thumbnailPreview}
                                    Icon={ImageIcon} acceptedFiles="image/*" fileInfo={thumbnail}
                                    helpText="প্রস্তাবিত: ১২৮০×৭২০ px · JPG বা PNG" />
                                <div className="border-t border-slate-100 pt-4">
                                    <FileUploadField label="ইন্ট্রো ভিডিও"
                                        onFileSelect={handleIntroVideoChange}
                                        Icon={Film} acceptedFiles="video/*" fileInfo={introVideo}
                                        helpText="MP4 ফরম্যাট · সর্বোচ্চ ৫ মিনিট" />
                                </div>
                            </SectionCard>

                            <SectionCard title="পাবলিশ" icon={CheckCircle} accent>
                                <button type="submit" disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: brand }}
                                    onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = brandHover)}
                                    onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = brand)}>
                                    {isLoading ? (
                                        <><Loader2 className="animate-spin h-4 w-4" /><span>প্রসেস হচ্ছে...</span></>
                                    ) : (
                                        <><CheckCircle className="h-4 w-4" /><span>{isEditMode ? 'কোর্স আপডেট করুন' : 'কোর্স পাবলিশ করুন'}</span></>
                                    )}
                                </button>
                                <button type="button"
                                    className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]">
                                    Draft হিসেবে সেভ করুন
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-1.5">
                                    পাবলিশ করার আগে সব তথ্য যাচাই করুন।
                                </p>
                            </SectionCard>

                        </div>
                    </div>
                </div>
            </form>

            {/* ── Toast Notifications ── */}
            {error && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-red-600 text-white text-sm rounded-xl shadow-xl">
                    <X className="h-4 w-4 flex-shrink-0" /><span>{error}</span>
                </div>
            )}
            {success && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-green-600 text-white text-sm rounded-xl shadow-xl">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" /><span>{success}</span>
                </div>
            )}
        </div>
    );
}