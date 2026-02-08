"use client";

import { User, Mail, Smartphone, Calendar, BookOpen, Star, Link as LinkIcon, Banknote, ShieldCheck, Award, Languages, Video, Clock, X, Info } from 'lucide-react';

const API_BASE_URL = 'https://api.microskill.com.bd';

// স্ট্যাটাস ব্যাজ
const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// ডেটা আইটেম দেখানোর জন্য Helper Component
const ProfileDetail = ({ icon, label, value }) => {
    // Return null if value is falsy or an empty array
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
        <div className="flex items-start text-sm py-2">
            <div className="flex-shrink-0 w-6 pt-0.5 text-slate-500">{icon}</div>
            <div className="ml-3 flex-1">
                <p className="font-semibold text-slate-800">{label}</p>
                {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {value.map((item, index) => (
                            <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                                {item}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-600 whitespace-pre-wrap break-words">{value}</p>
                )}
            </div>
        </div>
    );
};

// ফাইল (ছবি/পিডিএফ/লিঙ্ক) দেখানোর জন্য আলাদা Helper Component
const FileDetail = ({ icon, label, items }) => {
    // If no items or an empty array, render nothing
    if (!items || (Array.isArray(items) && items.length === 0)) return null;

    // Ensure items is always an array
    const itemList = Array.isArray(items) ? items : [items];

    return (
        <div className="flex items-start text-sm py-2">
            <div className="flex-shrink-0 w-6 pt-0.5 text-slate-500">{icon}</div>
            <div className="ml-3 flex-1">
                <p className="font-semibold text-slate-800">{label}</p>
                <div className="mt-2 space-y-2">
                    {itemList.map((url, index) => {
                         const isImage = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url);
                         const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}/${url}`;
                         const fileName = url.split('/').pop();

                         return (
                            <a key={index} href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#ea670c] hover:underline">
                                {isImage ? (
                                    <img src={fullUrl} alt={`${label} ${index + 1}`} className="h-10 w-10 rounded-md object-cover border border-slate-200" />
                                ) : (
                                    <ShieldCheck size={20} />
                                )}
                                <span className="text-sm font-medium">{isImage ? `View Image ${index + 1}` : fileName}</span>
                            </a>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function TeacherProfileModal({ teacher, onClose }) {
    if (!teacher) return null;

    const photoUrl = teacher.profilePhoto ? `${API_BASE_URL}/${teacher.profilePhoto}` : `https://ui-avatars.com/api/?name=${teacher.fullName}&size=128`;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-slate-900">Teacher Profile</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full"><X size={24} /></button>
                </div>

                <div className="p-6 md:p-8">
                    {/* --- Header Section --- */}
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                        <img src={photoUrl} alt={teacher.fullName} className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md" />
                        <div className="text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <h3 className="text-3xl font-bold text-slate-900">{teacher.fullName}</h3>
                                <StatusBadge status={teacher.status} />
                            </div>
                            <p className="text-slate-500 text-md">@{teacher.username}</p>
                            {teacher.status === 'REJECTED' && teacher.rejectionReason && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm text-left max-w-md">
                                    <p className="font-bold flex items-center"><Info size={16} className="mr-2"/> Rejection Reason:</p>
                                    <p className="mt-1">{teacher.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Personal & Professional Section */}
                        <div>
                            <h4 className="text-lg font-bold text-[#c2570c] border-b pb-2 mb-3">Professional & Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <ProfileDetail icon={<Mail size={16} />} label="Email" value={teacher.email} />
                                <ProfileDetail icon={<Smartphone size={16} />} label="Mobile" value={teacher.mobileNumber || 'N/A'} />
                                <ProfileDetail icon={<Calendar size={16} />} label="Date of Birth" value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                <ProfileDetail icon={<User size={16} />} label="Short Bio" value={teacher.shortBio || 'N/A'} />
                                <ProfileDetail icon={<Star size={16} />} label="Skills" value={teacher.skills} />
                                <div className="md:col-span-2">
                                     <ProfileDetail icon={<LinkIcon size={16} />} label="Social Links">
                                        <div className="flex flex-col space-y-1 mt-1">
                                            {teacher.socialLinks?.map((link, i) => (
                                                link && <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[#ea670c] hover:underline break-all">{link}</a>
                                            ))}
                                        </div>
                                    </ProfileDetail>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Bio (Full width) */}
                        <div>
                             <h4 className="text-lg font-bold text-[#c2570c] border-b pb-2 mb-3">Detailed Biography</h4>
                             <div className="bg-white p-4 rounded-md border text-slate-600 whitespace-pre-wrap">
                                {teacher.detailedBio || 'No detailed biography provided.'}
                             </div>
                        </div>

                        {/* Teaching Details Section */}
                        <div>
                            <h4 className="text-lg font-bold text-[#c2570c] border-b pb-2 mb-3">Teaching Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <ProfileDetail icon={<BookOpen size={16} />} label="Subjects" value={teacher.subjects} />
                                <ProfileDetail icon={<Languages size={16} />} label="Preferred Language" value={teacher.preferredLanguage} />
                                <ProfileDetail icon={<Video size={16} />} label="Teaching Mode" value={teacher.teachingMode} />
                                {/* --- Updated Availability Display --- */}
                                <ProfileDetail icon={<Clock size={16} />} label="Availability" value={teacher.availability || 'Not specified'} />
                            </div>
                        </div>
                        
                        {/* Certifications are now handled by FileDetail */}
                        <div>
                            <h4 className="text-lg font-bold text-[#c2570c] border-b pb-2 mb-3">Certifications & Verification</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                {/* --- New Certification Display --- */}
                                <div className="md:col-span-2">
                                  <FileDetail icon={<Award size={16} />} label="Certificates" items={teacher.certifications} />
                                </div>
                                <div className="md:col-span-2">
                                    <FileDetail icon={<ShieldCheck size={16} />} label="Identity Document" items={teacher.identityVerification} />
                                </div>
                            </div>
                        </div>


                        {/* Payment Section */}
                        <div>
                            <h4 className="text-lg font-bold text-[#c2570c] border-b pb-2 mb-3">Payment Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <ProfileDetail icon={<Banknote size={16} />} label="Bank Name" value={teacher.bankName || 'N/A'}/>
                                <ProfileDetail icon={<Banknote size={16} />} label="bankSection" value={teacher.bankSection || 'N/A'}/>
                                <ProfileDetail icon={<Banknote size={16} />} label="Account Number" value={teacher.accountNumber || 'N/A'}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}