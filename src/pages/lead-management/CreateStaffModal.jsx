import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { 
    LucideUser, 
    LucidePhone, 
    LucideMail, 
    LucideHeadphones, 
    LucideBriefcase, 
    LucideLock, 
    LucideCheckSquare, 
    LucideSquare, 
    LucideSparkles,
    LucideShieldCheck,
    LucideEye,
    LucideEyeOff
} from "lucide-react";
import { getForms } from "../../api/formApi";

export default function CreateStaffModal({ isOpen, onClose, onSubmit, extensionsList = [] }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        role: "CALLER",
        agentExtension: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [availableForms, setAvailableForms] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [giveFormAccess, setGiveFormAccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchForms();
        }
    }, [isOpen]);

    const fetchForms = async () => {
        try {
            const res = await getForms();
            if (res.success) {
                setAvailableForms(res.data);
            }
        } catch (error) {
            console.error("Error fetching forms:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleFormSelection = (formId) => {
        setSelectedForms(prev =>
            prev.includes(formId)
                ? prev.filter(id => id !== formId)
                : [...prev, formId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const payload = {
            ...formData,
            permissions: {
                forms: giveFormAccess && selectedForms.length === 0,
                allowedForms: selectedForms
            }
        };

        setIsSubmitting(true);
        try {
            await onSubmit(payload);
            onClose();
            setFormData({
                name: "",
                email: "",
                mobileNumber: "",
                role: "CALLER",
                agentExtension: "",
                password: "",
                confirmPassword: "",
            });
            setSelectedForms([]);
            setGiveFormAccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const roles = [
        { id: "CALLER", label: "🎧 Telecaller", desc: "Calls & Follow-ups" },
        { id: "AGENT", label: "💼 Sales Agent", desc: "Deals & Pipeline" },
        { id: "COUNSELOR", label: "🎓 Academic Counselor", desc: "Admissions" },
        { id: "SUB_ADMIN", label: "🛡️ Sub-Admin", desc: "Team Lead" },
    ];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Add New Staff / Telecaller" 
            subtitle="Create telecaller account and bind with Airtel IQ extension"
            icon={LucideHeadphones}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Information */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5B22] flex items-center justify-center font-bold text-xs">
                            <LucideUser size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Basic Staff Profile
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucideUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Official Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucideMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="caller@nexted.in"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <LucidePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Airtel IQ Extension */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <LucideHeadphones size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Role & Airtel IQ Telephony
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-gray-700">
                            Assigned System Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r.id })}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        formData.role === r.id
                                            ? 'bg-white border-[#FF5B22] ring-2 ring-orange-500/15 shadow-xs'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 truncate">{r.label}</div>
                                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{r.desc}</div>
                                </button>
                            ))}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-700">
                                    Airtel IQ Extension User
                                </label>
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Live Telephony
                                </span>
                            </div>
                            {extensionsList.length > 0 ? (
                                <select
                                    name="agentExtension"
                                    value={formData.agentExtension}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-blue-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                >
                                    <option value="">-- Select Available Airtel IQ Extension --</option>
                                    {extensionsList.map((ext, idx) => {
                                        const extNum = ext.extension_number || ext.extension || ext.id;
                                        const name = ext.user ? `${ext.user.first_name || ''} ${ext.user.last_name || ''}`.trim() : (ext.name || `Extension ${extNum}`);
                                        const did = ext.caller_id || ext.dids?.[0]?.phone_number || "";
                                        const isAssigned = ext.isAssigned;
                                        const assignedName = ext.assignedStaff?.name;
                                        return (
                                            <option key={idx} value={String(extNum)}>
                                                Ext {extNum} : {name} {did ? `(DID: ${did})` : ''} {isAssigned ? `[Connected: ${assignedName}]` : '[Available]'}
                                            </option>
                                        );
                                    })}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="agentExtension"
                                    value={formData.agentExtension}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 401 or 402"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Access Permissions */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                <LucideBriefcase size={13} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Form Access Permissions
                                </h3>
                                <p className="text-[11px] text-gray-400">Restrict access to specific lead generation forms</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={giveFormAccess}
                                onChange={(e) => setGiveFormAccess(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#FF5B22]"></div>
                        </label>
                    </div>

                    {giveFormAccess && (
                        <div className="pt-2 border-t border-gray-200/60 space-y-2">
                            <p className="text-[11px] text-gray-500">Select which forms this staff member is allowed to see:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                                {availableForms.map(form => {
                                    const isChecked = selectedForms.includes(form._id);
                                    return (
                                        <div
                                            key={form._id}
                                            onClick={() => toggleFormSelection(form._id)}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                                isChecked
                                                    ? 'bg-orange-50 border-orange-200 text-orange-900 font-semibold'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            {isChecked ? (
                                                <LucideCheckSquare size={16} className="text-[#FF5B22] shrink-0" />
                                            ) : (
                                                <LucideSquare size={16} className="text-gray-300 shrink-0" />
                                            )}
                                            <span className="text-xs truncate">{form.title}</span>
                                        </div>
                                    );
                                })}
                                {availableForms.length === 0 && (
                                    <p className="text-xs text-gray-400 col-span-2 py-3 text-center">No active forms found</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Credentials */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                <LucideLock size={13} />
                            </div>
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Login Security Credentials
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                        >
                            {showPassword ? <LucideEyeOff size={13} /> : <LucideEye size={13} />}
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Set Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                placeholder="Create strong password"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <LucideShieldCheck size={15} />
                                Create Staff Account
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
