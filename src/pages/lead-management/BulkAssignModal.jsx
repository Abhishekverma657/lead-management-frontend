import React, { useState, useEffect, useRef } from 'react';
import { LucideX, LucideUsers, LucideChevronDown, LucideSearch, LucideCheck, LucideSparkles, LucideLayers, LucideFilter, LucideUserCheck } from 'lucide-react';
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
                    isOpen ? 'border-[#FF5B22] ring-2 ring-orange-500/10' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate font-medium ${!value ? 'text-gray-400' : 'text-gray-800'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <LucideChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF5B22]' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full min-w-[200px] mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                            <LucideSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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
                                value === "" ? 'bg-orange-50 text-[#FF5B22] font-bold' : 'text-gray-700 hover:bg-gray-50'
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
                                        value === opt.value ? 'bg-orange-50 text-[#FF5B22] font-bold' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    title={opt.label}
                                >
                                    <span className="truncate pr-2">{opt.label}</span>
                                    {value === opt.value && <LucideCheck size={13} className="shrink-0 text-[#FF5B22]" />}
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

const MultiSearchableSelect = ({ options, value = [], onChange, placeholder = "Select Callers / Counselors..." }) => {
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

    const toggleOption = (optValue) => {
        if (value.includes(optValue)) {
            onChange(value.filter(v => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    const selectAll = () => {
        const allIds = filteredOptions.map(o => o.value);
        onChange(Array.from(new Set([...value, ...allIds])));
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div 
                className={`w-full px-4 py-2.5 border rounded-xl text-xs sm:text-sm bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-all ${
                    isOpen ? 'border-[#FF5B22] ring-2 ring-orange-500/10' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="truncate flex items-center gap-2">
                    {value.length === 0 ? (
                        <span className="text-gray-400 font-normal">{placeholder}</span>
                    ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#FF5B22]">
                                {value.length} Assigned
                            </span>
                            <span className="text-gray-700 text-xs font-medium">
                                ({value.length} counselor{value.length > 1 ? 's' : ''} selected)
                            </span>
                        </div>
                    )}
                </div>
                <LucideChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF5B22]' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full min-w-[260px] mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <div className="p-2.5 border-b border-gray-100 bg-gray-50/70 space-y-2">
                        <div className="relative">
                            <LucideSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                placeholder="Search callers by name or role..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-between items-center text-[11px] px-1 text-gray-500">
                            <button 
                                type="button" 
                                onClick={selectAll} 
                                className="text-[#FF5B22] font-semibold hover:underline cursor-pointer"
                            >
                                Select All Filtered
                            </button>
                            {value.length > 0 && (
                                <button 
                                    type="button" 
                                    onClick={clearAll} 
                                    className="text-gray-500 hover:text-red-500 font-medium cursor-pointer"
                                >
                                    Clear All ({value.length})
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden p-1.5 custom-scrollbar space-y-0.5">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = value.includes(opt.value);
                                return (
                                    <div
                                        key={idx}
                                        className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                                            isSelected ? 'bg-orange-50/90 text-orange-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(opt.value);
                                        }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                isSelected ? 'bg-[#FF5B22] text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {opt.label.charAt(0)}
                                            </div>
                                            <span className="truncate">{opt.label}</span>
                                        </div>
                                        <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-[#FF5B22] border-[#FF5B22] text-white' : 'border-gray-300 bg-white'
                                        }`}>
                                            {isSelected && <LucideCheck size={12} strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-6 text-xs text-center text-gray-400">No counselors found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function BulkAssignModal({ 
    isOpen, 
    onClose, 
    filters: initialFilters, 
    unassignedCount: initialUnassignedCount, 
    staffList = [], 
    sourceOptions = [], 
    onAssign 
}) {
    const [selectedCounselors, setSelectedCounselors] = useState([]);
    const [distributionMode, setDistributionMode] = useState('evenly');
    const [customCounts, setCustomCounts] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Internal filters for assignment
    const [localFilters, setLocalFilters] = useState({
        source: initialFilters?.source || "",
        class: initialFilters?.class || "",
        course: initialFilters?.course || "",
        status: initialFilters?.status || ""
    });
    
    const [localUnassignedCount, setLocalUnassignedCount] = useState(initialUnassignedCount || 0);
    const [count, setCount] = useState(initialUnassignedCount || 0);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            setIsCalculating(true);
            try {
                const res = await getAllLeads(1, 1, localFilters);
                const newCount = res.unassignedCount || 0;
                setLocalUnassignedCount(newCount);
                setCount(newCount);
            } catch (err) {
                console.error("Error fetching count:", err);
            } finally {
                setIsCalculating(false);
            }
        };
        if (isOpen) fetchCount();
    }, [localFilters, isOpen]);

    if (!isOpen) return null;

    const getEvenDistribution = () => {
        if (selectedCounselors.length === 0) return {};
        const total = parseInt(count) || 0;
        const base = Math.floor(total / selectedCounselors.length);
        const remainder = total % selectedCounselors.length;
        
        const dist = {};
        selectedCounselors.forEach((id, idx) => {
            dist[id] = base + (idx === selectedCounselors.length - 1 ? remainder : 0);
        });
        return dist;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCounselors.length === 0) {
            return toast.error("Please select at least one counselor/caller");
        }
        if (distributionMode === 'evenly') {
            if (count < 1 || count > localUnassignedCount) {
                return toast.error(`Please enter a valid count between 1 and ${localUnassignedCount}`);
            }
        }
        
        const assignments = [];
        const evenDist = getEvenDistribution();
        
        let sum = 0;
        selectedCounselors.forEach(cId => {
            const assignCount = distributionMode === 'evenly' ? evenDist[cId] : (parseInt(customCounts[cId]) || 0);
            if (assignCount > 0) {
                assignments.push({ filters: localFilters, assignTo: cId, count: assignCount });
                sum += assignCount;
            }
        });
        
        if (assignments.length === 0) return toast.error("No leads assigned (Counts are 0)");
        if (sum > localUnassignedCount) return toast.error(`Sum of assigned leads (${sum}) exceeds available leads (${localUnassignedCount})`);
        
        setLoading(true);
        try {
            await onAssign(assignments);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const totalCustomAssigned = selectedCounselors.reduce((acc, cId) => acc + (parseInt(customCounts[cId]) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div 
                className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gradient-to-r from-orange-50/60 via-white to-orange-50/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                            <LucideUsers size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Bulk Assign Leads</h2>
                            <p className="text-xs text-gray-500">Auto-distribute leads to telecallers & counselors</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                    >
                        <LucideX size={18} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <form id="bulk-assign-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                    
                    {/* Section 1: Refine Criteria */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LucideFilter size={15} className="text-[#FF5B22]" />
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">1. Refine Target Leads</h3>
                            </div>
                            <span className="text-[11px] text-gray-400">Optional Filters</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Class</label>
                                <SearchableSelect 
                                    options={[
                                        { label: "6th", value: "6th" },
                                        { label: "7th", value: "7th" },
                                        { label: "8th", value: "8th" },
                                        { label: "9th", value: "9th" },
                                        { label: "10th", value: "10th" },
                                        { label: "11th", value: "11th" },
                                        { label: "12th", value: "12th" },
                                        { label: "Dropper", value: "Dropper" }
                                    ]}
                                    value={localFilters.class}
                                    onChange={(val) => handleFilterChange('class', val)}
                                    placeholder="All Classes"
                                    allLabel="All Classes"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Inquiry For</label>
                                <SearchableSelect 
                                    options={[
                                        { label: "IIT-JEE", value: "IIT-JEE" },
                                        { label: "NEET", value: "NEET" },
                                        { label: "Foundation", value: "Foundation" },
                                        { label: "Crash Course", value: "Crash Course" }
                                    ]}
                                    value={localFilters.course}
                                    onChange={(val) => handleFilterChange('course', val)}
                                    placeholder="All Courses"
                                    allLabel="All Courses"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Status</label>
                                <SearchableSelect 
                                    options={[
                                        { label: "New", value: "New" },
                                        { label: "In Process", value: "In Process" },
                                        { label: "Follow Up", value: "Follow Up" }
                                    ]}
                                    value={localFilters.status}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="All Statuses"
                                    allLabel="All Statuses"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Source / Form</label>
                                <SearchableSelect 
                                    options={sourceOptions.map(s => ({ label: s, value: s }))}
                                    value={localFilters.source}
                                    onChange={(val) => handleFilterChange('source', val)}
                                    placeholder="All Sources"
                                    allLabel="All Sources"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Matching Counter Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 border border-orange-200/80 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#FF5B22] flex items-center justify-center font-bold">
                                <LucideLayers size={16} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-800">Matching Unassigned Leads</div>
                                <div className="text-[11px] text-gray-500">Available pool to distribute</div>
                            </div>
                        </div>
                        <div className="text-right">
                            {isCalculating ? (
                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-2xl font-black text-[#FF5B22] tracking-tight">
                                    {localUnassignedCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Choose Callers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                <LucideUserCheck size={15} className="text-[#FF5B22]" />
                                2. Assign To Staff / Callers
                            </label>
                            {selectedCounselors.length > 0 && (
                                <span className="text-xs font-semibold text-[#FF5B22]">
                                    {selectedCounselors.length} selected
                                </span>
                            )}
                        </div>

                        <MultiSearchableSelect 
                            options={staffList
                                .filter(s => s._id !== 'AUTO' && s.id !== 'AUTO')
                                .map(staff => ({ 
                                    label: `${staff.name || staff.firstName || 'Staff'} (${staff.role === 'CALLER' ? '🎧 Telecaller' : staff.role === 'AGENT' ? '💼 Agent' : staff.role || 'Staff'})`, 
                                    value: staff._id || staff.id 
                                }))}
                            value={selectedCounselors}
                            onChange={setSelectedCounselors}
                            placeholder="Search and select callers or counselors..."
                        />
                    </div>

                    {/* Section 3: Distribution Setup (when counselors selected) */}
                    {selectedCounselors.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Distribution Strategy</span>
                                <div className="flex bg-gray-200/70 p-0.5 rounded-xl text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setDistributionMode('evenly')}
                                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                            distributionMode === 'evenly'
                                                ? 'bg-white text-gray-900 shadow-xs font-bold'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Evenly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDistributionMode('custom')}
                                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                            distributionMode === 'custom'
                                                ? 'bg-white text-gray-900 shadow-xs font-bold'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Custom
                                    </button>
                                </div>
                            </div>

                            {distributionMode === 'evenly' && (
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-xs font-semibold text-gray-600">
                                            Total Leads to Distribute
                                        </label>
                                        <span className="text-[11px] text-gray-400">
                                            Max {localUnassignedCount}
                                        </span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={localUnassignedCount}
                                        value={count}
                                        onChange={(e) => setCount(e.target.value)}
                                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm font-semibold bg-white"
                                        required
                                        disabled={localUnassignedCount === 0 || isCalculating}
                                    />
                                </div>
                            )}

                            {/* List of assigned counselors */}
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                {selectedCounselors.map(cId => {
                                    const staff = staffList.find(s => (s._id === cId || s.id === cId));
                                    const evenDist = getEvenDistribution();
                                    return (
                                        <div key={cId} className="flex justify-between items-center bg-white px-3 py-2.5 border border-gray-200/80 rounded-xl shadow-2xs">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5B22] font-bold text-xs flex items-center justify-center shrink-0">
                                                    {(staff?.name || staff?.firstName || 'S').charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{staff?.name || staff?.firstName || 'Staff'}</p>
                                                    <p className="text-[10px] text-gray-400">{staff?.role || 'Counselor'}</p>
                                                </div>
                                            </div>

                                            {distributionMode === 'evenly' ? (
                                                <span className="text-xs font-bold bg-orange-50 text-[#FF5B22] border border-orange-200/60 px-3 py-1 rounded-full">
                                                    {evenDist[cId] || 0} leads
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        placeholder="0" 
                                                        className="w-18 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                        value={customCounts[cId] || ""}
                                                        onChange={(e) => setCustomCounts(prev => ({...prev, [cId]: e.target.value}))}
                                                    />
                                                    <span className="text-[11px] text-gray-400 font-medium">leads</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {distributionMode === 'custom' && (
                                <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-500 uppercase tracking-wider">Total Custom Assigned</span>
                                    <span className={totalCustomAssigned > localUnassignedCount ? 'text-red-600' : 'text-emerald-600'}>
                                        {totalCustomAssigned} / {localUnassignedCount} available
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                {/* Sticky Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="bulk-assign-form"
                        className="px-5 py-2.5 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                        disabled={loading || localUnassignedCount === 0 || isCalculating || selectedCounselors.length === 0}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Assigning Leads...
                            </>
                        ) : (
                            <>
                                <LucideSparkles size={15} />
                                Confirm Assignment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
