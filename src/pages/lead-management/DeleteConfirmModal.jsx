import React from "react";
import Modal from "../../components/Modal";
import { LucideAlertTriangle, LucideTrash2, LucideShieldAlert } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, staffName }) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Delete Staff Account" 
            subtitle="Permanent member removal action"
            icon={LucideShieldAlert}
            iconColor="text-red-600"
            iconBg="bg-red-50 ring-1 ring-red-100"
            size="sm"
        >
            <div className="text-center py-2 space-y-4">
                {/* Warning Badge */}
                <div className="mx-auto w-14 h-14 bg-red-100/80 text-red-600 rounded-2xl flex items-center justify-center shadow-xs">
                    <LucideAlertTriangle size={28} />
                </div>

                {/* Message */}
                <div className="space-y-1">
                    <p className="text-sm text-gray-700 font-medium">
                        Are you sure you want to remove <span className="font-bold text-gray-900">"{staffName}"</span>?
                    </p>
                    <p className="text-xs text-gray-400">
                        Their lead assignments and historical logs will remain intact. This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-xs sm:text-sm text-gray-600 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-bold text-xs sm:text-sm shadow-md shadow-red-500/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LucideTrash2 size={16} />
                        Delete Member
                    </button>
                </div>
            </div>
        </Modal>
    );
}
