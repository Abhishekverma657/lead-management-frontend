import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, Mail, Phone, Shield, ShieldCheck, Lock, 
    ArrowLeft, CheckCircle2, Key, Radio, 
    Flame, Users, Headphones, Save, Loader2, Eye, EyeOff,
    Edit3, X, Sparkles, Building2, Check, Copy, ExternalLink, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { updateProfileApi, changePasswordApi } from '../api/auth';

export default function ProfilePage() {
    const { user, setUser } = useAppContext();
    const navigate = useNavigate();

    const isCaller = ['CALLER', 'AGENT', 'TELECALLER', 'COUNSELOR'].includes(user?.role);
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(user?.role);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Edit Profile State
    const [name, setName] = useState(user?.name || user?.firstName || '');
    const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || user?.phone || user?.mobile || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Change Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const openEditModal = () => {
        setName(user?.name || user?.firstName || '');
        setMobileNumber(user?.mobileNumber || user?.phone || user?.mobile || '');
        setIsEditModalOpen(true);
    };

    const openPasswordModal = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordModalOpen(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        try {
            setIsUpdatingProfile(true);
            const res = await updateProfileApi({ name: name.trim(), mobileNumber: mobileNumber.trim() });
            if (res.success) {
                toast.success('Profile updated successfully');
                const updatedUser = { ...user, name: name.trim(), mobileNumber: mobileNumber.trim() };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditModalOpen(false);
            } else {
                toast.error(res.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Update profile error:', err);
            toast.error(err.response?.data?.message || 'Error updating profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            toast.error('Please enter current and new password');
            return;
        }

        if (newPassword.length < 4) {
            toast.error('New password must be at least 4 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            setIsChangingPassword(true);
            const res = await changePasswordApi({ oldPassword, newPassword });
            if (res.success) {
                toast.success('Password changed successfully');
                setIsPasswordModalOpen(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.message || 'Failed to change password');
            }
        } catch (err) {
            console.error('Change password error:', err);
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const copyToClipboard = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied!`);
        });
    };

    const getRoleName = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'Super Administrator';
            case 'ADMIN': return 'Lead Connect Administrator';
            case 'SUB_ADMIN': return 'Sub-Administrator';
            case 'COUNSELOR': return 'Academic Counselor';
            case 'CALLER': return 'Telecaller / Counselor';
            case 'AGENT': return 'Support Agent';
            default: return role || 'Team Member';
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'ADMIN': return 'bg-orange-50 text-[#FF5B22] border-orange-200';
            case 'SUB_ADMIN': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'COUNSELOR':
            case 'CALLER': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const initials = (user?.name || user?.firstName || user?.email || 'U').substring(0, 2).toUpperCase();

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20 font-sans">
            {/* Header & Back Action (No Logout button here as requested) */}
            <div className="flex items-center gap-3.5">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 bg-white hover:bg-gray-100 rounded-2xl text-gray-600 transition border border-gray-200 shadow-2xs cursor-pointer"
                    title="Go Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {isCaller ? 'Counselor Desk Profile' : 'Account Profile'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        Overview of your CRM account, calling extension & security settings
                    </p>
                </div>
            </div>

            {/* Profile Overview Hero Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/50 via-amber-50/20 to-transparent rounded-full -mr-28 -mt-28 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start sm:items-center gap-5">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shrink-0">
                            {initials}
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                                    {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Team Member'}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(user?.role)}`}>
                                    {getRoleName(user?.role)}
                                </span>
                            </div>

                            <p className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">
                                <Mail size={14} className="text-gray-400 shrink-0" />
                                <span>{user?.email || 'No email attached'}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                {/* Telephony Extension ID Pill */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 shadow-2xs">
                                    <Headphones size={13} className="text-[#FF5B22]" />
                                    <span>Extension: </span>
                                    <strong className="font-mono text-gray-900">
                                        {user?.agentExtension || 'Not Assigned'}
                                    </strong>
                                    <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 ml-1">
                                        <Lock size={9} /> Locked
                                    </span>
                                </div>

                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Active & Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Top Action Buttons: Edit Profile & Change Password */}
                    <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
                        <button
                            onClick={openEditModal}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-[#FF5B22] border border-orange-200 rounded-2xl text-xs sm:text-sm font-bold transition shadow-2xs cursor-pointer"
                        >
                            <Edit3 size={16} />
                            <span>Edit Profile</span>
                        </button>

                        <button
                            onClick={openPasswordModal}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl text-xs sm:text-sm font-bold transition shadow-2xs cursor-pointer"
                        >
                            <Key size={16} />
                            <span>Change Password</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Clean Information Cards Grid (View-Only, Not Open Inputs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Personal & Contact Information */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-orange-50 text-[#FF5B22] rounded-xl font-bold">
                                <User size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
                                <p className="text-xs text-gray-400">Account identity & contact info</p>
                            </div>
                        </div>
                        <button
                            onClick={openEditModal}
                            className="text-xs font-bold text-[#FF5B22] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Edit3 size={13} /> Edit
                        </button>
                    </div>

                    <div className="space-y-3.5 pt-1">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-semibold text-gray-500">Full Name</span>
                            <span className="text-xs font-bold text-gray-900">{user?.name || user?.firstName || 'User'}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Email Address (Login)</span>
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span>{user?.email || '-'}</span>
                                {user?.email && (
                                    <button onClick={() => copyToClipboard(user.email, 'Email')} className="text-gray-400 hover:text-gray-700">
                                        <Copy size={12} />
                                    </button>
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Mobile / Calling No.</span>
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span>{user?.mobileNumber || user?.phone || user?.mobile || 'Not configured'}</span>
                                {(user?.mobileNumber || user?.phone) && (
                                    <button onClick={() => copyToClipboard(user.mobileNumber || user.phone, 'Mobile')} className="text-gray-400 hover:text-gray-700">
                                        <Copy size={12} />
                                    </button>
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Telephony Extension</span>
                            <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Lock size={11} className="text-gray-400" />
                                {user?.agentExtension || '404'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Workspace</span>
                            <span className="text-xs font-bold text-[#FF5B22] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
                                Lead Connect CRM
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Security & Access Info */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl font-bold">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Security & Credentials</h3>
                                <p className="text-xs text-gray-400">Password security and access role</p>
                            </div>
                        </div>
                        <button
                            onClick={openPasswordModal}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Key size={13} /> Update
                        </button>
                    </div>

                    <div className="space-y-3.5 pt-1">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-semibold text-gray-500">Account Password</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-gray-400">••••••••••••</span>
                                <button
                                    onClick={openPasswordModal}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition cursor-pointer"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Assigned Role</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle(user?.role)}`}>
                                {getRoleName(user?.role)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Extension Routing</span>
                            <span className="text-xs text-gray-600 font-medium">
                                Direct PBX mapped
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">Session Status</span>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Authenticated
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-t border-gray-50">
                            <span className="text-xs font-semibold text-gray-500">User ID</span>
                            <span className="text-[11px] font-mono text-gray-400">
                                {user?._id || user?.id || 'LC-USER'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Workspace Shortcuts */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {isCaller ? 'My Counselor Workspace' : 'CRM Workspace Shortcuts'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        to="/lead-management/focus-today"
                        className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-100 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-[#FF5B22] text-white shadow-xs">
                                <Flame size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-900 group-hover:text-[#FF5B22] transition-colors">
                                    Focus Today & Priority Calls
                                </div>
                                <p className="text-[11px] text-gray-500">Today's scheduled leads & follow-ups</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/lead-management/leads"
                        className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50/60 border border-blue-100 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {isCaller ? 'My Assigned Leads' : 'All Leads Workspace'}
                                </div>
                                <p className="text-[11px] text-gray-500">Browse and manage active pipeline</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* ================= MODALS ================= */}

            {/* 1. Edit Profile Modal Dialog */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5B22]">
                                    <Edit3 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Edit Profile Details</h3>
                                    <p className="text-xs text-gray-500">Update your name & contact mobile</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] focus:bg-white transition text-xs font-semibold text-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Mobile / Calling Number
                                </label>
                                <input
                                    type="text"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="Enter your mobile number"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] focus:bg-white transition text-xs font-semibold text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Email Address (Login ID)
                                </label>
                                <input
                                    type="text"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Managed by Super Admin.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                                    <span>Telephony Extension ID</span>
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                        <Lock size={10} /> Locked by Admin
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={user?.agentExtension || '404'}
                                        disabled
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-600 cursor-not-allowed pl-9"
                                    />
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Extension ID cannot be modified by counselor.</p>
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isUpdatingProfile}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="flex-1 py-2.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {isUpdatingProfile ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={15} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Change Password Modal Dialog */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Change Password</h3>
                                    <p className="text-xs text-gray-500">Update your account login password</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition text-xs font-semibold text-gray-900 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 4 characters"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition text-xs font-semibold text-gray-900 pr-10"
                                        required
                                        minLength={4}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition text-xs font-semibold text-gray-900"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    disabled={isChangingPassword}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Key size={15} />
                                            <span>Update Password</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
