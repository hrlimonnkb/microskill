"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, ChevronDown, UserX, Users, UserCircle2, Mail, Phone, Pencil, Save, X, Loader2, PlusCircle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';
const DEFAULT_ADMIN_EMAIL = 'sheblumicroters@gmail.com';

// --- Helper Components ---

const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
);

const RoleSelector = ({ user, onUpdate, isUpdating }) => {
    const [currentRole, setCurrentRole] = useState(user.role);
    const handleSelectChange = (e) => {
        const newRole = e.target.value;
        if (newRole !== currentRole) {
            onUpdate(user.id, newRole).then(success => {
                if (success) setCurrentRole(newRole);
            });
        }
    };
    return (
        <div className="relative w-36">
            <select value={currentRole} onChange={handleSelectChange} disabled={isUpdating} className={`w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isUpdating ? 'cursor-not-allowed opacity-70' : ''}`}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
    );
};

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', username: user.username || '', mobileNumber: user.mobileNumber || '' });
            setImagePreview(user.image ? `${API_BASE_URL}/${user.image}` : null);
            setImageFile(null);
        }
    }, [user]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(user.id, formData, imageFile);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Edit User Details</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-black">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                            <div className="flex items-center space-x-4">
                                <img src={imagePreview || `https://placehold.co/96x96/e2e8f0/64748b?text=${formData.name ? formData.name.charAt(0) : '?'}`} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-white shadow" />
                                <label htmlFor="image-upload-edit" className="cursor-pointer flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"><UploadCloud size={16} className="mr-2" />Change</label>
                                <input id="image-upload-edit" type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        </div>
                        <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" /></div>
                        <div><label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" /></div>
                        <div><label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label><input type="text" name="mobileNumber" id="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" /></div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#ea670c] border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-[#c2570c] disabled:bg-[#fb8a3c] flex items-center">{isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}Save Changes</button></div>
                </form>
            </div>
        </div>
    );
};

