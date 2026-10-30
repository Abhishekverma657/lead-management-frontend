import React, { useState, useEffect, useRef } from "react";
import { 
    LucideSearch, LucideFilter, LucideMoreVertical, LucidePlus, LucideFileDown, 
    LucideUsers, LucideChevronDown, LucideCheck, LucideCheckCircle2, LucideXCircle, 
    LucideColumns, LucideCalendar, LucideUpload, LucideTrendingUp, LucideTrendingDown,
    LucideEdit, LucideTrash2, LucideSparkles, LucideClock, LucideFlame
} from "lucide-react";
import CreateLeadModal from "./CreateLeadModal";
import LeadDrawer from "./LeadDrawer";
import BulkAssignModal from "./BulkAssignModal";
import BulkUpdateModal from "./BulkUpdateModal";
import ImportLeadsModal from './ImportLeadsModal';
import { useAppContext } from "../../context/AppContext";
import { getAllLeads, createLead, updateLeadStatus, updateLead, getLeadUsers, exportLeadsData, getLeadSources, bulkAssignLeads, bulkUpdateLeads } from "../../api/leadApi";
import { getStaff } from "../../api/staffApi";
import toast from "react-hot-toast";
import * as xlsx from 'xlsx';
import { useLocation } from "react-router-dom";

const statusColors = {
    "New": "bg-orange-100 text-orange-800",
    "In Process": "bg-amber-100 text-amber-800",
    "Follow Up": "bg-yellow-100 text-yellow-800",
    "Converted": "bg-emerald-100 text-emerald-800",
    "Closed": "bg-gray-100 text-gray-700",
};

const LEAD_STATUSES = [
    "New", "In Process", "Follow Up", "Interested", "Converted", "Closed"
];

const VALID_CLASSES = ["Class 11", "Class 12", "Target / Dropper", "Foundation", "Enterprise", "VIP Priority", "Standard"];
const VALID_COURSES = ["NEET", "IIT-JEE", "Foundation", "Abroad Studies", "Custom Course", "Consulting"];

const STAGE_OPTIONS = ["Hot", "Warm", "Cold", "Frozen"];

const DISPOSITION_OPTIONS = [
    "Interested", "Deal Closed", "Proposal Sent", "Meeting Scheduled",
    "Follow Up Required", "Demo Completed", "Call Back", "Negotiation",
    "Budget Issue", "Deciding Soon", "Not Interested", "Wrong Number",
    "Unreachable", "Lost to Competitor"
];

export const getStageColor = (stage) => {
    switch(stage) {
        case 'Hot': return 'text-red-600 bg-red-50';
        case 'Warm': return 'text-orange-600 bg-orange-50';
        case 'Cold': return 'text-amber-700 bg-amber-50';
        case 'Frozen': return 'bg-red-600 text-white font-bold';
        default: return 'text-gray-600 bg-gray-50';
    }
};

export const getDispositionColor = (disp) => {
    const positive = ["Deal Closed", "Interested", "Proposal Sent", "Meeting Scheduled", "Demo Completed"];
    const negative = ["Not Interested", "Unreachable", "Wrong Number", "Lost to Competitor"];
    
    if (positive.includes(disp)) return 'text-emerald-600 bg-emerald-50';
    if (negative.includes(disp)) return 'text-rose-600 bg-rose-50';
    return 'text-amber-600 bg-amber-50'; // Neutral
};

const getVal = (obj, keyName) => {
    if (!obj) return "";
    const key = Object.keys(obj).find(k => k.toLowerCase() === keyName.toLowerCase());
    return key ? obj[key] : "";
};

export const calculateLeadScore = (lead) => {
    if (!lead) return 4;
    let score = 3;
    const stage = getStage(lead);
    if (stage === 'Hot') score += 4;
    else if (stage === 'Warm') score += 2;
    else if (stage === 'Cold') score += 1;

    if (['Converted', 'Admission Done', 'Registration Done'].includes(lead.status)) score += 3;
    else if (['Interested', 'In Process'].includes(lead.status)) score += 2;

    if (lead.isMobileVerified || lead.rawFormData?.isVerified === true || lead.rawFormData?.isVerified === "true" || lead.formResponseId?.verificationStatus === 'Verified') {
        score += 1;
    }
    if (lead.email) score += 1;
    if (lead.callLogs && lead.callLogs.length > 0) score += 1;

    return Math.min(Math.max(score, 1), 10);
};

export const getStage = (lead) => {
    if (!lead) return "";
    if (lead.stage) return lead.stage;
    if (lead.formResponseId?.remarks?.length > 0) {
        const lastRemark = lead.formResponseId.remarks[lead.formResponseId.remarks.length - 1];
        if (lastRemark.stage) return lastRemark.stage;
    }
    if (lead.formResponseId?.stage) return lead.formResponseId.stage;
    return getVal(lead.rawFormData, 'stage');
};

