import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { 
    LucideCheckSquare, 
    LucideUser, 
    LucideCalendar, 
    LucideAlertCircle, 
    LucideImage, 
    LucideSparkles,
    LucideFileText,
    LucideUploadCloud
} from "lucide-react";
import { getLeadUsers } from "../../api/leadApi";
import { getStaff } from "../../api/staffApi";

export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
        image: null
    });
    const [staffList, setStaffList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        setIsLoadingStaff(true);
        try {
            const [staffRes, leadUsersRes] = await Promise.allSettled([
                getStaff(),
                getLeadUsers()
            ]);
            
            let combined = [];
            if (staffRes.status === "fulfilled" && (staffRes.value?.success || Array.isArray(staffRes.value?.data || staffRes.value))) {
                const list = staffRes.value.data || staffRes.value || [];
                combined = [...combined, ...list];
            }
            if (leadUsersRes.status === "fulfilled" && (leadUsersRes.value?.success || Array.isArray(leadUsersRes.value?.data))) {
                const mobileList = leadUsersRes.value.data || [];
                // Add users not already in combined
                mobileList.forEach(u => {
                    if (!combined.some(c => (c._id || c.id) === (u._id || u.id))) {
                        combined.push(u);
                    }
                });
            }
            setStaffList(combined);
        } catch (error) {
            console.error("Failed to fetch staff members", error);
        } finally {
            setIsLoadingStaff(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("assignedTo", formData.assignedTo);
            data.append("priority", formData.priority);
            data.append("dueDate", formData.dueDate);
            if (formData.image) {
                data.append("image", formData.image);
            }

            await onSubmit(data);
            onClose();
            setFormData({
                title: "",
                description: "",
                assignedTo: "",
                priority: "Medium",
                dueDate: "",
                image: null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityOptions = [
        { label: "Low", value: "Low", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        { label: "Medium", value: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200" },
        { label: "High", value: "High", color: "bg-red-50 text-red-700 border-red-200" },
    ];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Task" 
            subtitle="Schedule action item or reminder for telecallers"
            icon={LucideCheckSquare}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Task Title */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. Follow up on demo class with Rahul Kumar"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <LucideFileText size={14} className="text-gray-400" />
                        Task Details / Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                        placeholder="Add checklist, context or instructions for this task..."
                    />
                </div>

                {/* Assignee & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Assign To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <LucideUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <select
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            >
                                <option value="">
                                    {isLoadingStaff ? "Loading staff members..." : "Select Staff Member"}
                                </option>
                                {staffList.map((staff) => {
                                    const staffId = staff._id || staff.id;
                                    const displayName = staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.email || `Staff (${staffId})`;
                                    const roleLabel = staff.role === 'CALLER' ? '🎧 Telecaller' : staff.role === 'AGENT' ? '💼 Agent' : staff.role === 'COUNSELOR' ? '🎓 Counselor' : staff.role || 'Staff';
                                    return (
                                        <option key={staffId} value={staffId}>
                                            {displayName} ({roleLabel})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Due Date
                        </label>
                        <div className="relative">
                            <LucideCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Priority Selection */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <LucideAlertCircle size={14} className="text-[#FF5B22]" />
                        Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {priorityOptions.map((p) => {
                            const isSelected = formData.priority === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                        isSelected 
                                            ? `${p.color} ring-2 ring-orange-500/20 shadow-xs scale-[1.02]` 
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${
                                        p.value === 'Low' ? 'bg-emerald-500' : p.value === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    {p.label} Priority
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Attachment / Image */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <LucideImage size={14} className="text-gray-400" />
                        Optional Attachment
                    </label>
                    <div className="relative border border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-3 bg-gray-50/50 hover:bg-orange-50/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5B22] flex items-center justify-center">
                                <LucideUploadCloud size={16} />
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-gray-700">
                                    {formData.image ? formData.image.name : "Upload screenshot or document"}
                                </p>
                                <p className="text-[11px] text-gray-400">PNG, JPG, PDF up to 10MB</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            name="image"
                            accept="image/*,.pdf"
                            onChange={handleChange}
                            id="task-file-upload"
                            className="hidden"
                        />
                        <label
                            htmlFor="task-file-upload"
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
                        >
                            Browse
                        </label>
                    </div>
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
                                Creating Task...
                            </>
                        ) : (
                            <>
                                <LucideSparkles size={15} />
                                Create Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
