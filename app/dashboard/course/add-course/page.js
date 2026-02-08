"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Film, Image as ImageIcon, BookOpen, DollarSign, Target, ListChecks, CheckCircle, GripVertical, User, Tag, Languages, Link2, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const API_BASE_URL = 'https://api.microskill.com.bd';

// ---------- Reusable Components ----------
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
            value={value}
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
            value={value}
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
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900"
        >
            {children}
        </select>
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const FileUploadField = ({ onFileSelect, preview, Icon, acceptedFiles, helpText, fileInfo }) => (
    <div className="space-y-2">
        <label className="relative cursor-pointer group block w-full text-center">
            <div className={`px-6 py-8 border-2 border-slate-300 border-dashed rounded-lg transition-colors ${!preview && 'hover:border-indigo-500 hover:bg-indigo-50'}`}>
                {preview ? (
                    <img src={preview} alt="File Preview" className="mx-auto h-28 w-auto rounded-md shadow-md object-contain" />
                ) : (
                    <div className="space-y-1">
                        <Icon className="mx-auto h-12 w-12 text-slate-400" />
                        <span className="mt-2 block text-sm font-semibold text-[#ea670c]">
                            {fileInfo ? 'Change file' : 'Upload a file'}
                        </span>
                        <span className="block text-xs text-slate-500">or drag and drop</span>
                    </div>
                )}
            </div>
            <input type="file" className="sr-only" onChange={onFileSelect} accept={acceptedFiles} />
        </label>
        {fileInfo && (
            <div className="bg-slate-100 p-2 rounded-md text-xs text-slate-700 text-center">
                <p className="font-medium truncate">{fileInfo.name}</p>
                <p className="text-slate-500">{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        )}
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const FormSkeleton = () => ( /* Your Skeleton component can go here */ <div>Loading Form...</div> );

// ---------- Main Page Component ----------
export default function ManageCoursePage() {
    const { user, loading: authLoading, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;
    const isEditMode = !!slug;

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [courseId, setCourseId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        title: '', slug: '', description: '', category: '', language: 'বাংলা',
        instructorName: '', instructorBio: '', duration: '', numberOfLessons: '',
        outcomes: [''], requirements: [''], price: '', isFree: false
    });
    const [syllabus, setSyllabus] = useState([{ id: Date.now(), title: 'Section 1: Introduction', lessons: [{ id: Date.now(), title: 'Welcome to the Course', videoSource: 'upload', videoFile: null, videoUrl: '' }] }]);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [introVideo, setIntroVideo] = useState(null);
    
    useEffect(() => {
        if (!isEditMode) {
            const generateSlug = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData(prev => ({...prev, slug: generateSlug(prev.title)}));
        }
    }, [formData.title, isEditMode]);
    
    useEffect(() => {
        const fetchInstructorProfile = async () => {
            if (!isEditMode && !authLoading && user && token) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/teachers/my-profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const profile = await response.json();
                        setFormData(prev => ({ ...prev, instructorName: profile.fullName || user.name || '', instructorBio: profile.shortBio || '' }));
                    } else {
                        setFormData(prev => ({ ...prev, instructorName: user.name || '' }));
                    }
                } catch (error) {
                    console.error("Failed to fetch teacher profile", error);
                    setFormData(prev => ({ ...prev, instructorName: user.name || '' }));
                }
            }
        };
        fetchInstructorProfile();
    }, [isEditMode, authLoading, user, token]);

    useEffect(() => {
        if (isEditMode) {
            const fetchCourseData = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`);
                    if (!response.ok) throw new Error("Course not found or you don't have permission.");
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
                    setSyllabus(data.sections.map(s => ({ ...s, lessons: s.lessons || [] })));
                    setThumbnailPreview(data.thumbnail ? `${API_BASE_URL}/${data.thumbnail}` : '');
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCourseData();
        }
    }, [isEditMode, slug]);

    const handleListChange = (key, index, value) => setFormData(prev => ({ ...prev, [key]: prev[key].map((item, i) => i === index ? value : item) }));
    const addListItem = (key) => setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
    const removeListItem = (key, index) => setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    
    const handleSectionTitleChange = (sectionId, value) => setSyllabus(prev => prev.map(s => s.id === sectionId ? { ...s, title: value } : s));
    const addSection = () => setSyllabus(prev => [...prev, { id: Date.now(), title: '', lessons: [{ id: Date.now(), title: '', videoSource: 'upload', videoFile: null, videoUrl: '' }] }]);
    const removeSection = (sectionId) => setSyllabus(prev => prev.filter(s => s.id !== sectionId));
    
    const handleLessonChange = (sectionId, lessonId, field, value) => {
        setSyllabus(prev => prev.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) } : s));
    };
    
    const addLesson = (sectionId) => setSyllabus(prev => prev.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, { id: Date.now(), title: '', videoSource: 'upload', videoFile: null, videoUrl: '' }] } : s));
    const removeLesson = (sectionId, lessonId) => setSyllabus(prev => prev.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s));
    
    const handleThumbnailChange = (e) => { const file = e.target.files[0]; if (file) { setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file)); } };
    const handleIntroVideoChange = (e) => setIntroVideo(e.target.files[0]);
    const handleFreeCourseToggle = (e) => setFormData(prev => ({...prev, isFree: e.target.checked, price: e.target.checked ? '' : prev.price}));
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setIsLoading(true);

        const syllabusForSubmission = syllabus.map(section => ({
            title: section.title,
            lessons: section.lessons.map(lesson => ({
                title: lesson.title,
                videoSource: lesson.videoSource,
                videoUrl: lesson.videoUrl || null,
                gumletAssetId: lesson.gumletAssetId || null,
                videoFileName: (lesson.videoSource === 'upload' && lesson.videoFile) ? lesson.videoFile.name : null
            }))
        }));

        const submissionData = new FormData();
        
        // প্রতিটি ডাটা আলাদাভাবে অ্যাপেন্ড করা নিশ্চিত করছি
        submissionData.append('title', formData.title);
        submissionData.append('slug', formData.slug);
        submissionData.append('description', formData.description);
        submissionData.append('category', formData.category);
        submissionData.append('language', formData.language);
        submissionData.append('duration', formData.duration);
        submissionData.append('numberOfLessons', formData.numberOfLessons);
        submissionData.append('price', formData.price || 0);
        submissionData.append('isFree', formData.isFree);
        submissionData.append('outcomes', formData.outcomes.filter(i => i).join(','));
        submissionData.append('requirements', formData.requirements.filter(i => i).join(','));
        
  
submissionData.append('syllabus', JSON.stringify(syllabusForSubmission));

// ✅ Lesson videos systematically append করো
console.log('📤 Appending lesson videos to FormData...');
let videoFileIndex = 0;
syllabus.forEach((section, sectionIndex) => {
    section.lessons.forEach((lesson, lessonIndex) => {
        if (lesson.videoSource === 'upload' && lesson.videoFile) {
            console.log(`  Video ${videoFileIndex + 1}: Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1}`);
            console.log(`    Title: ${lesson.title}`);
            console.log(`    Filename: ${lesson.videoFile.name}`);
            console.log(`    Size: ${(lesson.videoFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            submissionData.append('lessonVideos', lesson.videoFile);
            videoFileIndex++;
        }
    });
});
console.log(`✅ Total ${videoFileIndex} lesson videos appended`);

