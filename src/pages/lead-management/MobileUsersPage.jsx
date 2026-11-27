import React, { useState, useEffect } from "react";
import { 
    LucideUsers, 
    LucideStar, 
    LucidePhone, 
    LucideMail, 
    LucideAward, 
    LucideSearch, 
    LucideRefreshCcw, 
    LucideUserPlus,
    LucideKey,
    LucideEdit3,
    LucideTrash2,
    LucideShieldCheck,
    LucideShieldAlert,
    LucideCheckCircle2,
    LucideXCircle,
    LucideLock,
    LucideEye,
    LucideEyeOff,
    LucideMapPin,
    LucideCopy,
    LucideCheck,
    LucideFilter,
    LucideSparkles,
    LucideSmartphone
} from "lucide-react";
import { 
    getLeadUsers, 
    createLeadUser, 
    updateLeadUser, 
    deleteLeadUser, 
    changeLeadUserPassword 
} from "../../api/leadApi";
import ManageRewardsModal from "./ManageRewardsModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const ROLES = [
    { value: "COUNSELOR", label: "Counselor", desc: "Standard partner counselor" },
    { value: "FOS", label: "FOS (Field Agent)", desc: "Field Operations Staff" },
    { value: "FACULTY", label: "Faculty", desc: "Teaching & academic partner" },
    { value: "ACADEMIC_ASSOCIATE", label: "Academic Associate", desc: "Institutional coordinator" },
    { value: "LEARNER", label: "Learner / Alumni", desc: "Student referral ambassador" },
    { value: "TEAM_MEMBER", label: "Team Member", desc: "Internal sales & support" }
];