const CreateUserModal = ({ isOpen, onClose, onCreate }) => {
    const initialFormData = { name: '', username: '', email: '', password: '', mobileNumber: '', role: 'STUDENT' };
    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onCreate(formData, imageFile);
        setIsSaving(false);
        if (success) {
            setFormData(initialFormData);
            setImageFile(null);
            setImagePreview(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Create New User</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-black">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                             <div className="flex items-center space-x-4">
                                <img src={imagePreview || `https://placehold.co/96x96/e2e8f0/64748b?text=?`} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-white shadow" />
                                <label htmlFor="image-upload-create" className="cursor-pointer flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"><UploadCloud size={16} className="mr-2" />Upload</label>
                                <input id="image-upload-create" type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                             </div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label><input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option></select></div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#ea670c] border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-[#c2570c] disabled:bg-[#fb8a3c] flex items-center">{isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <PlusCircle className="mr-2" size={16} />}Create User</button></div>
                </form>
            </div>
        </div>
    );
};

const TableSkeleton = () => (
    <div className="overflow-x-auto"><table className="min-w-full"><thead><tr>{Array(5).fill(0).map((_, i) => (<th key={i} className="px-6 py-4"><Skeleton className="h-5 w-3/4" /></th>))}</tr></thead><tbody>{Array(5).fill(0).map((_, i) => (<tr key={i} className="border-b border-gray-200"><td className="px-6 py-4"><div className="flex items-center space-x-3"><Skeleton className="h-10 w-10 rounded-full" /><div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-3 w-32" /></div></div></td><td className="px-6 py-4"><Skeleton className="h-4 w-48 mb-1" /><Skeleton className="h-3 w-32" /></td><td className="px-6 py-4"><Skeleton className="h-8 w-28" /></td><td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td><td className="px-6 py-4 flex justify-center"><Skeleton className="h-8 w-8 rounded-full" /></td></tr>))}</tbody></table></div>
);

// --- Main Component ---

export default function UserManagementTable() {
    const { role, loading: authLoading, token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            try {
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch users.');
                setUsers(await response.json());
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        if (role === 'ADMIN') setTimeout(fetchUsers, 500); else if (!authLoading) setLoading(false);
    }, [role, token, authLoading]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);
    const handleOpenEditModal = (user) => { setEditingUser(user); setIsEditModalOpen(true); };
    const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingUser(null); };

    const handleCreateUser = async (newUserData, imageFile) => {
        const formData = new FormData();
        Object.keys(newUserData).forEach(key => formData.append(key, newUserData[key]));
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/create`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to create user.');
            const result = await response.json();
            setUsers(currentUsers => [result.user, ...currentUsers]);
            handleCloseCreateModal();
            return true;
        } catch (err) { console.error(err.message); alert(`Error: ${err.message}`); return false; }
    };

    const handleUserUpdate = async (userId, updatedData, imageFile) => {
        setUpdatingId(userId);
        const formData = new FormData();
        Object.keys(updatedData).forEach(key => formData.append(key, updatedData[key]));
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to update user.');
            const result = await response.json();
            setUsers(currentUsers => currentUsers.map(u => u.id === userId ? result.user : u));
            handleCloseEditModal();
        } catch (err) { console.error(err.message); alert(`Error: ${err.message}`); } finally { setUpdatingId(null); }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ role: newRole }) });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to update role.');
            setUsers(currentUsers => currentUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
            return true;
        } catch (err) { console.error(err.message); alert(`Error: ${err.message}`); return false; } finally { setUpdatingId(null); }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;
        setUpdatingId(userId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete user.');
            setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        } catch (err) { console.error(err.message); alert(`Error: ${err.message}`); } finally { setUpdatingId(null); }
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    if (authLoading) return <TableSkeleton />;
    if (role !== 'ADMIN') return <div className="flex flex-col justify-center items-center text-center p-8 bg-red-50 rounded-lg border border-red-200"><ShieldAlert className="h-12 w-12 text-red-500 mb-3" /><h2 className="text-xl font-bold text-red-800">Access Denied</h2><p className="mt-1 text-red-700">Only administrators can view this page.</p></div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;

    return (
        <>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div><h1 className="text-2xl font-bold text-gray-800">User Management</h1><p className="text-sm text-gray-500 mt-1">View, edit, and manage system users.</p></div>
                    <div className='flex items-center gap-4'>
                        <div className="flex items-center bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg"><Users className="h-5 w-5 mr-2" /><span>{users.length} Total Users</span></div>
                        <button onClick={handleOpenCreateModal} className="flex items-center justify-center px-4 py-2 bg-[#ea670c] text-white font-semibold rounded-lg hover:bg-[#c2570c] transition-colors"><PlusCircle size={18} className="mr-2" />Create User</button>
                    </div>
                </div>
                {loading ? <TableSkeleton /> : (users.length === 0 ? <div className="flex flex-col items-center justify-center p-16 text-center"><UserX className="h-20 w-20 text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-700">No Users Found</h3><p className="text-sm text-gray-500">The user list is currently empty.</p></div> : 
                <div className="overflow-x-auto text-black">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined On</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${updatingId === u.id ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={u.image ? `${API_BASE_URL}/${u.image}` : `https://placehold.co/40x40/e2e8f0/64748b?text=${u.name ? u.name.charAt(0).toUpperCase() : '?'}`} alt={u.name || u.username} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{u.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">@{u.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center text-gray-900"><Mail size={14} className="mr-2 text-gray-400" /> {u.email}</div>
                                        <div className="flex items-center text-gray-500 mt-1"><Phone size={14} className="mr-2 text-gray-400" /> {u.mobileNumber || 'Not provided'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.email === DEFAULT_ADMIN_EMAIL ? <span className="font-bold text-purple-700">Super Admin</span> : <RoleSelector user={u} onUpdate={handleRoleUpdate} isUpdating={updatingId === u.id} />}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {u.email !== DEFAULT_ADMIN_EMAIL && (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleOpenEditModal(u)} className="p-2 text-gray-500 hover:text-[#ea670c] hover:bg-indigo-50 rounded-full transition-colors" title="Edit User"><Pencil size={18} /></button>
                                                <button onClick={() => handleDeleteUser(u.id, u.username)} disabled={updatingId === u.id} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full disabled:text-gray-300 transition-colors" title="Delete User"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
            <EditUserModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} user={editingUser} onSave={handleUserUpdate} />
            <CreateUserModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onCreate={handleCreateUser} />
        </>
    );
}

