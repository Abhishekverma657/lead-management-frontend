import React, { useState } from "react";
import Modal from "../../components/Modal";
import { 
    LucideTag, 
    LucideCalendar, 
    LucideUsers, 
    LucideImage, 
    LucideSparkles,
    LucidePalette,
    LucideUploadCloud
} from "lucide-react";

export default function CreateOfferModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "Discount",
        validTill: "",
        targetRole: "all",
        bannerColor: "#00C853",
        image: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            data.append("type", formData.type);
            data.append("validTill", formData.validTill);
            data.append("targetRoles", formData.targetRole);
            data.append("bannerColor", formData.bannerColor);
            if (formData.image) {
                data.append("image", formData.image);
            }

            await onSubmit(data);
            onClose();
            setFormData({
                title: "",
                description: "",
                type: "Discount",
                validTill: "",
                targetRole: "all",
                bannerColor: "#00C853",
                image: null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const colorOptions = [
        { label: "Emerald Green", value: "#00C853", ring: "ring-emerald-400" },
        { label: "Vibrant Orange", value: "#FF5B22", ring: "ring-orange-400" },
        { label: "Electric Blue", value: "#2196F3", ring: "ring-blue-400" },
        { label: "Royal Purple", value: "#9C27B0", ring: "ring-purple-400" },
        { label: "Coral Red", value: "#F44336", ring: "ring-red-400" },
        { label: "Amber Gold", value: "#FF9800", ring: "ring-amber-400" },
    ];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Campaign Offer" 
            subtitle="Publish promotional discounts & student incentives"
            icon={LucideTag}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Offer Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. Early Bird 20% Scholarship on IIT-JEE"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Offer Description & Terms
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                        placeholder="Detail discount structure, coupon codes, and terms..."
                    />
                </div>

                {/* Type & Valid Till */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Offer Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                        >
                            <option value="Discount">🏷️ Discount / Fee Waiver</option>
                            <option value="Referral">🤝 Referral Bonus</option>
                            <option value="Promotion">⚡ Special Flash Promo</option>
                            <option value="General">📢 General Announcement</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Valid Till Date
                        </label>
                        <div className="relative">
                            <LucideCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="date"
                                name="validTill"
                                value={formData.validTill}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Target Audience */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <LucideUsers size={14} className="text-[#FF5B22]" />
                        Target Audience
                    </label>
                    <select
                        name="targetRole"
                        value={formData.targetRole}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                        <option value="all">🌍 All Users (Everyone)</option>
                        <option value="COUNSELOR">🎓 Academic Counselors Only</option>
                        <option value="LEARNER">📚 Students / Learners Only</option>
                        <option value="ACADEMIC_ASSOCIATE">💼 Academic Associates</option>
                        <option value="FACULTY">👨‍🏫 Faculty Members</option>
                        <option value="FOS">🚶 Field Operations Staff (FOS)</option>
                        <option value="TEAM_MEMBER">👥 Team Members</option>
                    </select>
                </div>

                {/* Theme Color Swatches */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <LucidePalette size={14} className="text-purple-600" />
                        Campaign Theme Accent
                    </label>
                    <div className="flex items-center gap-3">
                        {colorOptions.map((color) => {
                            const isSelected = formData.bannerColor === color.value;
                            return (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, bannerColor: color.value })}
                                    className={`w-9 h-9 rounded-xl transition-all cursor-pointer shadow-xs ${
                                        isSelected 
                                            ? `ring-3 ${color.ring} ring-offset-2 scale-110 shadow-sm` 
                                            : "opacity-80 hover:opacity-100 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Banner Upload */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <LucideImage size={14} className="text-gray-400" />
                        Campaign Banner Image
                    </label>
                    <div className="border border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-3 bg-gray-50/50 hover:bg-orange-50/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5B22] flex items-center justify-center">
                                <LucideUploadCloud size={16} />
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-gray-700">
                                    {formData.image ? formData.image.name : "Select promotional poster image"}
                                </p>
                                <p className="text-[11px] text-gray-400">PNG, JPG, WebP landscape (16:9)</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            id="offer-image-upload"
                            className="hidden"
                        />
                        <label
                            htmlFor="offer-image-upload"
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
                                Publishing Offer...
                            </>
                        ) : (
                            <>
                                <LucideSparkles size={15} />
                                Launch Offer
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