export default function MobileUsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modals state
    const [selectedUserForReward, setSelectedUserForReward] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [passwordUser, setPasswordUser] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);

    // Form states
    const [createForm, setCreateForm] = useState({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        password: "",
        role: "COUNSELOR",
        workingCity: "",
        address: ""
    });
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        role: "COUNSELOR",
        workingCity: "",
        address: ""
    });

    const [resetPasswordForm, setResetPasswordForm] = useState({
        newPassword: "",
        showPassword: false
    });

    const [copiedKey, setCopiedKey] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await getLeadUsers();
            if (res.success) {
                setUsers(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch lead users:", error);
            toast.error("Failed to load mobile app users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success(`Copied: ${text}`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const generateRandomPassword = () => {
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
        const nums = "23456789";
        let pwd = "";
        for (let i = 0; i < 4; i++) pwd += letters.charAt(Math.floor(Math.random() * letters.length));
        pwd += "#";
        for (let i = 0; i < 3; i++) pwd += nums.charAt(Math.floor(Math.random() * nums.length));
        return pwd;
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        const autoPass = generateRandomPassword();
        setCreateForm({
            firstName: "",
            lastName: "",
            mobileNumber: "",
            email: "",
            password: autoPass,
            role: "COUNSELOR",
            workingCity: "",
            address: ""
        });
        setShowCreatePassword(true);
        setIsCreateOpen(true);
    };

    // Submit Create App User
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!createForm.firstName.trim()) {
            toast.error("First name is required");
            return;
        }
        if (!createForm.mobileNumber.trim() || createForm.mobileNumber.trim().length < 10) {
            toast.error("A valid 10-digit mobile number is required as Login ID");
            return;
        }
        if (!createForm.password.trim() || createForm.password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await createLeadUser(createForm);
            if (res.success) {
                toast.success(`App user created! Login Mobile: ${createForm.mobileNumber.trim()}`);
                setIsCreateOpen(false);
                fetchUsers();
            } else {
                toast.error(res.message || "Failed to create user");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to create app user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            mobileNumber: user.mobileNumber || "",
            email: user.email?.includes("@leadconnect.local") ? "" : user.email || "",
            role: user.role || "COUNSELOR",
            workingCity: user.jobInformation?.workingCity || "",
            address: user.address || ""
        });
        setIsEditOpen(true);
    };

    // Submit Edit
    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!editForm.firstName.trim()) {
            toast.error("First name is required");
            return;
        }
        if (!editForm.mobileNumber.trim()) {
            toast.error("Mobile number is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await updateLeadUser(editingUser._id, editForm);
            if (res.success) {
                toast.success("User updated successfully");
                setIsEditOpen(false);
                fetchUsers();
            } else {
                toast.error(res.message || "Failed to update user");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Reset Password Modal
    const handleOpenResetPassword = (user) => {
        setPasswordUser(user);
        setResetPasswordForm({
            newPassword: generateRandomPassword(),
            showPassword: true
        });
        setIsResetPasswordOpen(true);
    };

    // Submit Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await changeLeadUserPassword(passwordUser._id, resetPasswordForm.newPassword);
            if (res.success) {
                toast.success(`Password updated for ${passwordUser.firstName}!`);
                setIsResetPasswordOpen(false);
            } else {
                toast.error(res.message || "Failed to change password");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to change password");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Status (Active / Suspended)
    const handleToggleStatus = async (user) => {
        const nextStatus = user.isActive === false ? true : false;
        try {
            const res = await updateLeadUser(user._id, { isActive: nextStatus });
            if (res.success) {
                setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
                toast.success(nextStatus ? `Account activated for ${user.firstName}` : `Account suspended for ${user.firstName}`);
            } else {
                toast.error(res.message || "Failed to toggle status");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change status");
        }
    };

    // Delete User
    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        try {
            setIsSubmitting(true);
            const res = await deleteLeadUser(deletingUser._id);
            if (res.success) {
                toast.success("App user deleted permanently");
                setIsDeleteOpen(false);
                setDeletingUser(null);
                fetchUsers();
            } else {
                toast.error(res.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.mobileNumber && u.mobileNumber.includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.referralCode && u.referralCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.jobInformation?.workingCity && u.jobInformation.workingCity.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

        const isUserActive = u.isActive !== false;
        const matchesStatus = 
            statusFilter === "ALL" ? true :
            statusFilter === "ACTIVE" ? isUserActive :
            statusFilter === "INACTIVE" ? !isUserActive : true;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const activeCount = users.filter(u => u.isActive !== false).length;
    const inactiveCount = users.length - activeCount;
    const totalPoints = users.reduce((acc, u) => acc + (u.points || 0), 0);
    const totalLeads = users.reduce((acc, u) => acc + (u.totalLeads || 0), 0);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Manage Rewards Modal */}
            <ManageRewardsModal 
                isOpen={!!selectedUserForReward}
                onClose={() => setSelectedUserForReward(null)}
                user={selectedUserForReward}
                onUpdate={fetchUsers}
            />

            {/* Header Banner */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 p-6 rounded-3xl border border-orange-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-[#FF5B22] text-white rounded-2xl shadow-md shadow-orange-500/20">
                            <LucideSmartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                Mobile App Users
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                Manage field counselors, provision app credentials, regulate access, and review rewards
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={handleOpenCreate}
                        className="flex-1 lg:flex-none px-5 py-2.5 bg-[#FF5B22] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
                    >
                        <LucideUserPlus size={18} />
                        <span>Add App User</span>
                    </button>
                    <button 
                        onClick={fetchUsers}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all cursor-pointer shadow-sm"
                        title="Refresh List"
                    >
                        <LucideRefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                            <LucideUsers size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{users.length}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        {activeCount} active &bull; {inactiveCount} suspended
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Counselors</span>
                        <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
                            <LucideShieldCheck size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
                    <div className="text-xs text-emerald-700/80 mt-1 font-medium">
                        Authorized to log in & submit leads
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">App Inflow Leads</span>
                        <div className="p-2 rounded-xl bg-orange-100/80 text-[#FF5B22]">
                            <LucideSparkles size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{totalLeads.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Leads submitted via Mobile App
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-[#FF5B22]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rewards Distributed</span>
                        <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700">
                            <LucideAward size={18} />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-[#FF5B22]">
                        {totalPoints.toLocaleString()} <span className="text-xs font-bold text-gray-400">Pts</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Total counselor incentives
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                    <LucideSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                        type="text"
                        placeholder="Search by name, mobile (Login ID), city or referral code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-medium"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Roles ({users.length})</option>
                            {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <LucideFilter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active Only ({activeCount})</option>
                        <option value="INACTIVE">Suspended Only ({inactiveCount})</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/90 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Login Credentials</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & City</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Leads</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Points</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
                                                <div className="space-y-1.5">
                                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-1.5">
                                                <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                                                <div className="h-3.5 w-36 bg-slate-100 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-100 rounded-full"></div></td>
                                        <td className="px-5 py-4 text-center"><div className="h-5 w-16 bg-slate-100 rounded-full mx-auto"></div></td>
                                        <td className="px-5 py-4 text-center"><div className="h-6 w-10 bg-slate-100 rounded mx-auto"></div></td>
                                        <td className="px-5 py-4 text-right"><div className="h-5 w-14 bg-slate-100 rounded ml-auto"></div></td>
                                        <td className="px-5 py-4 text-right"><div className="h-7 w-24 bg-slate-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const isActive = user.isActive !== false;
                                    const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
                                    const isCustomEmail = user.email && !user.email.endsWith("@leadconnect.local");

                                    return (
                                        <tr key={user._id} className="hover:bg-orange-50/25 transition-colors group">
                                            {/* User Details */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                                        isActive 
                                                            ? "bg-gradient-to-br from-orange-400 to-[#FF5B22] text-white shadow-sm" 
                                                            : "bg-gray-200 text-gray-500"
                                                    }`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                            {user.firstName} {user.lastName}
                                                            {user.referralCode && (
                                                                <button
                                                                    onClick={() => handleCopy(user.referralCode, `ref-${user._id}`)}
                                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-[#FF5B22] rounded text-[10px] font-mono transition-colors"
                                                                    title="Click to copy Referral Code"
                                                                >
                                                                    {copiedKey === `ref-${user._id}` ? <LucideCheck size={10} className="text-emerald-500" /> : <LucideCopy size={10} />}
                                                                    {user.referralCode}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">
                                                            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recent"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Login Credentials */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {user.mobileNumber}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(user.mobileNumber, `mob-${user._id}`)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Copy Login Mobile Number"
                                                        >
                                                            {copiedKey === `mob-${user._id}` ? <LucideCheck size={12} className="text-emerald-500" /> : <LucideCopy size={12} />}
                                                        </button>
                                                    </div>
                                                    <div className="text-gray-500 text-[11px] flex items-center gap-1">
                                                        <LucideMail size={11} className="text-gray-400" />
                                                        <span className={isCustomEmail ? "text-gray-700" : "text-gray-400 italic"}>
                                                            {isCustomEmail ? user.email : "Default system email"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role & City */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                        {user.role}
                                                    </span>
                                                    {user.jobInformation?.workingCity && (
                                                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                                            <LucideMapPin size={11} className="text-gray-400" />
                                                            {user.jobInformation.workingCity}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                                        isActive 
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                                                            : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                    }`}
                                                    title={isActive ? "Click to suspend account (blocks mobile login)" : "Click to reactivate account"}
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LucideXCircle size={12} className="text-red-500" />
                                                            Suspended
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Total Leads */}
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className="text-xs font-bold text-gray-800 bg-orange-50/80 px-2.5 py-1 rounded-lg border border-orange-100">
                                                    {user.totalLeads || 0}
                                                </span>
                                            </td>

                                            {/* Points */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1 font-bold text-sm text-[#FF5B22]">
                                                    <span>{user.points || 0}</span>
                                                    <LucideStar size={13} className="text-amber-500 fill-amber-500" />
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Manage Rewards Button */}
                                                    <button 
                                                        onClick={() => setSelectedUserForReward(user)}
                                                        className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"
                                                        title="Manage Rewards & History"
                                                    >
                                                        <LucideAward size={15} />
                                                    </button>

                                                    {/* Reset Password Button */}
                                                    <button 
                                                        onClick={() => handleOpenResetPassword(user)}
                                                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                                                        title="Change / Reset App Password"
                                                    >
                                                        <LucideKey size={15} />
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button 
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="p-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                                                        title="Edit User Information"
                                                    >
                                                        <LucideEdit3 size={15} />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button 
                                                        onClick={() => {
                                                            setDeletingUser(user);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                        className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                                                        title="Delete App User"
                                                    >
                                                        <LucideTrash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <LucideUsers size={32} className="text-gray-300" />
                                            <span className="text-sm font-medium">No mobile app users found matching your search.</span>
                                            <button
                                                onClick={handleOpenCreate}
                                                className="mt-2 text-xs font-bold text-[#FF5B22] hover:underline"
                                            >
                                                + Provision a new App User
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1. CREATE USER MODAL */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create & Provision App User"
                subtitle="Assign mobile credentials for field counselor or partner"
                icon={LucideUserPlus}
                size="lg"
            >
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div className="bg-orange-50/80 p-3.5 rounded-2xl border border-orange-100 flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-100 text-[#FF5B22] shrink-0 mt-0.5">
                            <LucideLock size={16} />
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-800">Admin-Controlled Mobile Access: </span>
                            Public sign-up is disabled on the mobile app. The <span className="font-semibold text-gray-800">Mobile Number</span> and <span className="font-semibold text-gray-800">Password</span> created here are the exact credentials the counselor will use to log in.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={createForm.firstName}
                                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                placeholder="e.g. Rahul"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={createForm.lastName}
                                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                placeholder="e.g. Verma"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Mobile Number (Login ID) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucidePhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={createForm.mobileNumber}
                                    onChange={(e) => setCreateForm({ ...createForm, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                    placeholder="10-digit mobile number"
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Initial Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showCreatePassword ? "text" : "password"}
                                    required
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-3.5 py-2.5 pr-18 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                        title={showCreatePassword ? "Hide" : "Show"}
                                    >
                                        {showCreatePassword ? <LucideEyeOff size={14} /> : <LucideEye size={14} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, password: generateRandomPassword() })}
                                        className="text-[10px] bg-gray-200 hover:bg-gray-300 font-bold px-1.5 py-0.5 rounded text-gray-700"
                                        title="Generate random password"
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                            <select
                                value={createForm.role}
                                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label} - {r.desc}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Working City / Territory
                            </label>
                            <input
                                type="text"
                                value={createForm.workingCity}
                                onChange={(e) => setCreateForm({ ...createForm, workingCity: e.target.value })}
                                placeholder="e.g. Pune, Mumbai, Delhi"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Email <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            placeholder="counselor@example.com"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF5B22] hover:bg-[#EA580C] rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <LucideRefreshCcw size={14} className="animate-spin" />
                            ) : (
                                <LucideCheckCircle2 size={15} />
                            )}
                            Create & Assign Access
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 2. EDIT USER MODAL */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit App User"
                subtitle={`Modify details for ${editingUser?.firstName || ""}`}
                icon={LucideEdit3}
                size="lg"
            >
                <form onSubmit={handleEditUser} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Mobile Number (Login ID) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={editForm.mobileNumber}
                                onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                placeholder="counselor@example.com"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Working City</label>
                            <input
                                type="text"
                                value={editForm.workingCity}
                                onChange={(e) => setEditForm({ ...editForm, workingCity: e.target.value })}
                                placeholder="City"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsEditOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF5B22] hover:bg-[#EA580C] rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <LucideRefreshCcw size={14} className="animate-spin" /> : <LucideCheck size={14} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 3. RESET PASSWORD MODAL */}
            <Modal
                isOpen={isResetPasswordOpen}
                onClose={() => setIsResetPasswordOpen(false)}
                title="Reset App Password"
                subtitle={`Set a new login password for ${passwordUser?.firstName} ${passwordUser?.lastName || ""}`}
                icon={LucideKey}
                size="md"
            >
                <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                    <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Mobile Login ID</div>
                            <div className="text-sm font-mono font-bold text-blue-800">{passwordUser?.mobileNumber}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(passwordUser?.mobileNumber, "pwd-mob")}
                            className="text-xs bg-white text-blue-700 px-2 py-1 rounded-lg border border-blue-200 font-bold hover:bg-blue-50"
                        >
                            {copiedKey === "pwd-mob" ? "Copied!" : "Copy ID"}
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={resetPasswordForm.showPassword ? "text" : "password"}
                                required
                                value={resetPasswordForm.newPassword}
                                onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                                placeholder="Enter at least 6 characters"
                                className="w-full px-3.5 py-2.5 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setResetPasswordForm(p => ({ ...p, showPassword: !p.showPassword }))}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    {resetPasswordForm.showPassword ? <LucideEyeOff size={14} /> : <LucideEye size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResetPasswordForm(p => ({ ...p, newPassword: generateRandomPassword() }))}
                                    className="text-[10px] bg-gray-200 hover:bg-gray-300 font-bold px-1.5 py-0.5 rounded text-gray-700"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                            Share this new password with the counselor so they can log in to the mobile app immediately.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsResetPasswordOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <LucideRefreshCcw size={14} className="animate-spin" /> : <LucideKey size={14} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 4. DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete App User"
                subtitle="Permanent action"
                icon={LucideTrash2}
                iconColor="text-red-500"
                iconBg="bg-red-50 ring-1 ring-red-100"
                size="sm"
            >
                <div className="p-6 space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-gray-900">{deletingUser?.firstName} {deletingUser?.lastName}</span> ({deletingUser?.mobileNumber})?
                    </p>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs">
                        ⚠️ Their mobile app access will be permanently revoked. Historical leads already registered under this counselor will remain intact in the CRM.
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsDeleteOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <LucideRefreshCcw size={13} className="animate-spin" /> : <LucideTrash2 size={13} />}
                            Delete Permanently
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
