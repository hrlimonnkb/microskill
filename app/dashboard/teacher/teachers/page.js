"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Eye, Loader2, ShieldAlert } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import TeacherProfileModal from '@/components/dashboard/TeacherProfileModal';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'https://api.microskill.com.bd';

// --- Reusable Components ---

const StatusBadge = ({ status }) => {
    const styles = { PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200', APPROVED: 'bg-green-100 text-green-800 border-green-200', REJECTED: 'bg-red-100 text-red-800 border-red-200' };
    const icons = { PENDING: <Clock size={14} className="mr-1.5" />, APPROVED: <CheckCircle size={14} className="mr-1.5" />, REJECTED: <XCircle size={14} className="mr-1.5" /> };
    return ( <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{icons[status]}{status}</span> );
};

const RejectReasonModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }
        setIsSubmitting(true);
        await onSubmit(reason);
        setIsSubmitting(false);
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">Reason for Rejection</h2></div>
                <div className="p-6 space-y-4">
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Please provide a clear reason why this application is being rejected. This will be sent to the applicant.</label>
                    <textarea id="rejectionReason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-gray-800" placeholder="e.g., Identity document was not clear..."></textarea>
                </div>
                <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-400 flex items-center">
                        {isSubmitting && <Loader2 className="animate-spin mr-2" size={16} />}
                        Submit Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- New Skeleton Component for the Table ---
const TableSkeleton = () => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase"><Skeleton width={80} /></th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase"><Skeleton width={100} /></th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase"><Skeleton width={60} /></th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase"><Skeleton width={70} /></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array(5).fill(0).map((_, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Skeleton circle height={40} width={40} />
                                    <div className="ml-4">
                                        <Skeleton height={15} width={120} />
                                        <Skeleton height={12} width={150} className="mt-1" />
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><Skeleton height={15} width={200} /></td>
                            <td className="px-6 py-4"><Skeleton height={24} width={90} /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <Skeleton circle height={28} width={28} />
                                    <Skeleton height={28} width={70} />
                                    <Skeleton height={28} width={70} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function AllTeachersPage() {
    const { role, loading: authLoading, token } = useAuth();
    const router = useRouter();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingTeacher, setRejectingTeacher] = useState(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            if (!token) { setLoading(false); return; }
            try {
                // setLoading(true) is already set, no need to set again
                const response = await fetch(`${API_BASE_URL}/api/admin/teachers`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Failed to fetch teacher data.');
                
                // Simulate a small delay for a smoother skeleton experience
                setTimeout(() => {
                    response.json().then(data => {
                        setTeachers(data);
                        setLoading(false);
                    });
                }, 700);

            } catch (err) { 
                setError(err.message);
                setLoading(false);
            }
        };

        if (!authLoading && role === 'ADMIN') fetchTeachers();
        else if (!authLoading) setLoading(false);
    }, [authLoading, role, token]);

    const handleStatusUpdate = async (teacherId, status, reason = '') => {
        setUpdatingId(teacherId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/teachers/${teacherId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status, reason }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Status update failed.');
            setTeachers(current => current.map(t => t.id === teacherId ? { ...t, status, rejectionReason: reason } : t));
        } catch (err) { alert(`Error: ${err.message}`); } finally { setUpdatingId(null); }
    };

    const openProfileModal = (teacher) => { setSelectedTeacher(teacher); setIsProfileModalOpen(true); };
    const closeProfileModal = () => { setIsProfileModalOpen(false); setSelectedTeacher(null); };

    const openRejectModal = (teacher) => { setRejectingTeacher(teacher); setIsRejectModalOpen(true); };
    const closeRejectModal = () => { setIsRejectModalOpen(false); setRejectingTeacher(null); };

    const submitRejection = async (reason) => {
        if (rejectingTeacher) {
            await handleStatusUpdate(rejectingTeacher.id, 'REJECTED', reason);
        }
    };

    if (authLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                    <div className="mb-6">
                        <Skeleton height={36} width={300} />
                        <Skeleton height={20} width={400} className="mt-2" />
                    </div>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <TableSkeleton />
                    </div>
                </SkeletonTheme>
            </div>
        );
    }

    if (role !== 'ADMIN') return <div className="flex flex-col items-center justify-center h-screen p-4"><ShieldAlert className="h-16 w-16 text-red-500 mb-4" /><h1 className="text-2xl font-bold">Access Denied</h1><p className="mt-2">Only admins can view this page.</p></div>;
    
    if (error) return <div className="p-4 text-red-600 bg-red-50">{error}</div>;

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
                    <p className="mt-1 text-gray-600">Approve or reject new teacher applications.</p>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {loading ? (
                        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                            <TableSkeleton />
                        </SkeletonTheme>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr className='text-gray-900'><th className="px-6 py-3 text-left text-xs font-bold uppercase">Teacher</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Subjects</th><th className="px-6 py-3 text-left text-xs font-bold uppercase">Status</th><th className="px-6 py-3 text-center text-xs font-bold uppercase">Actions</th></tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {teachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-full object-cover" src={teacher.profilePhoto ? `${API_BASE_URL}/${teacher.profilePhoto}` : `https://ui-avatars.com/api/?name=${teacher.fullName}`} alt={teacher.fullName} /></div><div className="ml-4"><div className="text-sm font-semibold text-gray-900">{teacher.fullName}</div><div className="text-sm text-gray-500">{teacher.email}</div></div></div></td>
                                            <td className="px-6 py-4"><div className="text-sm text-gray-900">{teacher.subjects.join(', ')}</div></td>
                                            <td className="px-6 py-4"><StatusBadge status={teacher.status} /></td>
                                            <td className="px-6 py-4 text-center"><div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => openProfileModal(teacher)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full" title="View Details"><Eye size={16} /></button>
                                                {teacher.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(teacher.id, 'APPROVED')} disabled={updatingId === teacher.id} className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 disabled:bg-gray-400">{updatingId === teacher.id && teacher.status !== 'REJECTED' ? '...' : 'Approve'}</button>
                                                        <button onClick={() => openRejectModal(teacher)} disabled={updatingId === teacher.id} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 disabled:bg-gray-400">{updatingId === teacher.id && teacher.status === 'REJECTED' ? '...' : 'Reject'}</button>
                                                    </>
                                                )}
                                            </div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {isProfileModalOpen && <TeacherProfileModal teacher={selectedTeacher} onClose={closeProfileModal} />}
            <RejectReasonModal isOpen={isRejectModalOpen} onClose={closeRejectModal} onSubmit={submitRejection} />
        </>
    );
}