if (thumbnail) submissionData.append('thumbnail', thumbnail);
if (introVideo) submissionData.append('introVideo', introVideo);
        try {
            const url = isEditMode ? `${API_BASE_URL}/api/courses/${courseId}` : `${API_BASE_URL}/api/courses/create`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: submissionData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'An error occurred.');
            
            setSuccess(result.message);
            setTimeout(() => router.push('/dashboard/courses/all'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (authLoading || (isEditMode && isLoading)) {
        return <div className="bg-slate-50"><FormSkeleton /></div>;
    }

    return (
        <div className="bg-slate-50">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{isEditMode ? 'কোর্স এডিট করুন' : 'নতুন কোর্স যোগ করুন'}</h1>
                    <p className="mt-1 text-slate-500">{isEditMode ? 'কোর্সের তথ্য আপডেট করুন।' : 'এই ফর্মটি পূরণ করে আপনার নতুন কোর্সটি পাবলিশ করুন।'}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <FormSection title="বেসিক তথ্য" icon={<BookOpen className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <InputField name="title" value={formData.title} onChange={handleChange} label="কোর্সের শিরোনাম" placeholder="e.g., Complete Web Development" />
                            <InputField name="slug" value={formData.slug} onChange={handleChange} label="স্লাগ (URL)" placeholder="e.g., complete-web-development" disabled={isEditMode} />
                            <TextareaField name="description" value={formData.description} onChange={handleChange} label="কোর্সের বর্ণনা" placeholder="A detailed description of the course..." />
                        </FormSection>

                        <FormSection title="ইন্সট্রাক্টর তথ্য" icon={<User className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <InputField name="instructorName" value={formData.instructorName} onChange={handleChange} label="ইন্সট্রাক্টরের নাম" disabled />
                            <TextareaField name="instructorBio" value={formData.instructorBio} onChange={handleChange} label="ইন্সট্রাক্টরের পরিচিতি" disabled />
                        </FormSection>

                        <FormSection title="আউটকাম ও রিকোয়ারমেন্ট" icon={<Target className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">এই কোর্স থেকে কি শিখবেন?</label>
                                {formData.outcomes.map((o, i) => <div key={i} className="flex gap-2 mb-2"><input type="text" value={o} onChange={(e) => handleListChange('outcomes', i, e.target.value)} className="w-full p-2 border rounded-md" placeholder={`Outcome #${i + 1}`} /><button type="button" onClick={() => removeListItem('outcomes', i)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button></div>)}
                                <button type="button" onClick={() => addListItem('outcomes')} className="text-sm font-semibold text-[#ea670c] hover:text-indigo-800"><Plus size={16} className="inline mr-1"/> আউটকাম যোগ করুন</button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">কোর্সের প্রয়োজনীয়তা</label>
                                {formData.requirements.map((r, i) => <div key={i} className="flex gap-2 mb-2"><input type="text" value={r} onChange={(e) => handleListChange('requirements', i, e.target.value)} className="w-full p-2 border rounded-md" placeholder={`Requirement #${i + 1}`} /><button type="button" onClick={() => removeListItem('requirements', i)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button></div>)}
                                <button type="button" onClick={() => addListItem('requirements')} className="text-sm font-semibold text-[#ea670c] hover:text-indigo-800"><Plus size={16} className="inline mr-1"/> রিকোয়ারমেন্ট যোগ করুন</button>
                            </div>
                        </FormSection>

                        <FormSection title="কোর্স সিলেবাস" icon={<ListChecks className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                            <div className="space-y-6">
                                {syllabus.map((s, si) => (
                                    <div key={s.id} className="border bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <input type="text" value={s.title} onChange={(e) => handleSectionTitleChange(s.id, e.target.value)} placeholder={`Section ${si + 1} Title`} className="text-lg font-semibold w-full bg-transparent focus:outline-none" />
                                            <button type="button" onClick={() => removeSection(s.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={18}/></button>
                                        </div>
                                        <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                                            {s.lessons.map((l, li) => (
                                                <div key={l.id} className="bg-white p-3 rounded-md border">
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                                                        <span className="text-sm font-medium">{li + 1}.</span>
                                                        <input type="text" value={l.title} onChange={(e) => handleLessonChange(s.id, l.id, 'title', e.target.value)} placeholder="Lesson Title" className="flex-1 p-1 border rounded-md" />
                                                        <button type="button" onClick={() => removeLesson(s.id, l.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button>
                                                    </div>
                                                    <div className="mt-3 pl-10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-medium text-slate-600">Video Source:</span>
                                                            <button type="button" onClick={() => handleLessonChange(s.id, l.id, 'videoSource', 'upload')} className={`px-2 py-1 text-xs rounded ${l.videoSource === 'upload' ? 'bg-[#ea670c] text-white' : 'bg-slate-200 text-slate-800'}`}>Upload</button>
                                                            <button type="button" onClick={() => handleLessonChange(s.id, l.id, 'videoSource', 'link')} className={`px-2 py-1 text-xs rounded ${l.videoSource === 'link' ? 'bg-[#ea670c] text-white' : 'bg-slate-200 text-slate-800'}`}>Link</button>
                                                        </div>
                                                        {l.videoSource === 'upload' ? 
                                                            <input type="file" accept="video/*" onChange={(e) => handleLessonChange(s.id, l.id, 'videoFile', e.target.files[0])} /> 
                                                            : 
                                                            <input type="url" value={l.videoUrl || ''} onChange={(e) => handleLessonChange(s.id, l.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full p-2 border rounded-md" />
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addLesson(s.id)} className="text-sm font-semibold text-[#ea670c] hover:text-indigo-800 ml-10"><Plus size={16} className="inline mr-1"/> Add Lesson</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addSection} className="w-full text-center py-3 border-2 border-dashed rounded-lg text-[#ea670c] font-semibold hover:bg-indigo-50 transition">Add Section</button>
                            </div>
                        </FormSection>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <FormSection title="কোর্স মেটাডেটা" icon={<Tag className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <SelectField label="ক্যাটাগরি" name="category" value={formData.category} onChange={handleChange}><option value="">Select Category</option><option value="web-development">Web Development</option></SelectField>
                                <SelectField label="ভাষা" name="language" value={formData.language} onChange={handleChange}><option value="বাংলা">বাংলা</option><option value="English">English</option></SelectField>
                                <InputField label="কোর্সের সময়কাল" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 12 hours 30 minutes"/>
                                <InputField label="মোট লেসন সংখ্যা" name="numberOfLessons" type="number" value={formData.numberOfLessons} onChange={handleChange} placeholder="e.g., 75"/>
                            </FormSection>
                            <FormSection title="মূল্য নির্ধারণ" icon={<DollarSign className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-md">
                                    <input type="checkbox" id="isFree" checked={formData.isFree} onChange={handleFreeCourseToggle} className="h-4 w-4 rounded text-[#ea670c] focus:ring-indigo-500"/>
                                    <label htmlFor="isFree" className="text-sm font-medium text-slate-800">This is a free course</label>
                                </div>
                                {!formData.isFree && <InputField label="মূল্য (BDT)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g., 1500" />}
                            </FormSection>
                            <FormSection title="কোর্স মিডিয়া" icon={<ImageIcon className="mr-3 h-6 w-6 text-[#ea670c]"/>}>
                                <FileUploadField label="কোর্স থাম্বনেইল" onFileSelect={handleThumbnailChange} preview={thumbnailPreview} Icon={ImageIcon} acceptedFiles="image/*" fileInfo={thumbnail} />
                                <hr className="my-4"/>
                                <FileUploadField label="ইন্ট্রো ভিডিও" onFileSelect={handleIntroVideoChange} fileInfo={introVideo} Icon={Film} acceptedFiles="video/*" />
                            </FormSection>
                            <FormSection title="পাবলিশ" icon={<CheckCircle className="mr-3 h-6 w-6 text-green-600"/>}>
                                 <button type="submit" disabled={isLoading} className="w-full bg-[#ea670c] text-white font-bold py-3 px-4 rounded-md hover:bg-[#c2570c] flex items-center justify-center disabled:bg-[#fb8a3c] disabled:cursor-not-allowed">
                                     {isLoading ? (
    <div className="flex items-center gap-2">
        <Loader2 className="animate-spin h-5 w-5" />
        <span>ভিডিও প্রসেসিং হচ্ছে, দয়া করে অপেক্ষা করুন...</span>
    </div>
) : (isEditMode ? 'কোর্স আপডেট করুন' : 'কোর্স পাবলিশ করুন')}
                                 </button>
                                <button type="button" className="w-full mt-2 bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-md hover:bg-slate-300">Save as Draft</button>
                            </FormSection>
                        </div>
                    </div>
                </div>
                
                {error && <div className="mt-6 p-3 bg-red-100 text-red-800 rounded-md text-center fixed bottom-5 right-5 shadow-lg">{error}</div>}
                {success && <div className="mt-6 p-3 bg-green-100 text-green-800 rounded-md text-center fixed bottom-5 right-5 shadow-lg">{success}</div>}
            </form>
        </div>
    );
}