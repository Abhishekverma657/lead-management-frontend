import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { 
    LucideUser, 
    LucidePhone, 
    LucideGraduationCap, 
    LucideMapPin, 
    LucideFileText, 
    LucideUserCheck, 
    LucideSparkles,
    LucideBookOpen,
    LucideHeartHandshake
} from "lucide-react";
import { getStaff } from "../../api/staffApi";
import { getLeadUsers } from "../../api/leadApi";

export default function CreateLeadModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        studentName: "",
        mobileNumber: "",
        class: "",
        parentName: "",
        parentMobile: "",
        city: "",
        inquiryFor: "",
        remarks: "",
        assignedTo: "Auto-assign",
    });

    const [staffList, setStaffList] = useState([]);
    const [leadUsersList, setLeadUsersList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [staffRes, leadUsersRes] = await Promise.allSettled([
                getStaff(),
                getLeadUsers()
            ]);
            
            if (staffRes.status === "fulfilled" && (staffRes.value?.success || Array.isArray(staffRes.value?.data || staffRes.value))) {
                setStaffList(staffRes.value.data || staffRes.value || []);
            }
            if (leadUsersRes.status === "fulfilled" && (leadUsersRes.value?.success || Array.isArray(leadUsersRes.value?.data))) {
                setLeadUsersList(leadUsersRes.value.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch assignment list", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
            setFormData({
                studentName: "",
                mobileNumber: "",
                class: "",
                parentName: "",
                parentMobile: "",
                city: "",
                inquiryFor: "",
                remarks: "",
                assignedTo: "Auto-assign",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Lead" 
            subtitle="Register student inquiry and auto-route to counselor"
            icon={LucideSparkles}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Student Information */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5B22] flex items-center justify-center font-bold text-xs">
                            <LucideUser size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Student Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Student Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucideUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Student Mobile <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucidePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="10-digit mobile number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Class / Standard
                            </label>
                            <div className="relative">
                                <LucideGraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Select Class</option>
                                    <option value="6th">6th Standard</option>
                                    <option value="7th">7th Standard</option>
                                    <option value="8th">8th Standard</option>
                                    <option value="9th">9th Standard</option>
                                    <option value="10th">10th Standard</option>
                                    <option value="11th">11th Standard</option>
                                    <option value="12th">12th Standard</option>
                                    <option value="Dropper">Dropper / Repeater</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Inquiry For (Course)
                            </label>
                            <div className="relative">
                                <LucideBookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <select
                                    name="inquiryFor"
                                    value={formData.inquiryFor}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Select Target Course</option>
                                    <option value="IIT-JEE">IIT-JEE (Main + Advanced)</option>
                                    <option value="NEET">NEET Medical</option>
                                    <option value="Foundation">Pre-Foundation / Olympiad</option>
                                    <option value="CBSE">CBSE Boards Support</option>
                                    <option value="Crash Course">Crash Course</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Parent Information */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            <LucideHeartHandshake size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Parent / Guardian Details
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Parent Name
                            </label>
                            <div className="relative">
                                <LucideUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Parent / Guardian name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Parent Mobile
                            </label>
                            <div className="relative">
                                <LucidePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="tel"
                                    name="parentMobile"
                                    value={formData.parentMobile}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Parent contact number"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Location & Assignment */}
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            <LucideMapPin size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Location & Lead Routing
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                City / Region
                            </label>
                            <div className="relative">
                                <LucideMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Lucknow, Kanpur, Delhi"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Assign Lead To
                            </label>
                            <div className="relative">
                                <LucideUserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                >
                                    <option value="Auto-assign">⚡ Auto-assign Pool (Unassigned)</option>
                                    <option value="Self">👤 Assign to Me (Self)</option>
                                    {staffList.map((staff) => (
                                        <option key={staff._id || staff.id} value={staff._id || staff.id}>
                                            {staff.name || staff.firstName} ({staff.role === 'CALLER' ? '🎧 Telecaller' : staff.role === 'AGENT' ? '💼 Agent' : staff.role || 'Staff'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Remarks */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <LucideFileText size={14} className="text-gray-400" />
                        Remarks / Initial Notes
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows={2}
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                        placeholder="Add student inquiry background or initial remarks..."
                    />
                </div>

                {/* Actions */}
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
                        className="px-6 py-2.5 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Creating Lead...
                            </>
                        ) : (
                            <>
                                <LucideSparkles size={15} />
                                Create Lead
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
