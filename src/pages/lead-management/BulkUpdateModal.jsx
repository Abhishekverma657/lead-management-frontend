import React, { useState, useEffect, useRef } from 'react';
import { LucideX, LucideCheck, LucideSearch, LucideLayers, LucideSparkles, LucideFilter, LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllLeads } from '../../api/leadApi';

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", allLabel = "All Options" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <div 
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-all ${
                    isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate font-medium ${!value ? 'text-gray-400' : 'text-gray-800'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <LucideCheck size={14} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full min-w-[200px] mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                            <LucideSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
                        <div 
                            className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                                value === "" ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                                setSearch("");
                            }}
                        >
                            {allLabel}
                        </div>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer truncate flex items-center justify-between transition-colors ${
                                        value === opt.value ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    title={opt.label}
                                >
                                    <span className="truncate pr-2">{opt.label}</span>
                                    {value === opt.value && <LucideCheck size={13} className="shrink-0 text-emerald-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-xs text-center text-gray-400">No matching options</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function BulkUpdateModal({ isOpen, onClose, filters: initialFilters, sourceOptions = [], onUpdate }) {
    const [loading, setLoading] = useState(false);
    
    // Internal filters for update
    const [localFilters, setLocalFilters] = useState({
        source: initialFilters?.source || "",
        class: initialFilters?.class || "",
        course: initialFilters?.course || "",
        status: initialFilters?.status || ""
    });
    
    const [totalMatchingLeads, setTotalMatchingLeads] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);

    const [updateType, setUpdateType] = useState('course');
    const [updateValue, setUpdateValue] = useState("");

    useEffect(() => {
        const fetchCount = async () => {
            setIsCalculating(true);
            try {
                const res = await getAllLeads(1, 1, localFilters);
                const newCount = res.total || 0;
                setTotalMatchingLeads(newCount);
            } catch (err) {
                console.error("Error fetching count:", err);
            } finally {
                setIsCalculating(false);
            }
        };
        if (isOpen) fetchCount();
    }, [localFilters, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!updateValue.trim()) {
            return toast.error(`Please enter a valid ${updateType}`);
        }
        if (totalMatchingLeads === 0) {
            return toast.error("No leads match the selected filters");
        }

        const updates = { [updateType]: updateValue.trim() };
        
        setLoading(true);
        try {
            await onUpdate({ filters: localFilters, updates });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const courseSuggestions = ["IIT-JEE", "NEET", "Foundation", "Target", "Pre-Foundation", "Crash Course"];
    const classSuggestions = ["6th", "7th", "8th", "9th", "10th", "11th", "12th", "Dropper"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div 
                className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <LucideRefreshCw size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Bulk Update Leads</h2>
                            <p className="text-xs text-gray-500">Update specific fields for all matching leads</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                    >
                        <LucideX size={18} />
                    </button>
                </div>

                {/* Body */}
                <form id="bulk-update-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                    
                    {/* Step 1: Select Source */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                <LucideFilter size={14} className="text-emerald-600" />
                                1. Filter Leads to Update
                            </h3>
                            <span className="text-[11px] text-gray-400">By Form/Source</span>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Source / Form</label>
                            <SearchableSelect 
                                options={sourceOptions.map(s => ({ label: s, value: s }))}
                                value={localFilters.source}
                                onChange={(val) => handleFilterChange('source', val)}
                                placeholder="Select Source / Form"
                                allLabel="All Sources"
                            />
                        </div>
                    </div>

                    {/* Matching Leads Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-200/80 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                <LucideLayers size={16} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-800">Matching Leads Found</div>
                                <div className="text-[11px] text-gray-500">Total records that will be updated</div>
                            </div>
                        </div>
                        <div className="text-right">
                            {isCalculating ? (
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-2xl font-black text-emerald-700 tracking-tight">
                                    {totalMatchingLeads}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Information to Update */}
                    <div className="space-y-3.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <LucideSparkles size={14} className="text-emerald-600" />
                            2. New Field Information
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Field</label>
                            <select 
                                value={updateType}
                                onChange={e => {
                                    setUpdateType(e.target.value);
                                    setUpdateValue("");
                                }}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-xs sm:text-sm font-medium"
                            >
                                <option value="course">Course / Enquiry For</option>
                                <option value="class">Class / Standard</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Set New Value</label>
                            <input 
                                type="text"
                                value={updateValue}
                                onChange={e => setUpdateValue(e.target.value)}
                                placeholder={`Enter or select new ${updateType}...`}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-xs sm:text-sm font-medium"
                            />

                            {/* Quick Suggestion Pills */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase self-center mr-1">Suggestions:</span>
                                {(updateType === 'course' ? courseSuggestions : classSuggestions).map(item => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setUpdateValue(item)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                            updateValue === item
                                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="bulk-update-form"
                        disabled={loading || isCalculating || totalMatchingLeads === 0 || !updateValue.trim()} 
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <LucideCheck size={16} />
                                Update All ({totalMatchingLeads}) Leads
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
