"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, BookCopy, Banknote, ShieldCheck, Plus, Trash2, Loader2, Image as ImageIcon, FileText, X, Clock, CheckCircle, Info, Award } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'https://api.microskill.com.bd';

// ---------- Reusable Components (No changes needed) ----------
const FormSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-5 flex items-center">{icon}{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = true, helpText, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed" />
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);
const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3, helpText, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed" />
    </div>
);
const TagInput = ({ label, tags, setTags, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-md">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 bg-indigo-100 text-[#c2570c] text-sm font-medium px-2 py-1 rounded-full">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="text-indigo-500 hover:text-[#c2570c]"><X size={14} /></button>
                    </div>
                ))}
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-grow bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400" />
            </div>
        </div>
    );
};
const FileUploadField = ({ label, onFileSelect, preview, Icon, acceptedFiles, fileInfo, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="mt-1 flex items-center gap-4">
            {preview ? ( <img src={preview} alt="Preview" className="h-16 w-16 rounded-full object-cover" /> ) : (
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-slate-400" />
                </div>
            )}
            <label htmlFor={`file-upload-${label}`} className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                <span>{fileInfo ? 'Change File' : 'Upload File'}</span>
                <input id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" className="sr-only" onChange={onFileSelect} accept={acceptedFiles} />
            </label>
        </div>
        {fileInfo && <p className="mt-1.5 text-xs text-slate-500">Selected: {fileInfo.name}</p>}
        {helpText && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const StatusDisplay = ({ status, reason }) => {
    const statusInfo = {
        PENDING: { text: "Your application is pending approval.", icon: <Clock className="mr-2 h-5 w-5 text-yellow-500" />, color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
        APPROVED: { text: "Congratulations! Your teacher profile is approved.", icon: <CheckCircle className="mr-2 h-5 w-5 text-green-500" />, color: "bg-green-50 border-green-200 text-green-800" },
        REJECTED: { text: "Your application has been rejected.", icon: <X className="mr-2 h-5 w-5 text-red-500" />, color: "bg-red-50 border-red-200 text-red-800" },
    };
    const info = statusInfo[status] || { text: "Unknown status.", icon: null, color: "bg-gray-50" };

    return (
        <div className="space-y-3">
            <div className={`p-4 rounded-md border flex items-center text-sm font-medium ${info.color}`}>
                {info.icon}
                {info.text}
            </div>
            {status === 'REJECTED' && reason && (
                <div className="p-4 rounded-md border bg-blue-50 border-blue-200 text-blue-800">
                    <p className="font-bold flex items-center"><Info size={16} className="mr-2"/> Admin Feedback:</p>
                    <p className="mt-1 text-sm">{reason}</p>
                </div>
            )}
        </div>
    );
};

const FormSkeleton = () => (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8 text-center">
                <Skeleton height={36} width={300} className="mx-auto" />
                <Skeleton height={20} width={500} className="mx-auto mt-2" />
            </div>
            <div className="space-y-8">
                {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <Skeleton height={28} width={250} className="mb-5" />
                        <div className="space-y-4">
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </SkeletonTheme>
);

// ---------- Main Page Component ----------
export default function TeacherRegistrationForm() {
    const { user, isAuthenticated, loading: authLoading, token } = useAuth();
    const router = useRouter();
    
    const [editMode, setEditMode] = useState(false); 
    const [profileStatus, setProfileStatus] = useState(null); 
    const [rejectionReason, setRejectionReason] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '', mobileNumber: '', dateOfBirth: '', shortBio: '', detailedBio: '',
        skills: [], certifications: [], socialLinks: [''], subjects: [],
        preferredLanguage: 'বাংলা', teachingMode: 'HYBRID', availability: '',
        bankName: '', bankSection: '', accountNumber: '', termsAccepted: false,
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
    const [identityFile, setIdentityFile] = useState(null);
    const [certificationFiles, setCertificationFiles] = useState([]); // For newly uploaded files
    const [existingCertificates, setExistingCertificates] = useState([]); // For files already on server
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    useEffect(() => {
        const checkAndLoadProfile = async () => {
            if (!authLoading && isAuthenticated && token) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/teachers/my-profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const existingProfile = await response.json();
                        setFormData({ ...formData, ...existingProfile, socialLinks: existingProfile.socialLinks.length ? existingProfile.socialLinks : [''] });
                        setProfileStatus(existingProfile.status);
                        setRejectionReason(existingProfile.rejectionReason);
                        setExistingCertificates(existingProfile.certifications || []);
                        if (existingProfile.profilePhoto) {
                            setProfilePhotoPreview(`${API_BASE_URL}/${existingProfile.profilePhoto}`);
                        }
                        setEditMode(true);
                    } else {
                        setFormData(prev => ({ ...prev, fullName: user.name || '', mobileNumber: user.mobileNumber || '' }));
                        if (user.image) {
                            setProfilePhotoPreview(`${API_BASE_URL}/${user.image}`);
                        }
                        setEditMode(false);
                    }
                } catch (err) {
                    setError("Failed to check your profile status. Please try again.");
                } finally {
                    setPageLoading(false);
                }
            } else if (!authLoading) {
                setPageLoading(false);
            }
        };
        checkAndLoadProfile();
    }, [authLoading, user, isAuthenticated, token]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const handleSocialLinkChange = (index, value) => { const newLinks = [...formData.socialLinks]; newLinks[index] = value; setFormData(prev => ({ ...prev, socialLinks: newLinks })); };
    const addSocialLink = () => setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
    const removeSocialLink = (index) => setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));
    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            if (setPreview) setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleMultipleFileChange = (e) => {
        if (e.target.files) {
            setCertificationFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewCertificationFile = (fileName) => {
        setCertificationFiles(prev => prev.filter(file => file.name !== fileName));
    };

    const removeExistingCertificate = (filePath) => {
        setExistingCertificates(prev => prev.filter(path => path !== filePath));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.termsAccepted && !editMode) {
            setError("You must accept the terms and conditions.");
            return;
        }
        if (!token) {
            setError("You must be logged in to submit.");
            return;
        }
        setIsLoading(true);

        const submissionData = new FormData();
        const finalFormData = { ...formData, certifications: existingCertificates };
        Object.entries(finalFormData).forEach(([key, value]) => {
            submissionData.append(key, Array.isArray(value) ? value.join(',') : value);
        });

        if (profilePhoto) submissionData.append('profilePhoto', profilePhoto);
        if (identityFile) submissionData.append('identityFile', identityFile);
        
        certificationFiles.forEach(file => {
            submissionData.append('certifications', file);
        });
        
        const url = editMode ? `${API_BASE_URL}/api/teachers/my-profile` : `${API_BASE_URL}/api/teachers/register`;
        const method = editMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: submissionData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'An error occurred.');
            
            setSuccess(result.message);
            if (result.teacher) {
                setProfileStatus(result.teacher.status);
                setRejectionReason(result.teacher.rejectionReason);
            }
            setTimeout(() => { setSuccess(''); }, 3000); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || pageLoading) {
        return (
            <div className="bg-slate-50">
                <FormSkeleton />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <div className="flex flex-col justify-center items-center text-center bg-slate-50 h-screen"><ShieldCheck className="h-16 w-16 text-red-500 mb-4" /><h1 className="text-2xl font-bold text-slate-800">অ্যাক্সেস অনুমোদিত নয়</h1><p className="mt-2 text-slate-600">এই পেজটি দেখার জন্য আপনাকে প্রথমে লগইন করতে হবে।</p><button onClick={() => router.push('/signin')} className="mt-6 bg-[#ea670c] text-white font-bold py-2 px-6 rounded-md hover:bg-[#c2570c]">লগইন করুন</button></div>;
    }

    return (
        <div className="bg-slate-50">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{editMode ? 'আপনার শিক্ষক প্রোফাইল' : 'শিক্ষক হিসেবে যোগ দিন'}</h1>
                    <p className="mt-2 text-slate-500">{editMode ? 'এখানে আপনার তথ্য আপডেট করতে পারেন। আপডেট করার পর পুনরায় অ্যাডমিন অনুমোদনের প্রয়োজন হবে।' : 'আমাদের প্ল্যাটফর্মে আপনার জ্ঞান শেয়ার করুন এবং শিক্ষার্থীদের ভবিষ্যৎ গড়তে সাহায্য করুন।'}</p>
                </div>

                <div className="space-y-8">
                    {editMode && <StatusDisplay status={profileStatus} reason={rejectionReason} />}

                    <FormSection title="ব্যক্তিগত তথ্য" icon={<User className="mr-3 h-6 w-6 text-[#ea670c]" />}>
                         <InputField label="সম্পূর্ণ নাম" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="আপনার পুরো নাম লিখুন" disabled={!editMode} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="মোবাইল নম্বর" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="01xxxxxxxxx" required={false} />
                            <InputField label="জন্ম তারিখ" name="dateOfBirth" type="date" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} required={false} />
                         </div>
                         <FileUploadField label="প্রোফাইল ফটো" onFileSelect={(e) => handleFileChange(e, setProfilePhoto, setProfilePhotoPreview)} preview={profilePhotoPreview} fileInfo={profilePhoto} Icon={ImageIcon} acceptedFiles="image/*" />
                    </FormSection>
                    
                    <FormSection title="পেশাগত প্রোফাইল" icon={<Briefcase className="mr-3 h-6 w-6 text-[#ea670c]" />}>
                        <TextareaField label="সংক্ষিপ্ত পরিচিতি" name="shortBio" value={formData.shortBio} onChange={handleChange} placeholder="আপনার সম্পর্কে ১০০ শব্দের মধ্যে লিখুন..." />
                        <TextareaField label="বিস্তারিত পরিচিতি" name="detailedBio" value={formData.detailedBio} onChange={handleChange} placeholder="আপনার শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ইত্যাদি বিস্তারিত লিখুন..." rows={5} />
                        <TagInput label="দক্ষতা (Skills)" tags={formData.skills} setTags={(newTags) => setFormData(p => ({...p, skills: newTags}))} placeholder="স্কিল লিখে Enter চাপুন..." />
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">সার্টিফিকেশন (ফাইল আপলোড)</label>
                            {/* --- Existing Certificates Display --- */}
                            {editMode && existingCertificates.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-slate-800">Existing certificates:</h4>
                                    <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                                        {existingCertificates.map((filePath, index) => (
                                            <li key={index} className="px-3 py-2 flex items-center justify-between text-sm">
                                                <a href={`${API_BASE_URL}/${filePath}`} target="_blank" rel="noopener noreferrer" className="text-[#ea670c] hover:underline truncate">{filePath.split('/').pop()}</a>
                                                <button type="button" onClick={() => removeExistingCertificate(filePath)} className="ml-4 text-red-500 hover:text-red-700"><X size={16}/></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="certification-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#ea670c] hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload new files</span>
                                            <input id="certification-upload" name="certifications" type="file" className="sr-only" onChange={handleMultipleFileChange} multiple accept="image/*,.pdf" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </div>
                            {/* --- New Files for Upload Display --- */}
                            {certificationFiles.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-slate-800">New files to upload:</h4>
                                    <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                                        {certificationFiles.map((file, index) => (
                                            <li key={index} className="px-3 py-2 flex items-center justify-between text-sm">
                                                <span className="text-slate-700 truncate">{file.name}</span>
                                                <button type="button" onClick={() => removeNewCertificationFile(file.name)} className="ml-4 text-red-500 hover:text-red-700"><X size={16}/></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">সামাজিক মাধ্যমের লিঙ্ক</label>
                            {formData.socialLinks.map((link, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input type="url" value={link} onChange={(e) => handleSocialLinkChange(index, e.target.value)} className="w-full px-3 py-2 border rounded-md text-slate-900" placeholder="https://..." />
                                    {formData.socialLinks.length > 1 && <button type="button" onClick={() => removeSocialLink(index)} className="p-2 text-red-500"><Trash2 size={16}/></button>}
                                </div>
                            ))}
                            <button type="button" onClick={addSocialLink} className="text-sm text-[#ea670c] font-medium"><Plus size={16} className="inline mr-1"/> লিঙ্ক যোগ করুন</button>
                        </div>
                    </FormSection>

                    <FormSection title="শিক্ষাদান সম্পর্কিত তথ্য" icon={<BookCopy className="mr-3 h-6 w-6 text-[#ea670c]" />}>
                        <TagInput label="যেসব বিষয় পড়াতে আগ্রহী" tags={formData.subjects} setTags={(newTags) => setFormData(p => ({...p, subjects: newTags}))} placeholder="বিষয় লিখে Enter চাপুন..." />
                        <TextareaField label="আপনার সময়সূচী (Availability)" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g., Sunday - Thursday, 8 PM - 10 PM" rows={2} helpText="শিক্ষার্থীরা কখন আপনার সাথে যোগাযোগ করতে পারবে তা উল্লেখ করুন।" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block"><span className="text-sm font-medium text-slate-700 mb-1.5">পছন্দের ভাষা</span><select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full mt-1.5 px-3 py-2 border rounded-md text-slate-900"><option>বাংলা</option><option>English</option></select></label>
                            <label className="block"><span className="text-sm font-medium text-slate-700 mb-1.5">শিক্ষাদানের মাধ্যম</span><select name="teachingMode" value={formData.teachingMode} onChange={handleChange} className="w-full mt-1.5 px-3 py-2 border rounded-md text-slate-900"><option value="HYBRID">হাইব্রিড</option><option value="LIVE">শুধু লাইভ ক্লাস</option><option value="PRE_RECORDED">শুধু প্রি-রেকর্ডেড</option></select></label>
                        </div>
                    </FormSection>

                    <FormSection title="পেমেন্ট তথ্য" icon={<Banknote className="mr-3 h-6 w-6 text-[#ea670c]" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="ব্যাংকের নাম" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="আপনার ব্যাংকের নাম" required={false} />
                            <InputField label="শাখার নাম" name="bankSection" value={formData.bankSection} onChange={handleChange} placeholder="শাখার নাম" required={false} />
                            <InputField label="অ্যাকাউন্ট নম্বর" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="অ্যাকাউন্ট নম্বর" required={false} />
                        </div>
                    </FormSection>
                    
                    {!editMode && (
                        <FormSection title="ভেরিফিকেশন ও চুক্তি" icon={<ShieldCheck className="mr-3 h-6 w-6 text-[#ea670c]" />}>
                             <FileUploadField label="পরিচয়পত্র ভেরিফিকেশন (NID/Passport)" onFileSelect={(e) => handleFileChange(e, setIdentityFile)} fileInfo={identityFile} Icon={FileText} acceptedFiles="image/*,.pdf" />
                             <div className="flex items-start">
                                 <input id="terms" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#ea670c]" />
                                 <label htmlFor="terms" className="ml-2 block text-sm text-slate-900">আমি <a href="/terms" target="_blank" className="font-medium text-[#ea670c] hover:underline">শর্তাবলী ও নীতিমালা</a> পড়েছি এবং সম্মত আছি।</label>
                             </div>
                        </FormSection>
                    )}

                    <div className="mt-6 space-y-4">
                        {error && <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                        {success && <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
                    </div>
                    <div className="mt-8">
                        <button type="submit" disabled={isLoading} className="w-full bg-[#ea670c] text-white font-bold py-3 px-4 rounded-md hover:bg-[#c2570c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105 flex items-center justify-center disabled:bg-[#fb8a3c]">
                            {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> সাবমিট হচ্ছে...</>) : (editMode ? 'প্রোফাইল আপডেট করুন' : 'শিক্ষক হিসেবে রেজিস্টার করুন')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}