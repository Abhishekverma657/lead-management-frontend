import React, { useState, useEffect } from "react";
import { 
    LucideUser, LucideUserPlus, LucideTrash2, LucideMail, LucidePhone, LucideStar, 
    LucideLayoutDashboard, LucideKey, LucideSearch, LucideHeadphones, 
    LucideBriefcase, LucideShield, LucideFilter, LucideEdit3, LucideUsers,
    LucideCheckCircle2, LucideClock, LucideLock, LucideRefreshCw, LucideRadio
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CreateStaffModal from "./CreateStaffModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Modal from "../../components/Modal";
import { createStaff, getStaff, updateStaff, deleteStaff } from "../../api/staffApi";
import { getExtensionsApi } from "../../api/telephonyApi";
import toast from "react-hot-toast";

export default function StaffPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isExtensionsModalOpen, setIsExtensionsModalOpen] = useState(false);
    const [extensionsList, setExtensionsList] = useState([]);
    const [isSyncingExtensions, setIsSyncingExtensions] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        role: "CALLER",
        agentExtension: "",
        password: ""
    });
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
        fetchExtensionsSilently();
    }, []);

    const fetchExtensionsSilently = async () => {
        try {
            const res = await getExtensionsApi();
            if (res.success && Array.isArray(res.data)) {
                setExtensionsList(res.data);
            }
        } catch (e) {
            console.warn("Silent fetch extensions error:", e.message);
        }
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await getStaff();
            if (res.success && Array.isArray(res.data)) {
                // Filter out any AUTO pseudo-assign entry
                const realStaff = res.data.filter(u => u._id !== "AUTO" && u.role !== "AUTO");
                const formattedStaff = realStaff.map(user => ({
                    id: user._id || user.id,
                    _id: user._id || user.id,
                    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                    role: user.role,
                    mobile: user.mobileNumber || user.mobile || "N/A",
                    email: user.email,
                    status: user.callerStatus || "Available",
                    agentExtension: user.agentExtension || "",
                    activeLeads: user.activeLeads || 0,
                    convertedLeads: user.convertedLeads || 0,
                    todayFollowUps: user.todayFollowUps || 0,
                }));
                setStaffList(formattedStaff);
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            toast.error("Failed to load staff list");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (formData) => {
        try {
            const res = await createStaff(formData);
            if (res.success) {
                toast.success(`Account for ${res.user.name} created successfully!`);
                fetchStaff();
            }
        } catch (error) {
            console.error("Create staff error:", error);
            toast.error(error.response?.data?.message || "Failed to create staff");
        }
    };

    const handleOpenEdit = (staff) => {
        setSelectedStaff(staff);
        setEditFormData({
            name: staff.name,
            email: staff.email,
            mobileNumber: staff.mobile === "N/A" ? "" : staff.mobile,
            role: staff.role,
            agentExtension: staff.agentExtension || "",
            password: ""
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedStaff) return;
        try {
            const res = await updateStaff(selectedStaff.id, editFormData);
            if (res.success) {
                toast.success("Staff profile updated successfully!");
                setIsEditModalOpen(false);
                fetchStaff();
            }
        } catch (error) {
            console.error("Update staff error:", error);
            toast.error(error.response?.data?.message || "Failed to update staff");
        }
    };

    const handleDeleteStaff = async (staffId, staffName) => {
        setSelectedStaff({ id: staffId, name: staffName });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedStaff) return;

        try {
            const res = await deleteStaff(selectedStaff.id);
            if (res.success) {
                toast.success(`${selectedStaff.name} removed successfully!`);
                fetchStaff();
            }
        } catch (error) {
            console.error("Delete staff error:", error);
            toast.error(error.response?.data?.message || "Failed to remove staff");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedStaff(null);
        }
    };

    const handleFetchAirtelExtensions = async () => {
        setIsSyncingExtensions(true);
        try {
            const res = await getExtensionsApi();
            if (res.success) {
                setExtensionsList(res.data || []);
                setIsExtensionsModalOpen(true);
                toast.success(`Found ${res.data?.length || 0} provisioned extensions`);
            }
        } catch (error) {
            console.error("Fetch extensions error:", error);
            const msg = error.response?.data?.message || "Failed to fetch extensions from Airtel IQ / Vonage";
            toast.error(msg);
        } finally {
            setIsSyncingExtensions(false);
        }
    };

    const handleAssignExtensionToCaller = async (extensionNumber) => {
        if (!selectedStaff) return;
        try {
            const res = await updateStaff(selectedStaff.id, { agentExtension: extensionNumber });
            if (res.success) {
                toast.success(`Extension ${extensionNumber} assigned to ${selectedStaff.name}!`);
                setIsExtensionsModalOpen(false);
                fetchStaff();
            }
        } catch (error) {
            toast.error("Failed to assign extension");
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case "CALLER":
            case "TELECALLER":
                return <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200"><LucideHeadphones size={12} /> Telecaller</span>;
            case "AGENT":
                return <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200"><LucideBriefcase size={12} /> Sales Agent</span>;
            case "COUNSELOR":
                return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">🎓 Counselor</span>;
            case "SUB_ADMIN":
                return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200"><LucideShield size={12} /> Sub-Admin</span>;
            default:
                return <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{role}</span>;
        }
    };

    const filteredStaff = staffList.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.mobile.includes(searchTerm);

        const matchesRole = roleFilter === "ALL" || 
            (roleFilter === "CALLER" && (s.role === "CALLER" || s.role === "TELECALLER")) ||
            s.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <>
            <CreateStaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateStaff}
                extensionsList={extensionsList}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedStaff(null);
                }}
                onConfirm={confirmDelete}
                staffName={selectedStaff?.name || ""}
            />

            {/* Airtel IQ Extensions Modal */}
            <Modal
                isOpen={isExtensionsModalOpen}
                onClose={() => setIsExtensionsModalOpen(false)}
                title="Airtel IQ PBX Extensions"
                subtitle="Live telephony extensions & assigned caller identities"
                icon={LucideHeadphones}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <p className="font-medium text-gray-700">
                            Active extensions provisioned in your Airtel IQ enterprise PBX account.
                        </p>
                        <span className="font-bold bg-orange-100 text-[#FF5B22] px-2.5 py-1 rounded-full shrink-0">
                            {extensionsList.length} Active
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                        {extensionsList.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                No extensions found in account. Check your VBC_ACCOUNT_ID and credentials.
                            </div>
                        ) : (
                            extensionsList.map((ext, idx) => {
                                const userName = ext.user 
                                    ? `${ext.user.first_name || ''} ${ext.user.last_name || ''}`.trim() 
                                    : ext.name || ext.label || `Extension ${ext.extension_number || ext.extension}`;
                                const userEmail = ext.user?.email || ext.user?.login_name || "";
                                const didNumber = ext.caller_id || ext.dids?.[0]?.phone_number || "Internal Only";
                                const extNum = ext.extension_number || ext.extension || ext.id;

                                return (
                                    <div 
                                        key={idx}
                                        className="p-3.5 bg-slate-50/70 hover:bg-orange-50/50 border border-slate-200/70 hover:border-orange-200 rounded-2xl flex items-center justify-between transition-all group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex flex-col items-center justify-center font-black text-xs shadow-md shadow-orange-500/20 shrink-0">
                                                <span className="text-[8px] uppercase tracking-tighter text-orange-100 font-semibold leading-none">EXT</span>
                                                <span className="text-xs font-extrabold leading-none mt-0.5">{extNum}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-gray-900">
                                                        {userName || `Extension ${extNum}`}
                                                    </p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {ext.status || "Active"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 mt-0.5">
                                                    {userEmail && (
                                                        <span className="text-gray-600 font-medium">✉️ {userEmail}</span>
                                                    )}
                                                    <span className="text-orange-700 font-semibold">📞 DID: {didNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(extNum));
                                                    toast.success(`Extension ${extNum} copied!`);
                                                }}
                                                className="px-3 py-1.5 bg-white hover:bg-[#FF5B22] hover:text-white border border-gray-200 hover:border-[#FF5B22] text-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                                title="Copy Extension Number"
                                            >
                                                Copy {extNum}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">
                            Tip: Copy extension number and assign it to any caller in the staff list.
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsExtensionsModalOpen(false)}
                            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Staff Member"
                subtitle="Update staff profile & Airtel IQ extension mapping"
                icon={LucideUser}
                size="md"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                            <input
                                type="text"
                                value={editFormData.mobileNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                            <select
                                value={editFormData.role}
                                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
                            >
                                <option value="CALLER">🎧 Caller / Telecaller</option>
                                <option value="AGENT">💼 Sales Agent</option>
                                <option value="COUNSELOR">🎓 Academic Counselor</option>
                                <option value="SUB_ADMIN">🛡️ Sub-Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                                <span>Extension / Airtel IQ</span>
                                <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200">Airtel IQ</span>
                            </label>
                            {extensionsList.length > 0 ? (
                                <select
                                    value={editFormData.agentExtension}
                                    onChange={(e) => setEditFormData({ ...editFormData, agentExtension: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-blue-900 bg-white cursor-pointer"
                                >
                                    <option value="">-- No Extension Assigned --</option>
                                    {extensionsList.map((ext, idx) => {
                                        const extNum = String(ext.extension_number || ext.extension || ext.id);
                                        const name = ext.user ? `${ext.user.first_name || ''} ${ext.user.last_name || ''}`.trim() : (ext.name || `Extension ${extNum}`);
                                        const did = ext.caller_id || ext.dids?.[0]?.phone_number || "";
                                        const isAssigned = ext.isAssigned;
                                        const isCurrent = selectedStaff && String(selectedStaff.agentExtension || "").trim() === extNum;
                                        const assignedName = ext.assignedStaff?.name;
                                        let tag = '[Available]';
                                        if (isCurrent) tag = '[Currently Assigned]';
                                        else if (isAssigned) tag = `[Connected: ${assignedName}]`;
                                        return (
                                            <option key={idx} value={extNum}>
                                                Ext {extNum} : {name} {did ? `(DID: ${did})` : ''} {tag}
                                            </option>
                                        );
                                    })}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={editFormData.agentExtension}
                                    onChange={(e) => setEditFormData({ ...editFormData, agentExtension: e.target.value })}
                                    placeholder="e.g. 404"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-blue-900 bg-white"
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <LucideLock size={13} className="text-amber-600" />
                            <span>Reset Password (Leave blank to keep current)</span>
                        </label>
                        <input
                            type="password"
                            value={editFormData.password}
                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                            placeholder="Enter new password (optional)"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="p-4 lg:p-6 space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-orange-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5B22]/20 text-orange-200 text-xs font-semibold mb-3 border border-[#FF5B22]/30">
                            <LucideHeadphones size={13} />
                            <span>Airtel IQ &amp; Telephony Team Manager</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                            Caller &amp; Agent Management
                        </h1>
                        <p className="text-orange-100/80 text-sm mt-1 max-w-xl">
                            Create accounts for your telecallers, map Airtel IQ extensions, assign leads, and monitor calling performance in real time.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleFetchAirtelExtensions}
                            disabled={isSyncingExtensions}
                            className="inline-flex items-center gap-2 px-4 py-3.5 bg-white/10 hover:bg-white/20 text-orange-200 hover:text-white rounded-2xl border border-white/20 transition-all font-bold text-sm cursor-pointer disabled:opacity-50"
                        >
                            {isSyncingExtensions ? <LucideRefreshCw size={16} className="animate-spin" /> : <LucideRadio size={16} className="text-[#FF5B22]" />}
                            <span>Airtel IQ Extensions</span>
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-2xl shadow-lg shadow-orange-500/30 transition-all font-bold text-sm transform active:scale-95 cursor-pointer"
                        >
                            <LucideUserPlus size={18} />
                            Add New Caller / Agent
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
                        {[
                            { id: "ALL", label: "All Staff", count: staffList.length },
                            { id: "CALLER", label: "🎧 Callers", count: staffList.filter(s => s.role === "CALLER" || s.role === "TELECALLER").length },
                            { id: "AGENT", label: "💼 Agents", count: staffList.filter(s => s.role === "AGENT").length },
                            { id: "COUNSELOR", label: "🎓 Counselors", count: staffList.filter(s => s.role === "COUNSELOR").length },
                            { id: "SUB_ADMIN", label: "🛡️ Sub-Admins", count: staffList.filter(s => s.role === "SUB_ADMIN").length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setRoleFilter(tab.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                    roleFilter === tab.id
                                        ? "bg-[#FF5B22] text-white shadow-sm"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    roleFilter === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <LucideSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search caller by name, mobile, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                    </div>
                </div>

                {/* Staff Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-4">
                                    {/* Top Profile Header Skeleton */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-13 h-13 rounded-2xl bg-orange-100/70 shrink-0"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                                <div className="h-5 w-20 bg-slate-100 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-xl bg-slate-100"></div>
                                    </div>

                                    {/* Contact box skeleton */}
                                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100/80 space-y-2.5">
                                        <div className="h-3.5 w-36 bg-slate-200 rounded"></div>
                                        <div className="h-3.5 w-44 bg-slate-100 rounded"></div>
                                        <div className="h-5 w-28 bg-orange-50 rounded"></div>
                                    </div>

                                    {/* 3 KPIs skeleton */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/60 h-14"></div>
                                        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60 h-14"></div>
                                        <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/60 h-14"></div>
                                    </div>
                                </div>

                                {/* Action Buttons skeleton */}
                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                                    <div className="h-9 bg-orange-100/60 rounded-xl"></div>
                                    <div className="h-9 bg-slate-100 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5B22] flex items-center justify-center mx-auto">
                            <LucideHeadphones size={28} />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">No Callers or Staff Found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {searchTerm ? "No caller matches your search query. Try changing filters." : "You haven't added any callers or agents yet. Click 'Add New Caller' above to create accounts."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map((staff) => (
                            <div
                                key={staff.id}
                                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Top Profile Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-orange-500/20">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#FF5B22] transition truncate max-w-[170px]">
                                                    {staff.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {getRoleBadge(staff.role)}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleOpenEdit(staff)}
                                            className="p-1.5 text-gray-400 hover:text-[#FF5B22] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                                            title="Edit Profile"
                                        >
                                            <LucideEdit3 size={16} />
                                        </button>
                                    </div>

                                    {/* Contact & Extension Card */}
                                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100/80 space-y-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-2.5">
                                            <LucidePhone size={14} className="text-gray-400" />
                                            <span className="font-semibold text-gray-800">{staff.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 truncate">
                                            <LucideMail size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{staff.email}</span>
                                        </div>
                                        {staff.agentExtension && (
                                            <div className="pt-1.5 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                                                <span className="text-gray-500">Airtel Extension:</span>
                                                <span className="font-mono font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
                                                    {staff.agentExtension}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* KPIs Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                                        <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100">
                                            <div className="text-[10px] font-bold text-[#FF5B22] uppercase tracking-wider">Leads</div>
                                            <div className="text-lg font-black text-orange-950 mt-0.5">{staff.activeLeads}</div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Converted</div>
                                            <div className="text-lg font-black text-emerald-900 mt-0.5">{staff.convertedLeads}</div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                                            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Follow-up</div>
                                            <div className="text-lg font-black text-amber-900 mt-0.5">{staff.todayFollowUps}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 pt-5 mt-4 border-t border-gray-100">
                                    <Link
                                        to="/lead-management/dashboard"
                                        state={{ counselor: staff }}
                                        className="flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl font-bold text-[#FF5B22] bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition"
                                    >
                                        <LucideLayoutDashboard size={14} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition cursor-pointer"
                                    >
                                        <LucideTrash2 size={14} />
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