export const getDisposition = (lead) => {
    if (!lead) return "";
    if (lead.disposition) return lead.disposition;
    if (lead.formResponseId?.remarks?.length > 0) {
        const lastRemark = lead.formResponseId.remarks[lead.formResponseId.remarks.length - 1];
        if (lastRemark.disposition) return lastRemark.disposition;
    }
    return getVal(lead.rawFormData, 'disposition');
};

export const getRemarkText = (lead) => {
    if (lead.formResponseId?.remarks?.length > 0) {
        const lastRemark = lead.formResponseId.remarks[lead.formResponseId.remarks.length - 1];
        if (lastRemark.text) return lastRemark.text;
    }
    const rawRemark = getVal(lead.rawFormData, 'remark') || getVal(lead.rawFormData, 'remarks');
    if (rawRemark) return rawRemark;
    if (lead.remarks) return lead.remarks;
    return "";
};

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
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 hover:bg-white cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate ${!value ? 'text-gray-500' : 'text-gray-800'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <LucideChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-[250px] md:w-full min-w-[200px] mt-1 bg-white border rounded-lg shadow-xl max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b bg-gray-50/50 rounded-t-lg">
                        <div className="relative">
                            <LucideSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden">
                        <div 
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 transition-colors ${value === "" ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'}`}
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
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 truncate flex items-center justify-between transition-colors ${value === opt.value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    title={opt.label}
                                >
                                    <span className="truncate pr-2">{opt.label}</span>
                                    {value === opt.value && <LucideCheck size={14} className="shrink-0 text-orange-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-sm text-center text-gray-500">No matching options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AllLeadsPage({ isFocusToday = false }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);
    const [totalPages, setTotalPages] = useState(1);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [sourceOptions, setSourceOptions] = useState([]);
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialAssignedTo = queryParams.get("assignedTo") || "";
    const initialSearch = queryParams.get("search") || "";
    const [filters, setFilters] = useState({
        source: "",
        class: "",
        course: "",
        status: "",
        assignedTo: initialAssignedTo,
        isVerified: "",
        stage: isFocusToday ? "Hot" : "",
        disposition: "",
        date: isFocusToday ? new Date().toISOString().split('T')[0] : ""
    });
    const [showFilters, setShowFilters] = useState(false);
    const { user } = useAppContext();

    const [staffList, setStaffList] = useState([]);
    const [leadUsersList, setLeadUsersList] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
    const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        leadNo: true,
        name: true,
        mobile: true,
        class: true,
        enquiryFor: true,
        source: true,
        stage: true,
        disposition: true,
        createdDate: true,
        updatedDate: true,
        followUpDate: true,
        status: true,
        assignedTo: true
    });
    const [showColumnToggle, setShowColumnToggle] = useState(false);
    const columnToggleRef = useRef(null);

    useEffect(() => {
        setPage(1);
        const searchFromUrl = new URLSearchParams(location.search).get("search") || "";
        setSearchTerm(searchFromUrl);
        setFilters({
            source: "",
            class: "",
            course: "",
            status: "",
            assignedTo: initialAssignedTo,
            isVerified: "",
            stage: isFocusToday ? "Hot" : "",
            disposition: "",
            date: isFocusToday ? new Date().toISOString().split('T')[0] : ""
        });
    }, [isFocusToday, location.pathname, location.search, initialAssignedTo]);

    // Fetch leads & Staff
    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, staffRes, leadUsersRes, sourcesRes] = await Promise.all([
                getAllLeads(page, limit, filters).catch(err => {
                    console.error("Failed to load leads:", err);
                    return { data: [], totalPages: 1, unassignedCount: 0 };
                }),
                getStaff().catch(err => {
                    console.warn("Failed to load staff list:", err);
                    return { success: false, data: [] };
                }),
                getLeadUsers().catch(err => {
                    console.warn("Failed to load lead users:", err);
                    return { success: false, data: [] };
                }),
                getLeadSources().catch(err => {
                    console.warn("Failed to load lead sources:", err);
                    return { success: false, data: [] };
                })
            ]);

            if (leadsRes && Array.isArray(leadsRes.data)) {
                setLeads(leadsRes.data);
            } else if (Array.isArray(leadsRes)) {
                setLeads(leadsRes);
            } else {
                setLeads([]);
            }

            if (leadsRes?.totalPages) setTotalPages(leadsRes.totalPages);
            if (leadsRes?.unassignedCount !== undefined) setUnassignedCount(leadsRes.unassignedCount);

            if (staffRes?.success && Array.isArray(staffRes.data)) {
                setStaffList(staffRes.data);
            }
            if (leadUsersRes?.success && Array.isArray(leadUsersRes.data)) {
                setLeadUsersList(leadUsersRes.data);
            }
            if (sourcesRes?.success && Array.isArray(sourcesRes.data)) {
                setSourceOptions(sourcesRes.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, filters]);

    const handleCreateLead = async (formData) => {
        try {
            let submissionData = { ...formData };
            if (formData.assignedTo && formData.assignedTo.startsWith("leaduser_")) {
                submissionData.assignedToLeadUser = formData.assignedTo.replace("leaduser_", "");
                delete submissionData.assignedTo;
            }
            
            toast.promise(
                createLead(submissionData),
                {
                    loading: 'Creating Lead...',
                    success: (res) => {
                        fetchData(); // Refresh to get populated names
                        return 'Lead Created Successfully!';
                    },
                    error: (err) => err.response?.data?.message || 'Failed to create lead'
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        try {
            const res = await updateLeadStatus(leadId, newStatus);
            if (res.success) {
                setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const handleAssignmentUpdate = async (leadId, newId) => {
        try {
            let updateData = {};
            let assignedName = "";
            if (newId.startsWith("leaduser_")) {
                const actualId = newId.replace("leaduser_", "");
                updateData.assignedToLeadUser = actualId;
                updateData.assignedTo = null; // Clear admin assignment
                const user = leadUsersList.find(u => u._id === actualId);
                if (user) assignedName = `${user.firstName} ${user.lastName}`;
            } else {
                updateData.assignedTo = newId;
                updateData.assignedToLeadUser = null; // Clear mobile assignment
                const staff = staffList.find(s => s._id === newId);
                if (staff) assignedName = staff.name;
            }
            if (assignedName) updateData.assignedToName = assignedName;

            const res = await updateLead(leadId, updateData);
            if (res.success) {
                fetchData(); // Refresh to get populated names
                toast.success(`Lead re-assigned successfully`);
            }
        } catch (error) {
            toast.error("Failed to update assignment");
        }
    }

    const handleInlineUpdate = async (leadId, field, value) => {
        if (!value.trim()) return;
        try {
            const res = await updateLead(leadId, { [field]: value });
            if (res.success) {
                setLeads(prev => prev.map(l => l._id === leadId ? { ...l, [field]: value } : l));
                toast.success(`${field} updated`);
            }
        } catch (error) {
            toast.error(`Failed to update ${field}`);
        }
    };

    const handleBulkUpdate = async (updateData) => {
        try {
            const res = await bulkUpdateLeads(updateData);
            if (res.success) {
                toast.success(res.message || "Bulk update successful");
                setIsBulkUpdateModalOpen(false);
                fetchData();
            } else {
                toast.error(res.message || "Failed to update leads");
            }
        } catch (error) {
            console.error("Bulk update error:", error);
            toast.error(error.response?.data?.message || "Failed to update leads");
        }
    };

    const handleExport = async () => {
        try {
            const toastId = toast.loading("Generating Excel...");
            const res = await exportLeadsData();
            if (res.success) {
                const data = res.data;
                if (!data || data.length === 0) {
                    toast.dismiss(toastId);
                    return toast.error("No data to export");
                }
                
                // Use xlsx library to generate a proper Excel file
                const ws = xlsx.utils.json_to_sheet(data);
                
                // Add some column width formatting for better readability
                const colWidths = [
                    { wch: 10 }, // Lead No
                    { wch: 20 }, // Name
                    { wch: 15 }, // Phone
                    { wch: 25 }, // Email
                    { wch: 10 }, // Class
                    { wch: 15 }, // Course
                    { wch: 15 }, // Source
                    { wch: 10 }, // Stage
                    { wch: 15 }, // Disposition
                    { wch: 15 }, // Status
                    { wch: 40 }, // Remarks
                    { wch: 20 }, // Assigned To
                    { wch: 10 }, // Total Fee
                    { wch: 10 }, // Amount Paid
                    { wch: 25 }, // Created At
                    { wch: 150 } // Activity History
                ];
                ws['!cols'] = colWidths;

                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, "Leads");
                
                // Attempt to apply wrapText if supported
                const range = xlsx.utils.decode_range(ws['!ref']);
                for(let R = range.s.r; R <= range.e.r; ++R) {
                    for(let C = range.s.c; C <= range.e.c; ++C) {
                        const cell = ws[xlsx.utils.encode_cell({r: R, c: C})];
                        if(!cell) continue;
                        if(!cell.s) cell.s = {};
                        cell.s.alignment = { wrapText: true, vertical: 'top' };
                    }
                }

                xlsx.writeFile(wb, "leads_export.xlsx", { cellStyles: true });
                
                toast.success("Export successful", { id: toastId });
            }
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Export failed", { id: toastId });
        }
    };

    const handleBulkAssign = async (assignData) => {
        try {
            if (Array.isArray(assignData)) {
                let successCount = 0;
                for (const data of assignData) {
                    const res = await bulkAssignLeads(data);
                    if (res.success) successCount++;
                }
                toast.success(`Successfully assigned leads across ${successCount} counselors`);
            } else {
                const res = await bulkAssignLeads(assignData);
                if (res.success) {
                    toast.success(res.message);
                }
            }
            setIsBulkAssignModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to bulk assign leads");
        }
    };

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(user?.role);
    const isCaller = ['CALLER', 'AGENT', 'TELECALLER', 'COUNSELOR', 'TEAM_MEMBER'].includes(user?.role);

    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(l.leadNo).includes(searchTerm) ||
            l.mobileNumber?.includes(searchTerm);
        const matchesStage = !filters.stage || getStage(l) === filters.stage;
        const matchesDisposition = !filters.disposition || getDisposition(l) === filters.disposition;

        let matchesTab = true;
        if (activeTab === "favourite") {
            matchesTab = getStage(l) === "Hot" || l.status === "Interested";
        } else if (activeTab === "new") {
            matchesTab = l.status === "New";
        } else if (activeTab === "assigned_to_me") {
            matchesTab = (l.assignedTo?._id === user?.id || l.assignedTo === user?.id || l.assignedToLeadUser === user?.id);
        } else if (activeTab === "overdue") {
            matchesTab = l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date();
        } else if (activeTab === "hot") {
            matchesTab = getStage(l) === "Hot";
        }

        return matchesSearch && matchesStage && matchesDisposition && matchesTab;
    });

    const handleFilterChange = (key, value) => {
        setPage(1);
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ 
            source: "", 
            class: "", 
            course: "", 
            status: "", 
            assignedTo: "", 
            isVerified: "", 
            stage: isFocusToday ? "Hot" : "", 
            disposition: "",
            date: isFocusToday ? new Date().toISOString().split('T')[0] : ""
        });
        setPage(1);
    };

    return (
        <>
            <CreateLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateLead}
            />
            <ImportLeadsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchData}
            />
            <LeadDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                lead={selectedLead}
                onLeadUpdated={() => {
                    fetchData();
                }}
                staffList={staffList}
                leadUsersList={leadUsersList}
                user={user}
            />
            {isBulkAssignModalOpen && (
                <BulkAssignModal
                    isOpen={isBulkAssignModalOpen}
                    onClose={() => setIsBulkAssignModalOpen(false)}
                    filters={filters}
                    unassignedCount={unassignedCount}
                    staffList={staffList}
                    sourceOptions={sourceOptions}
                    onAssign={handleBulkAssign}
                />
            )}
            {isBulkUpdateModalOpen && (
                <BulkUpdateModal
                    isOpen={isBulkUpdateModalOpen}
                    onClose={() => setIsBulkUpdateModalOpen(false)}
                    filters={filters}
                    sourceOptions={sourceOptions}
                    onUpdate={handleBulkUpdate}
                />
            )}
            <div className="p-6">
                {isFocusToday ? (
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-8 bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 rounded-2xl shadow-lg">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                🔥 My Focus Today
                            </h2>
                            <p className="text-orange-100 text-sm mt-1">High priority leads & scheduled follow-ups requiring attention</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-white/20 shadow-sm">
                            <LucideCalendar size={18} />
                            <input 
                                type="date" 
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className="bg-transparent border-none focus:outline-none text-white font-medium cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Top KPI Metric Summary Cards with Real Dynamic Data & Orange Sparkline Curves */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                                            <div className="h-4 w-12 bg-slate-100 rounded"></div>
                                        </div>
                                        <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Card 1: New Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">New Leads</span>
                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            <LucideTrendingUp size={12} /> Live
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {leads.filter(l => l.status === "New").length}
                                        </div>
                                        <svg className="w-24 h-7 stroke-[#FF5B22] fill-none" viewBox="0 0 100 30">
                                            <path d="M 0,22 Q 25,28 45,15 T 75,18 T 100,6" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Card 2: Qualified Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">Qualified Leads</span>
                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            <LucideTrendingUp size={12} /> Active
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {leads.filter(l => ["Converted", "In Process", "Interested", "Admission Done"].includes(l.status)).length}
                                        </div>
                                        <svg className="w-24 h-7 stroke-[#FF5B22] fill-none" viewBox="0 0 100 30">
                                            <path d="M 0,25 Q 30,12 55,20 T 80,10 T 100,5" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Card 3: Total Calls Logged */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">Calls Recorded</span>
                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                            <LucideClock size={12} /> Airtel IQ
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {leads.reduce((acc, l) => acc + (l.callLogs?.length || 0), 0)}
                                        </div>
                                        <svg className="w-24 h-7 stroke-[#FF5B22] fill-none" viewBox="0 0 100 30">
                                            <path d="M 0,18 Q 20,26 50,15 T 75,20 T 100,8" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Card 4: Hot Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">Hot Priority Leads</span>
                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                            <LucideFlame size={12} /> Focus
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {leads.filter(l => getStage(l) === "Hot").length}
                                        </div>
                                        <svg className="w-24 h-7 stroke-[#FF5B22] fill-none" viewBox="0 0 100 30">
                                            <path d="M 0,20 Q 30,28 60,12 T 85,16 T 100,7" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filter Tabs Bar (with Real Dynamic Item Counts) */}
                        <div className="flex items-center gap-6 border-b border-gray-200 mb-5 overflow-x-auto">
                            {[
                                { id: "all", label: `All (${leads.length})` },
                                { id: "favourite", label: `Favourite (${leads.filter(l => getStage(l) === "Hot" || l.status === "Interested").length})` },
                                { id: "new", label: `New (${leads.filter(l => l.status === "New").length})` },
                                { id: "assigned_to_me", label: `Assigned to me (${leads.filter(l => (l.assignedTo?._id === user?.id || l.assignedTo === user?.id || l.assignedToLeadUser === user?.id)).length})` },
                                { id: "overdue", label: `Overdue (${leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date()).length})` },
                                { id: "hot", label: `Hot (${leads.filter(l => getStage(l) === "Hot").length})` }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-xs font-semibold whitespace-nowrap transition-all relative cursor-pointer ${
                                        activeTab === tab.id
                                            ? "text-[#FF5B22] font-bold"
                                            : "text-gray-500 hover:text-gray-900"
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B22] rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {/* Header & Actions — All Left */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {/* Search */}
                    <div className="relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            className="w-64 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${showFilters ? 'bg-orange-50 border-orange-300 text-[#FF5B22] shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600 bg-white shadow-sm'}`}
                    >
                        <LucideFilter size={15} />
                        Filters
                        {(() => {
                            const activeCount = Object.entries(filters).filter(([k, v]) => {
                                if (v === "") return false;
                                if (isFocusToday && (k === 'stage' || k === 'date')) return false;
                                return true;
                            }).length;
                            return activeCount > 0 && (
                                <span className="bg-[#FF5B22] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {activeCount}
                                </span>
                            );
                        })()}
                    </button>

                    {/* Rows per page */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium border-gray-200 bg-white shadow-sm whitespace-nowrap">
                        <span className="text-gray-500">Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="bg-transparent border-none focus:outline-none text-gray-700 cursor-pointer font-semibold"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={500}>500</option>
                            <option value={1000}>1000</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-7 bg-gray-200 mx-1" />

                    {/* Column Toggle */}
                    <div className="relative" ref={columnToggleRef}>
                        <button 
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-600 bg-white shadow-sm transition-all whitespace-nowrap cursor-pointer"
                        >
                            <LucideColumns size={15} />
                            Columns
                        </button>
                        
                        {showColumnToggle && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 p-3 max-h-[300px] overflow-y-auto">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">Visible Columns</h4>
                                {Object.keys(visibleColumns).map((colKey) => (
                                    <label key={colKey} className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-[#FF5B22] focus:ring-orange-500 accent-[#FF5B22]"
                                            checked={visibleColumns[colKey]}
                                            onChange={() => setVisibleColumns(prev => ({...prev, [colKey]: !prev[colKey]}))}
                                        />
                                        <span className="text-sm text-gray-700 capitalize">
                                            {colKey.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Import */}
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-600 bg-white shadow-sm transition-all whitespace-nowrap cursor-pointer">
                        <LucideUpload size={15} />
                        Import Excel
                    </button>

                    {/* Export */}
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-600 bg-white shadow-sm transition-all whitespace-nowrap cursor-pointer">
                        <LucideFileDown size={15} />
                        Export
                    </button>

                    {/* Bulk Assign & Bulk Update */}
                    {isAdmin && (
                        <>
                            <button onClick={() => setIsBulkAssignModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 shadow-sm transition-all whitespace-nowrap cursor-pointer">
                                <LucideUsers size={15} />
                                Bulk Assign
                            </button>
                            <button onClick={() => setIsBulkUpdateModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 shadow-sm transition-all whitespace-nowrap cursor-pointer">
                                <LucideCheck size={15} />
                                Bulk Update
                            </button>
                        </>
                    )}

                    {/* Add Lead */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer"
                    >
                        <LucidePlus size={15} />
                        Add Lead
                    </button>
                </div>

                {/* Advanced Filter Panel */}
                {showFilters && (
                    <div className="bg-white p-5 rounded-xl border shadow-sm mb-6 animate-in slide-in-from-top-2">
                        <div className="flex justify-start items-center gap-6 mb-4">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2"><LucideFilter className="w-4 h-4" /> Filters</h3>
                            <button onClick={clearFilters} className="text-sm text-orange-600 hover:underline">Clear All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Class</label>
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
                                    value={filters.class}
                                    onChange={(val) => handleFilterChange('class', val)}
                                    placeholder="Select Class"
                                    allLabel="All Classes"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Inquiry For</label>
                                <SearchableSelect 
                                    options={[
                                        { label: "IIT-JEE", value: "IIT-JEE" },
                                        { label: "NEET", value: "NEET" },
                                        { label: "Foundation", value: "Foundation" }
                                    ]}
                                    value={filters.course}
                                    onChange={(val) => handleFilterChange('course', val)}
                                    placeholder="Select Course"
                                    allLabel="All Courses"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                <SearchableSelect 
                                    options={LEAD_STATUSES.map(s => ({ label: s, value: s }))}
                                    value={filters.status}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="Select Status"
                                    allLabel="All Statuses"
                                />
                            </div>
                            {user?.role !== 'COUNSELOR' && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
                                    <SearchableSelect 
                                        options={[
                                            { label: "-- Unassigned --", value: "unassigned" },
                                            ...staffList.map(staff => ({ label: staff.name, value: staff._id }))
                                        ]}
                                        value={filters.assignedTo}
                                        onChange={(val) => handleFilterChange('assignedTo', val)}
                                        placeholder="Select Counselor"
                                        allLabel="All Counselors"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Source</label>
                                <SearchableSelect 
                                    options={sourceOptions.map(s => ({ label: s, value: s }))}
                                    value={filters.source}
                                    onChange={(val) => handleFilterChange('source', val)}
                                    placeholder="Select Source"
                                    allLabel="All Sources"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Verification</label>
                                <SearchableSelect 
                                    options={[
                                        { label: "Verified", value: "true" },
                                        { label: "Unverified", value: "false" }
                                    ]}
                                    value={filters.isVerified}
                                    onChange={(val) => handleFilterChange('isVerified', val)}
                                    placeholder="Select"
                                    allLabel="All"
                                />
                            </div>
                            {!isFocusToday && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Stage</label>
                                    <SearchableSelect 
                                        options={STAGE_OPTIONS.map(s => ({ label: s, value: s }))}
                                        value={filters.stage}
                                        onChange={(val) => handleFilterChange('stage', val)}
                                        placeholder="Select Stage"
                                        allLabel="All Stages"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Disposition</label>
                                <SearchableSelect 
                                    options={DISPOSITION_OPTIONS.map(d => ({ label: d, value: d }))}
                                    value={filters.disposition}
                                    onChange={(val) => handleFilterChange('disposition', val)}
                                    placeholder="Select Disposition"
                                    allLabel="All Dispositions"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-6 space-y-4 animate-pulse">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-slate-200"></div>
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-3.5">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                                    <div key={row} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-slate-50/40 gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-4 h-4 rounded bg-slate-200 shrink-0"></div>
                                            <div className="h-6 w-16 bg-slate-200 rounded-md shrink-0"></div>
                                            <div className="space-y-1.5 min-w-[140px]">
                                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                            </div>
                                            <div className="h-4 w-28 bg-slate-200 rounded hidden md:block"></div>
                                            <div className="h-6 w-24 bg-orange-100/80 rounded-full hidden lg:block"></div>
                                            <div className="h-6 w-20 bg-emerald-100/80 rounded-full hidden sm:block"></div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 hidden sm:block"></div>
                                            <div className="h-4 w-20 bg-slate-200 rounded hidden sm:block"></div>
                                            <div className="flex gap-1.5">
                                                <div className="w-7 h-7 rounded-lg bg-slate-200"></div>
                                                <div className="w-7 h-7 rounded-lg bg-slate-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No leads found.</div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[1500px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-[#FF5B22] focus:ring-[#FF5B22] accent-[#FF5B22] cursor-pointer"
                                            checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLeadIds(filteredLeads.map(l => l._id));
                                                } else {
                                                    setSelectedLeadIds([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    {visibleColumns.leadNo && <th className="p-4 font-medium text-gray-600 min-w-[80px]">Lead No</th>}
                                    {visibleColumns.name && <th className="p-4 font-medium text-gray-600 min-w-[150px]">Contact Name</th>}
                                    {visibleColumns.mobile && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Phone Number</th>}
                                    {visibleColumns.class && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Segment / Tier</th>}
                                    {visibleColumns.enquiryFor && <th className="p-4 font-medium text-gray-600 min-w-[140px]">Requirement / Scope</th>}
                                    {visibleColumns.source && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Lead Source</th>}
                                    {visibleColumns.stage && <th className="p-4 font-medium text-gray-600 min-w-[100px]">Stage</th>}
                                    <th className="p-4 font-medium text-gray-600 min-w-[110px]">Lead Score</th>
                                    {visibleColumns.disposition && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Disposition</th>}
                                    {visibleColumns.createdDate && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Created Date</th>}
                                    {visibleColumns.updatedDate && <th className="p-4 font-medium text-gray-600 min-w-[150px]">Last Modified</th>}
                                    {visibleColumns.followUpDate && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Follow-Up Date</th>}
                                    {visibleColumns.status && <th className="p-4 font-medium text-gray-600 min-w-[120px]">Status</th>}
                                    {visibleColumns.assignedTo && <th className="p-4 font-medium text-gray-600 min-w-[150px]">{isAdmin ? "Assigned To" : "Transfer To"}</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredLeads.map((lead) => (
                                    <tr 
                                        key={lead._id} 
                                        className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setIsDrawerOpen(true);
                                        }}
                                    >
                                        <td className="p-3.5 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-[#FF5B22] focus:ring-[#FF5B22] accent-[#FF5B22] cursor-pointer"
                                                checked={selectedLeadIds.includes(lead._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedLeadIds(prev => [...prev, lead._id]);
                                                    } else {
                                                        setSelectedLeadIds(prev => prev.filter(id => id !== lead._id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        {visibleColumns.leadNo && (
                                            <td className="p-3.5 relative overflow-hidden">
                                                {/* Duplicate Badge */}
                                                {lead.mobileNumber && !lead.mobileNumber.startsWith("Form-") && 
                                                 filteredLeads.some(l => l.mobileNumber === lead.mobileNumber && new Date(l.createdAt) < new Date(lead.createdAt)) && (
                                                    <div className="absolute top-1.5 -left-7 w-24 -rotate-45 bg-rose-500 text-center shadow-xs pointer-events-none z-10">
                                                        <span className="text-white text-[7px] font-black uppercase tracking-wider block py-[1px]">
                                                            DUPLICATE
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200/80 shadow-2xs">
                                                    LC-{String(lead.leadNo || 0).padStart(4, '0')}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.name && (
                                            <td className="p-3.5 min-w-[160px]">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-amber-100 text-[#FF5B22] font-black text-xs flex items-center justify-center shrink-0 border border-orange-200/60 shadow-2xs">
                                                        {(lead.studentName || lead.firstName || "L").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-[#FF5B22] transition text-sm">
                                                            {lead.studentName || lead.firstName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.mobile && (
                                            <td className="p-3.5 text-xs min-w-[130px]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-semibold text-gray-700">
                                                        {lead.mobileNumber?.startsWith("Form-") ? "No Mobile" : lead.mobileNumber}
                                                    </span>
                                                    {lead.isMobileVerified || lead.rawFormData?.isVerified === true || lead.rawFormData?.isVerified === "true" || lead.formResponseId?.verificationStatus === 'Verified' ? (
                                                        <LucideCheckCircle2 size={13} className="text-emerald-600 shrink-0" title="Verified Mobile Number" />
                                                    ) : (
                                                        <LucideXCircle size={13} className="text-rose-400 shrink-0" title="Unverified" />
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.class && (
                                            <td className="p-3.5 min-w-[145px]" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    className="px-2.5 py-1.5 rounded-xl border border-gray-200/80 cursor-pointer bg-white hover:bg-gray-50 text-gray-800 w-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-2xs"
                                                    value={VALID_CLASSES.includes(lead.class) ? lead.class : ""}
                                                    onChange={(e) => handleInlineUpdate(lead._id, 'class', e.target.value)}
                                                >
                                                    <option value="" disabled>Select Tier</option>
                                                    {VALID_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                        )}
                                        {visibleColumns.enquiryFor && (
                                            <td className="p-3.5 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    list={`course-options-${lead._id}`}
                                                    className="px-2.5 py-1.5 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 focus:bg-white w-full text-xs font-medium text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] outline-none transition"
                                                    placeholder="Type or Select Scope..."
                                                    defaultValue={lead.inquiryFor || lead.course || ""}
                                                    onBlur={(e) => {
                                                        const newVal = e.target.value.trim();
                                                        if (newVal !== (lead.inquiryFor || lead.course || "")) {
                                                            handleInlineUpdate(lead._id, 'course', newVal);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.target.blur();
                                                        }
                                                    }}
                                                />
                                                <datalist id={`course-options-${lead._id}`}>
                                                    {VALID_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </datalist>
                                            </td>
                                        )}
                                        {visibleColumns.source && (
                                            <td className="p-3.5 min-w-[130px]">
                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 font-bold border border-orange-200/70 text-[11px] truncate max-w-[140px]">
                                                    {lead.source || "Website Form"}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.stage && (
                                            <td className="p-3.5 min-w-[100px]">
                                                {getStage(lead) ? (
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border border-transparent ${getStageColor(getStage(lead))}`}>
                                                        {getStage(lead)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not Set</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="p-3.5 min-w-[120px]">
                                            {(() => {
                                                const score = calculateLeadScore(lead);
                                                const filledBars = Math.round((score / 10) * 6);
                                                const barColor = score >= 8 ? "bg-[#FF5B22]" : score >= 5 ? "bg-amber-500" : "bg-slate-400";
                                                return (
                                                    <div className="flex items-center gap-1.5" title={`Lead Conversion Readiness Score: ${score}/10`}>
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(6)].map((_, i) => (
                                                                <span 
                                                                    key={i} 
                                                                    className={`w-1.5 h-3.5 rounded-xs transition-all ${
                                                                        i < filledBars ? barColor : 'bg-gray-200'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[11px] font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                            {score}/10
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        {visibleColumns.disposition && (
                                            <td className="p-3.5 min-w-[120px]">
                                                {getDisposition(lead) ? (
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border border-transparent inline-block max-w-[140px] truncate ${getDispositionColor(getDisposition(lead))}`}>
                                                        {getDisposition(lead)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not Set</span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.createdDate && (
                                            <td className="p-3.5 text-gray-500 text-xs min-w-[140px] whitespace-nowrap">
                                                {new Date(lead.createdAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                                            </td>
                                        )}
                                        {visibleColumns.updatedDate && (
                                            <td className="p-3.5 text-gray-500 text-xs min-w-[140px] whitespace-nowrap">
                                                {(lead.updatedAt && new Date(lead.updatedAt).getTime() > new Date(lead.createdAt).getTime()) 
                                                    ? new Date(lead.updatedAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) 
                                                    : "—"}
                                            </td>
                                        )}
                                        {visibleColumns.followUpDate && (
                                            <td className="p-3.5 text-xs text-gray-700 font-semibold whitespace-nowrap">
                                                {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : "—"}
                                            </td>
                                        )}
                                        {visibleColumns.status && (
                                            <td className="p-3.5 min-w-[120px]">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.assignedTo && (
                                            <td className="p-3.5 min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={isAdmin ? (lead.assignedTo?._id || lead.assignedToLeadUser || "") : ""}
                                                    onChange={(e) => handleAssignmentUpdate(lead._id, e.target.value)}
                                                    className="px-2.5 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500/20 w-full cursor-pointer shadow-2xs"
                                                >
                                                    <option value="" disabled>{isAdmin ? "Assign to..." : "Transfer to..."}</option>
                                                    
                                                    {isAdmin ? (
                                                        staffList.map(staff => (
                                                            <option key={staff._id} value={staff._id}>{staff.name}</option>
                                                        ))
                                                    ) : (
                                                        staffList
                                                            .filter(staff => staff._id !== user._id)
                                                            .map(staff => (
                                                                <option key={staff._id} value={staff._id}>{staff.name}</option>
                                                            ))
                                                    )}
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-start items-center gap-6 p-4 border-t bg-gray-50">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    Next
                                </button>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Go to page:</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={totalPages}
                                    placeholder={page}
                                    className="w-16 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            const val = parseInt(e.target.value);
                                            if(val >= 1 && val <= totalPages) {
                                                setPage(val);
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Bulk Action Capsule Bar (matching reference screenshot) */}
                {selectedLeadIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
                        <div className="bg-gray-950 text-white rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-semibold border border-gray-800">
                            <span className="text-gray-300">Selected: <strong className="text-white font-bold">{selectedLeadIds.length}</strong></span>
                            <div className="h-4 w-px bg-gray-700" />
                            <button 
                                onClick={() => setIsBulkUpdateModalOpen(true)}
                                className="flex items-center gap-1.5 text-gray-200 hover:text-white transition cursor-pointer"
                            >
                                <LucideEdit size={13} />
                                <span>Edit</span>
                            </button>
                            {isAdmin && (
                                <button 
                                    onClick={() => setIsBulkAssignModalOpen(true)}
                                    className="flex items-center gap-1.5 text-gray-200 hover:text-white transition cursor-pointer"
                                >
                                    <LucideUsers size={13} />
                                    <span>Assign to</span>
                                </button>
                            )}
                            <button 
                                onClick={() => setSelectedLeadIds([])}
                                className="bg-white hover:bg-gray-100 text-gray-950 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
