import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, User, Search, Clock, MessageSquare, CreditCard, Filter, 
    LucideFileDown, Radio, Headphones, RefreshCw, Phone, PhoneCall,
    Flame, Sun, Snowflake, Award, TrendingUp, CheckCircle2, ArrowRight,
    FileText, Layers, ExternalLink, ShieldCheck, ChevronRight
} from 'lucide-react';
import { getStaff } from '../../api/staffApi';
import { getDailyActivityReport, getDailySummaryReport } from '../../api/leadApi';
import { getRecordingsApi, getAudioStreamUrl } from '../../api/telephonyApi';
import AudioPlayer from '../../components/AudioPlayer';
import LiveTelephonyWallboard from './LiveTelephonyWallboard';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function StaffReportsPage() {
    const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'individual' | 'recordings' | 'wallboard'
    
    // Shared Date Filters - Default to 'all' so data is immediately visible
    const [datePreset, setDatePreset] = useState('all'); // 'today' | 'yesterday' | '7days' | 'month' | 'all' | 'custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Overall Summary State
    const [summaryData, setSummaryData] = useState([]);
    const [summaryKpis, setSummaryKpis] = useState(null);

    // Individual Log State
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [individualStaffInfo, setIndividualStaffInfo] = useState(null);
    const [individualStats, setIndividualStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activityTypeFilter, setActivityTypeFilter] = useState('all'); // 'all' | 'call' | 'stage' | 'status' | 'note' | 'followup'
    const [activitySearch, setActivitySearch] = useState('');

    // Call Recordings Tab State
    const [recordingsList, setRecordingsList] = useState([]);
    const [recordingSearch, setRecordingSearch] = useState("");
    const [recordingStaffFilter, setRecordingStaffFilter] = useState("");

    const [loading, setLoading] = useState(false);

    // Fetch initial staff list (Only operational staff - excluding ADMIN/SUPER_ADMIN)
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await getStaff();
                if (res.success && Array.isArray(res.data)) {
                    const operationalStaff = res.data.filter(s => 
                        !['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'].includes(String(s.role || "").toUpperCase())
                    );
                    setStaffList(operationalStaff);
                    if (operationalStaff.length > 0) {
                        setSelectedStaff(operationalStaff[0]._id);
                    }
                }
            } catch (err) {
                console.error("Failed to load staff list:", err);
            }
        };
        fetchStaff();
    }, []);

    // Calculate start & end ISO dates from preset
    const getDateParams = () => {
        const now = new Date();
        if (datePreset === 'today') {
            const s = new Date(now);
            s.setHours(0, 0, 0, 0);
            const e = new Date(now);
            e.setHours(23, 59, 59, 999);
            return { startDate: s.toISOString(), endDate: e.toISOString(), label: "Today" };
        }
        if (datePreset === 'yesterday') {
            const s = new Date(Date.now() - 24 * 60 * 60 * 1000);
            s.setHours(0, 0, 0, 0);
            const e = new Date(Date.now() - 24 * 60 * 60 * 1000);
            e.setHours(23, 59, 59, 999);
            return { startDate: s.toISOString(), endDate: e.toISOString(), label: "Yesterday" };
        }
        if (datePreset === '7days') {
            const s = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            s.setHours(0, 0, 0, 0);
            return { startDate: s.toISOString(), endDate: now.toISOString(), label: "Last 7 Days" };
        }
        if (datePreset === 'month') {
            const s = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: s.toISOString(), endDate: now.toISOString(), label: "This Month" };
        }
        if (datePreset === 'custom' && customStart) {
            const s = new Date(customStart);
            s.setHours(0, 0, 0, 0);
            let e = customEnd ? new Date(customEnd) : new Date(customStart);
            e.setHours(23, 59, 59, 999);
            return { startDate: s.toISOString(), endDate: e.toISOString(), label: `${customStart} to ${customEnd || customStart}` };
        }
        return { label: "All Time" };
    };

    // Fetch Overall Summary
    const fetchSummary = async () => {
        setLoading(true);
        try {
            const dateParams = getDateParams();
            const res = await getDailySummaryReport(dateParams);
            if (res.success) {
                setSummaryData(res.data || []);
                setSummaryKpis(res.kpis || null);
                if ((res.data || []).length === 0) {
                    toast.success("No summary data found for selected period.");
                }
            }
        } catch (err) {
            console.error("Summary fetch error:", err);
            toast.error("Failed to load overall summary");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Individual Log
    const fetchIndividualReport = async (staffIdToFetch = selectedStaff) => {
        if (!staffIdToFetch) return;
        setLoading(true);
        try {
            const dateParams = getDateParams();
            const res = await getDailyActivityReport({
                staffId: staffIdToFetch,
                ...dateParams
            });
            if (res.success) {
                setActivities(res.data || []);
                setIndividualStaffInfo(res.staffInfo || null);
                setIndividualStats(res.stats || null);
                if ((res.data || []).length === 0) {
                    toast.success("No activity logs found for selected period.");
                }
            }
        } catch (err) {
            console.error("Individual report fetch error:", err);
            toast.error("Failed to load staff activity log");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Call Recordings
    const fetchRecordings = async () => {
        setLoading(true);
        try {
            const dateParams = getDateParams();
            const params = { pageSize: 50 };
            if (dateParams.startDate) params.startGte = dateParams.startDate;
            if (dateParams.endDate) params.startLte = dateParams.endDate;

            if (recordingStaffFilter) {
                params.staffId = recordingStaffFilter;
                const staffObj = staffList.find(s => s._id === recordingStaffFilter);
                if (staffObj?.agentExtension) {
                    params.extension = staffObj.agentExtension;
                }
            }

            const res = await getRecordingsApi(params);
            if (res.success) {
                const recs = res.recordings || res.data || [];
                setRecordingsList(recs);
                if (recs.length === 0) toast.success("No call recordings found for selected filters.");
            }
        } catch (err) {
            console.error("Fetch recordings error:", err);
            toast.error("Failed to load call recordings");
        } finally {
            setLoading(false);
        }
    };

    // Trigger data fetch on view or filter change
    useEffect(() => {
        if (viewMode === 'summary') {
            fetchSummary();
        } else if (viewMode === 'individual') {
            if (selectedStaff) fetchIndividualReport();
        } else if (viewMode === 'recordings') {
            fetchRecordings();
        }
    }, [viewMode, datePreset, customStart, customEnd, selectedStaff, recordingStaffFilter]);

    // Format Duration Helper
    const formatDuration = (seconds = 0) => {
        const sec = Number(seconds) || 0;
        if (sec <= 0) return "0s";
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    // Jump from Summary row directly to Individual Log
    const handleDrilldownStaff = (staffId) => {
        setSelectedStaff(staffId);
        setViewMode('individual');
        if (datePreset === 'today') {
            setDatePreset('all');
        }
    };

    // Filter Individual Activities
    const filteredActivities = useMemo(() => {
        return activities.filter(act => {
            if (activityTypeFilter !== 'all' && act.type !== activityTypeFilter) {
                return false;
            }
            if (activitySearch.trim()) {
                const q = activitySearch.toLowerCase();
                const leadName = String(act.leadName || "").toLowerCase();
                const leadPhone = String(act.leadPhone || "").toLowerCase();
                const action = String(act.action || "").toLowerCase();
                const desc = String(act.description || "").toLowerCase();
                return leadName.includes(q) || leadPhone.includes(q) || action.includes(q) || desc.includes(q);
            }
            return true;
        });
    }, [activities, activityTypeFilter, activitySearch]);

    // Export Summary to Excel
    const exportSummaryToExcel = () => {
        if (summaryData.length === 0) {
            toast.error("No data to export");
            return;
        }
        
        const dataToExport = summaryData.map(s => ({
            "Staff Name": s.staffName,
            "Role": s.role,
            "Extension": s.agentExtension || "-",
            "Total Calls": s.totalCalls || 0,
            "Talk Time": formatDuration(s.totalTalkTimeSec),
            "Total Leads (Period)": s.totalLeads,
            "All Time Leads": s.allTimeTotalLeads,
            "Hot Leads": s.totalHot,
            "Warm Leads": s.totalWarm,
            "Cold Leads": s.totalCold,
            "Frozen Leads": s.totalFrozen,
            "Follow Ups": s.totalFollowUp,
            "Registrations": s.totalRegistration,
            "Admissions": s.totalAdmission,
            "Conversion Rate (%)": `${s.conversionRate}%`
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Team Summary Report");
        XLSX.writeFile(wb, `Team_Summary_Report_${getDateParams().label.replace(/\s+/g, '_')}.xlsx`);
    };

    // Export Individual Activities to Excel
    const exportIndividualToExcel = () => {
        if (activities.length === 0) {
            toast.error("No data to export");
            return;
        }
        
        const dataToExport = activities.map(act => ({
            "Timestamp": new Date(act.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            "Action": act.action,
            "Type": act.type?.toUpperCase(),
            "Lead Name": act.leadName,
            "Lead Phone": act.leadPhone,
            "Lead Stage": act.leadStage,
            "Description": act.description,
            "Recording ID": act.recordingId || "-"
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff Activity Log");
        const staffName = individualStaffInfo?.name || "Staff";
        XLSX.writeFile(wb, `${staffName}_Activity_Log_${getDateParams().label.replace(/\s+/g, '_')}.xlsx`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header with Navigation Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <TrendingUp className="w-7 h-7 text-[#FF5B22]" />
                        Staff Activity & Performance Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track team KPIs, telephony talk time, call recordings, and counselor activity timelines.
                    </p>
                </div>
                
                {/* Mode Selector Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner shrink-0">
                    <button 
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                            viewMode === 'summary' 
                                ? 'bg-white text-[#FF5B22] shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Overall Summary
                    </button>
                    <button 
                        onClick={() => setViewMode('individual')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                            viewMode === 'individual' 
                                ? 'bg-white text-[#FF5B22] shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        Individual Log
                    </button>
                    <button 
                        onClick={() => setViewMode('recordings')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                            viewMode === 'recordings' 
                                ? 'bg-white text-[#FF5B22] shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Headphones className="w-4 h-4 text-[#FF5B22]" />
                        Call Recordings
                    </button>
                    <button 
                        onClick={() => setViewMode('wallboard')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                            viewMode === 'wallboard' 
                                ? 'bg-white text-[#FF5B22] shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Live Wallboard
                    </button>
                </div>
            </div>

            {/* Quick Date Filters Toolbar (Visible on Summary, Individual, and Recordings) */}
            {viewMode !== 'wallboard' && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    {/* Date Presets */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                            <Calendar className="w-3.5 h-3.5" /> Date:
                        </span>
                        {[
                            { id: 'today', label: 'Today' },
                            { id: 'yesterday', label: 'Yesterday' },
                            { id: '7days', label: 'Last 7 Days' },
                            { id: 'month', label: 'This Month' },
                            { id: 'all', label: 'All Time' },
                            { id: 'custom', label: 'Custom Range' }
                        ].map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setDatePreset(preset.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    datePreset === preset.id
                                        ? 'bg-[#FF5B22] text-white shadow-xs'
                                        : 'bg-slate-50 text-gray-600 hover:bg-slate-100 hover:text-gray-900 border border-slate-200'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Inputs if selected */}
                    {datePreset === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-gray-400 text-xs font-bold">to</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={() => {
                            if (viewMode === 'summary') fetchSummary();
                            else if (viewMode === 'individual') fetchIndividualReport();
                            else if (viewMode === 'recordings') fetchRecordings();
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ml-auto"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF5B22]' : ''}`} />
                        Refresh
                    </button>
                </div>
            )}

            {/* TAB 1: OVERALL SUMMARY (TEAM LEADERBOARD & PERFORMANCE) */}
            {viewMode === 'summary' && (
                <div className="space-y-6">
                    {/* Top KPI Metrics Cards / Skeletons */}
                    {loading && summaryData.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0"></div>
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-2.5 w-16 bg-slate-200 rounded"></div>
                                            <div className="h-5 w-20 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {/* 1. Calls Made */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5B22] flex items-center justify-center shrink-0">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Calls Made</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-bold text-gray-900">{summaryKpis?.totalTeamCalls || 0}</span>
                                        <span className="text-[11px] font-mono font-medium text-orange-600">
                                            ({formatDuration(summaryKpis?.totalTeamTalkTimeSec)})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Total Leads in Period */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Leads Handled</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-bold text-gray-900">{summaryKpis?.totalTeamLeadsDate || 0}</span>
                                        <span className="text-[11px] text-gray-400">/ {summaryKpis?.totalTeamLeadsAllTime || 0} Total</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Hot & Warm Pipeline */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hot Pipeline</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-bold text-red-600">{summaryKpis?.totalHot || 0} Hot</span>
                                        <span className="text-xs font-semibold text-amber-500">• {summaryKpis?.totalWarm || 0} Warm</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Conversions / Admissions */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversions</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-bold text-emerald-600">{summaryKpis?.totalConversions || 0}</span>
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            {summaryKpis?.avgConversionRate || "0.0"}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Total Staff Actions */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3 col-span-2 md:col-span-1">
                                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff Actions</p>
                                    <span className="text-xl font-bold text-purple-700">{summaryKpis?.totalTeamActivities || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Summary Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-[#FF5B22]" />
                                    Staff Performance Breakdown ({summaryData.length} Members)
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">Summary for period: <span className="font-semibold text-gray-600">{getDateParams().label}</span></p>
                            </div>
                            <button 
                                onClick={exportSummaryToExcel}
                                disabled={summaryData.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                <LucideFileDown className="w-4 h-4" /> Export Team Excel
                            </button>
                        </div>

                        {loading && summaryData.length === 0 ? (
                            <div className="p-6 space-y-3 animate-pulse">
                                {[1, 2, 3, 4].map(r => (
                                    <div key={r} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-200 rounded-full"></div>
                                            <div className="space-y-1.5">
                                                <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                                                <div className="h-2.5 w-20 bg-slate-100 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="h-5 w-16 bg-slate-200 rounded"></div>
                                            <div className="h-5 w-16 bg-slate-200 rounded"></div>
                                            <div className="h-5 w-16 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : summaryData.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                <Filter className="w-12 h-12 mb-3 text-slate-300" />
                                <p className="text-base font-semibold text-slate-600">No Summary Data Available</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">No activity or leads found for staff members in the selected time range.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-gray-600">
                                    <thead className="text-[11px] text-gray-600 uppercase bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3.5 font-bold">Staff Member</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-orange-600">Calls & Talk Time</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-blue-600">Leads Handled</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-red-600">🔥 Hot</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-amber-500">☀️ Warm</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-slate-500">❄️ Cold</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-blue-700">🧊 Frozen</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-orange-600">Follow-Ups</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-purple-600">Registrations</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-emerald-600">Admissions</th>
                                            <th className="px-3 py-3.5 text-center font-bold text-emerald-700">Conv. Rate</th>
                                            <th className="px-4 py-3.5 text-right font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {summaryData.map((s, idx) => (
                                            <tr key={s.staffId || idx} className="bg-white hover:bg-orange-50/20 transition-colors">
                                                {/* Staff Info */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                            {s.staffName ? s.staffName.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-xs">{s.staffName}</div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                                                                    {s.role}
                                                                </span>
                                                                {s.agentExtension && (
                                                                    <span className="text-[10px] font-mono text-orange-600 font-bold">
                                                                        Ext: {s.agentExtension}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Calls & Talk Time */}
                                                <td className="px-3 py-3.5 text-center">
                                                    <div className="font-bold text-gray-900">{s.totalCalls || 0}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 font-medium">
                                                        {formatDuration(s.totalTalkTimeSec)}
                                                    </div>
                                                </td>

                                                {/* Leads Handled */}
                                                <td className="px-3 py-3.5 text-center">
                                                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                                        {s.totalLeads}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        {s.allTimeTotalLeads} total
                                                    </div>
                                                </td>

                                                {/* Hot */}
                                                <td className="px-3 py-3.5 text-center font-bold text-red-600 bg-red-50/20">
                                                    {s.totalHot}
                                                </td>

                                                {/* Warm */}
                                                <td className="px-3 py-3.5 text-center font-medium text-amber-600 bg-amber-50/20">
                                                    {s.totalWarm}
                                                </td>

                                                {/* Cold */}
                                                <td className="px-3 py-3.5 text-center font-medium text-slate-600 bg-slate-50/40">
                                                    {s.totalCold}
                                                </td>

                                                {/* Frozen */}
                                                <td className="px-3 py-3.5 text-center font-medium text-blue-800 bg-blue-50/30">
                                                    {s.totalFrozen}
                                                </td>

                                                {/* Follow-up */}
                                                <td className="px-3 py-3.5 text-center font-semibold text-orange-600">
                                                    {s.totalFollowUp}
                                                </td>

                                                {/* Registration */}
                                                <td className="px-3 py-3.5 text-center font-semibold text-purple-600">
                                                    {s.totalRegistration}
                                                </td>

                                                {/* Admission */}
                                                <td className="px-3 py-3.5 text-center font-bold text-emerald-600 bg-emerald-50/30">
                                                    {s.totalAdmission}
                                                </td>

                                                {/* Conversion Rate */}
                                                <td className="px-3 py-3.5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="font-bold text-emerald-700 text-[11px]">
                                                            {s.conversionRate}%
                                                        </span>
                                                        <div className="w-12 bg-gray-200 h-1 rounded-full overflow-hidden">
                                                            <div 
                                                                className="bg-emerald-500 h-full rounded-full" 
                                                                style={{ width: `${Math.min(parseFloat(s.conversionRate) || 0, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Drilldown Button */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <button
                                                        onClick={() => handleDrilldownStaff(s.staffId)}
                                                        className="px-2.5 py-1.5 bg-orange-50 hover:bg-[#FF5B22] text-[#FF5B22] hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                                                    >
                                                        View Log <ChevronRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-100 font-bold text-slate-700 border-t border-slate-200">
                                        <tr>
                                            <td className="px-4 py-3 font-bold text-gray-900">Total / Team Avg</td>
                                            <td className="px-3 py-3 text-center text-orange-600">
                                                {summaryKpis?.totalTeamCalls || 0}
                                                <div className="text-[10px] font-mono text-slate-500">{formatDuration(summaryKpis?.totalTeamTalkTimeSec)}</div>
                                            </td>
                                            <td className="px-3 py-3 text-center text-blue-700">{summaryKpis?.totalTeamLeadsDate || 0}</td>
                                            <td className="px-3 py-3 text-center text-red-600">{summaryKpis?.totalHot || 0}</td>
                                            <td className="px-3 py-3 text-center text-amber-600">{summaryKpis?.totalWarm || 0}</td>
                                            <td className="px-3 py-3 text-center text-slate-600">{summaryData.reduce((a, c) => a + c.totalCold, 0)}</td>
                                            <td className="px-3 py-3 text-center text-blue-800">{summaryData.reduce((a, c) => a + c.totalFrozen, 0)}</td>
                                            <td className="px-3 py-3 text-center text-orange-600">{summaryData.reduce((a, c) => a + c.totalFollowUp, 0)}</td>
                                            <td className="px-3 py-3 text-center text-purple-600">{summaryData.reduce((a, c) => a + c.totalRegistration, 0)}</td>
                                            <td className="px-3 py-3 text-center text-emerald-600">{summaryKpis?.totalConversions || 0}</td>
                                            <td className="px-3 py-3 text-center text-emerald-700">{summaryKpis?.avgConversionRate || "0.0"}%</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: INDIVIDUAL LOG (STAFF DRILLDOWN & TIMELINE) */}
            {viewMode === 'individual' && (
                <div className="space-y-6">
                    {/* Staff Selector & Header Card */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Staff Dropdown */}
                            <div className="flex-1 max-w-md">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Select Staff Member
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedStaff}
                                        onChange={(e) => setSelectedStaff(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        <option value="" disabled>Select Staff...</option>
                                        {staffList.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.name} ({s.role}) {s.agentExtension ? `• Ext ${s.agentExtension}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Export Individual Log */}
                            <button
                                onClick={exportIndividualToExcel}
                                disabled={activities.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 self-end md:self-auto"
                            >
                                <LucideFileDown className="w-4 h-4" /> Export Staff Excel
                            </button>
                        </div>

                        {/* Selected Staff Stats Card */}
                        {individualStaffInfo && (
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Actions</p>
                                    <p className="text-base font-bold text-slate-800 mt-0.5">{individualStats?.totalActivities || 0}</p>
                                </div>
                                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Calls Made</p>
                                    <p className="text-base font-bold text-orange-700 mt-0.5">{individualStats?.totalCalls || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Talk Time</p>
                                    <p className="text-base font-bold text-blue-700 font-mono mt-0.5">{formatDuration(individualStats?.totalTalkTimeSec)}</p>
                                </div>
                                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Leads Contacted</p>
                                    <p className="text-base font-bold text-purple-700 mt-0.5">{individualStats?.uniqueLeadsContacted || 0}</p>
                                </div>
                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Stage & Follow-ups</p>
                                    <p className="text-base font-bold text-emerald-700 mt-0.5">{(individualStats?.totalStageChanges || 0) + (individualStats?.totalFollowUps || 0)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline Activity Feed Container */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-0">
                        {/* Feed Filter Toolbar */}
                        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                            {/* Search Feed */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by lead name, phone, or action..."
                                    value={activitySearch}
                                    onChange={(e) => setActivitySearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Action Type Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                    { id: 'all', label: 'All Actions' },
                                    { id: 'call', label: '📞 Calls' },
                                    { id: 'stage', label: '🔥 Stage Changes' },
                                    { id: 'followup', label: '📅 Follow-ups' },
                                    { id: 'note', label: '📝 Notes' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActivityTypeFilter(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            activityTypeFilter === cat.id
                                                ? 'bg-slate-800 text-white'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activity Timeline List */}
                        {loading && activities.length === 0 ? (
                            <div className="p-6 space-y-4 animate-pulse">
                                {[1, 2, 3, 4].map(idx => (
                                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-4 items-start justify-between">
                                        <div className="flex items-start gap-3.5 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3.5 w-48 bg-slate-200 rounded"></div>
                                                <div className="h-2.5 w-64 bg-slate-100 rounded"></div>
                                                <div className="h-4 w-40 bg-orange-100 rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-[300px] h-10 bg-slate-200 rounded-xl shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                <Clock className="w-12 h-12 mb-3 text-slate-300" />
                                <p className="text-base font-semibold text-slate-600">No Activity Logs Found</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                    No activities recorded for this staff member in {getDateParams().label}.
                                </p>
                                {datePreset !== 'all' && (
                                    <button
                                        onClick={() => setDatePreset('all')}
                                        className="mt-3 px-4 py-2 bg-[#FF5B22] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#ea4e14] transition shadow-xs"
                                    >
                                        View All-Time Activity History
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredActivities.map((act, idx) => {
                                    const isCall = act.type === 'call';
                                    const isStage = act.type === 'stage';
                                    const isNote = act.type === 'note';
                                    const isFollowup = act.type === 'followup';

                                    const iconBg = isCall 
                                        ? 'bg-orange-100 text-[#FF5B22]' 
                                        : isStage 
                                            ? 'bg-red-100 text-red-600' 
                                            : isFollowup 
                                                ? 'bg-blue-100 text-blue-600' 
                                                : 'bg-purple-100 text-purple-600';

                                    const audioUrl = act.audioUrl || (act.recordingId ? getAudioStreamUrl(act.recordingId) : null);

                                    return (
                                        <div key={act.id || idx} className="p-4.5 hover:bg-slate-50/75 transition-colors flex flex-col md:flex-row gap-4 items-start justify-between">
                                            {/* Icon + Activity Info */}
                                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                                    {isCall ? <PhoneCall className="w-5 h-5" /> : isStage ? <Flame className="w-5 h-5" /> : isFollowup ? <Calendar className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>

                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    {/* Action & Time Header */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                                                            {act.action}
                                                        </h4>
                                                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                            🕒 {new Date(act.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-xs text-gray-600 leading-relaxed break-words">
                                                        {act.description}
                                                    </p>

                                                    {/* Lead Metadata Pill */}
                                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                        <span className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 inline-flex items-center gap-1.5">
                                                            👤 Lead: <span className="underline font-semibold">{act.leadName}</span> ({act.leadPhone || "No Phone"})
                                                        </span>
                                                        {act.leadStage && (
                                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                Stage: {act.leadStage}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* In-App Call Audio Player if Call Activity has recording */}
                                            {audioUrl && (
                                                <div className="w-full md:w-[360px] shrink-0 pt-2 md:pt-0">
                                                    <AudioPlayer
                                                        src={audioUrl}
                                                        duration={act.duration || 0}
                                                        title={`Call with ${act.leadName}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: CALL RECORDINGS (AIRTEL IQ AUDIO VAULT) */}
            {viewMode === 'recordings' && (
                <div className="space-y-6">
                    {/* Filter & Search Bar */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by agent, lead name, phone, or recording ID..."
                                    value={recordingSearch}
                                    onChange={(e) => setRecordingSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                                />
                            </div>

                            {/* Staff Filter Dropdown */}
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                <select
                                    value={recordingStaffFilter}
                                    onChange={(e) => setRecordingStaffFilter(e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                >
                                    <option value="">All Staff Members</option>
                                    {staffList.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} ({s.role}) {s.agentExtension ? `• Ext ${s.agentExtension}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Recordings List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <Radio className="w-4 h-4 text-[#FF5B22] animate-pulse" />
                                All Airtel IQ PBX Call Audio ({recordingsList.length})
                            </h2>
                            <span className="text-xs text-gray-400">Streamed securely from Cloud Switch</span>
                        </div>

                        {loading && recordingsList.length === 0 ? (
                            <div className="p-6 space-y-3 animate-pulse">
                                {[1, 2, 3, 4].map(idx => (
                                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex gap-2">
                                                <div className="h-4 w-24 bg-orange-100 rounded-md"></div>
                                                <div className="h-4 w-24 bg-emerald-100 rounded-md"></div>
                                                <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                                            </div>
                                            <div className="h-3 w-48 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="w-full md:w-[360px] h-10 bg-slate-200 rounded-xl shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recordingsList.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                <Headphones className="w-12 h-12 mb-3 text-slate-300" />
                                <p className="text-base font-semibold text-slate-600">No Call Recordings Found</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">Audio recordings will appear here automatically when staff make or receive calls via Airtel IQ PBX.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recordingsList
                                    .filter((rec) => {
                                        if (recordingStaffFilter) {
                                            const staffObj = staffList.find(s => s._id === recordingStaffFilter);
                                            const matchesStaff = (
                                                (rec.staffId && String(rec.staffId) === String(recordingStaffFilter)) ||
                                                (staffObj?.agentExtension && String(rec.agentExtension) === String(staffObj.agentExtension)) ||
                                                (staffObj?.agentExtension && String(rec.raw?.extension) === String(staffObj.agentExtension)) ||
                                                (staffObj?.agentExtension && String(rec.raw?.caller_id).includes(String(staffObj.agentExtension))) ||
                                                (staffObj?.name && rec.agentName && rec.agentName.toLowerCase().includes(staffObj.name.toLowerCase()))
                                            );
                                            if (!matchesStaff) return false;
                                        }

                                        if (!recordingSearch) return true;
                                        const s = recordingSearch.toLowerCase();
                                        const agent = String(rec.agentName || rec.from || rec.caller || "").toLowerCase();
                                        const ext = String(rec.agentExtension || "").toLowerCase();
                                        const lead = String(rec.leadName || rec.to || rec.callee || "").toLowerCase();
                                        const phone = String(rec.customerPhone || "").toLowerCase();
                                        const id = String(rec.id || rec.recordingId || rec.recording_id || "").toLowerCase();
                                        return agent.includes(s) || ext.includes(s) || lead.includes(s) || phone.includes(s) || id.includes(s);
                                    })
                                    .map((rec, idx) => {
                                        const recId = rec.id || rec.recordingId || rec.recording_id || rec._id;
                                        const audioUrl = getAudioStreamUrl(recId);
                                        const durationSec = rec.durationSec || rec.duration || 0;
                                        const agentLabel = rec.agentName || (rec.agentExtension ? `Extension ${rec.agentExtension}` : "Agent");
                                        const leadLabel = rec.leadName || (rec.customerPhone ? `Customer (${rec.customerPhone})` : "Customer");
                                        const dateStr = rec.timestamp || rec.created_at || rec.start_time || new Date().toISOString();

                                        return (
                                            <div key={recId || idx} className="p-4.5 hover:bg-slate-50/75 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                <div className="space-y-1.5 flex-1 min-w-[240px]">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 font-bold rounded-lg text-xs">
                                                            {agentLabel}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">➔</span>
                                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-xs">
                                                            {leadLabel}
                                                        </span>
                                                        {durationSec > 0 && (
                                                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                                                                ⏱️ {Math.floor(durationSec / 60)}m {durationSec % 60}s
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span>🕒 {new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                        <span>•</span>
                                                        <span>ID: <code className="text-slate-600 font-mono text-[11px]">{String(recId || "").slice(-10) || "N/A"}</code></span>
                                                        {rec.direction && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="capitalize font-semibold text-slate-500">{rec.direction}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* In-App CRM Audio Player */}
                                                <div className="w-full md:w-[400px]">
                                                    <AudioPlayer
                                                        src={audioUrl}
                                                        duration={durationSec}
                                                        title={`${agentLabel} ➔ ${leadLabel}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: LIVE TELEPHONY WALLBOARD */}
            {viewMode === 'wallboard' && (
                <LiveTelephonyWallboard />
            )}
        </div>
    );
}
