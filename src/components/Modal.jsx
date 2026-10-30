import React, { useEffect } from "react";
import { LucideX } from "lucide-react";

export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    subtitle,
    icon: Icon,
    iconColor = "text-[#FF5B22]",
    iconBg = "bg-orange-50 ring-1 ring-orange-100",
    children, 
    size = "md",
    footer = null,
    className = ""
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        "2xl": "max-w-6xl",
        full: "max-w-[95vw]",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop with modern deep blur */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Window Container */}
            <div
                className={`relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 ${sizeClasses[size]} w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modern Header */}
                {(title || Icon) && (
                    <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/50 shrink-0">
                        <div className="flex items-center gap-3.5 min-w-0">
                            {Icon && (
                                <div className={`w-10 h-10 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
                                    <Icon size={20} strokeWidth={2.2} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">{title}</h2>
                                {subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-200 shrink-0 cursor-pointer"
                            aria-label="Close modal"
                        >
                            <LucideX size={18} />
                        </button>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
                    {children}
                </div>

                {/* Optional Sticky Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

