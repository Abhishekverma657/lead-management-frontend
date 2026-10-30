import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Radio, Headphones, PhoneCall, PhoneForwarded, PhoneMissed, 
    Clock, RefreshCw, User, ShieldCheck, AlertCircle, Play, 
    CheckCircle, PhoneOff, ArrowUpRight, Flame, BarChart3, Activity, ShieldAlert, ArrowLeft,
    X, Search, Calendar, TrendingUp, PhoneIncoming, PhoneOutgoing, ChevronRight
} from 'lucide-react';
import { getLiveWallboardApi, getExtensionHistoryApi, getAudioStreamUrl } from '../../api/telephonyApi';
import AudioPlayer from '../../components/AudioPlayer';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

export default function LiveTelephonyWallboard() {
    const { user } = useAppContext();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(user?.role);

    const [wallboardData, setWallboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshIntervalSec, setRefreshIntervalSec] = useState(3);
    const [secondsToNext, setSecondsToNext] = useState(3);
    const [nowTick, setNowTick] = useState(Date.now());
    const timerRef = useRef(null);

    // Extension History Modal State
    const [selectedExtAgent, setSelectedExtAgent] = useState(null);
    const [extHistoryRange, setExtHistoryRange] = useState('today');
    const [extHistoryData, setExtHistoryData] = useState(null);
    const [loadingExtHistory, setLoadingExtHistory] = useState(false);
    const [extSearchFilter, setExtSearchFilter] = useState('');

    const openExtensionHistory = async (agent, range = 'today') => {
        setSelectedExtAgent(agent);
        setExtHistoryRange(range);
        setExtSearchFilter('');
        const extNum = agent.agentExtension || agent.id;
        if (!extNum) return;
        setLoadingExtHistory(true);
        try {
            const res = await getExtensionHistoryApi(extNum, { range });
            if (res.success) {
                setExtHistoryData(res);
            }
        } catch (err) {
            console.error("Extension history error:", err);
            toast.error("Failed to load extension call history");
        } finally {
            setLoadingExtHistory(false);
        }
    };

    const handleRangeChange = (newRange) => {
        if (selectedExtAgent) {
            openExtensionHistory(selectedExtAgent, newRange);
        }
    };

    // Live 1-second stopwatch ticker for real-time call durations
    useEffect(() => {
        const interval = setInterval(() => {
            setNowTick(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchWallboard = async (isInitial = false) => {
        if (!isAdmin) return;
        if (isInitial) setLoading(true);
        try {
            const res = await getLiveWallboardApi();
            if (res.success) {
                setWallboardData(res);
            }
        } catch (err) {
            console.error("Wallboard fetch error:", err);
            if (isInitial) toast.error("Failed to load live telephony data");
        } finally {
            if (isInitial) setLoading(false);
            setSecondsToNext(refreshIntervalSec);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchWallboard(true);
        }
    }, [isAdmin]);

    // Auto-refresh countdown timer
    useEffect(() => {
        if (!autoRefresh) return;

        timerRef.current = setInterval(() => {
            setSecondsToNext(prev => {
                if (prev <= 1) {
                    fetchWallboard(false);
                    return refreshIntervalSec;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [autoRefresh, refreshIntervalSec]);

    const formatDuration = (totalSec) => {
        if (!totalSec || totalSec <= 0) return "0s";
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const getCallLiveDuration = (call) => {
        if (call?.startedAt) {
            const startMs = new Date(call.startedAt).getTime();
            if (!isNaN(startMs) && startMs > 0) {
                return Math.max(0, Math.floor((nowTick - startMs) / 1000));
            }
        }
        return call?.durationSec || 0;
    };

    const metrics = wallboardData?.metrics || {
        totalCallsToday: 0,
        connectedCallsToday: 0,
        missedCallsToday: 0,
        connectionRate: 0,
        totalTalkTimeSec: 0,
        avgTalkTimeSec: 0,
        activeCallsCount: 0,
        totalExtensionsCount: 0
    };

    const liveCalls = wallboardData?.liveCalls || [];
    const agentsPresence = wallboardData?.agentsPresence || [];
    const recentRecordings = wallboardData?.recentRecordings || [];

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4 my-10 font-sans">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                    <ShieldAlert size={32} />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                        Live Telephony Wallboard and call telemetry monitoring is reserved for CRM Administrators and Super Admins only.
                    </p>
                </div>
                <Link
                    to="/lead-management/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    // Premium Skeleton Loading Screen when initial data is fetching
    if (loading && !wallboardData) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Connecting Telemetry Banner */}
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 transform origin-top-right animate-pulse"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Radio className="w-5 h-5 text-white animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                                    Connecting to Airtel IQ Cloud Switch...
                                </h3>
                                <p className="text-xs text-orange-100 mt-0.5">
                                    Synchronizing real-time active PBX calls, telecaller roster &amp; CDR metrics
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold self-start sm:self-auto">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching Live Telemetry
                        </div>
                    </div>
                </div>

                {/* Skeleton KPI Cards (4 Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-3 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-20 bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-12 bg-orange-100 rounded-full"></div>
                            </div>
                            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                            <div className="h-3 w-32 bg-slate-100 rounded-md"></div>
                        </div>
                    ))}
                </div>

                {/* Skeleton Live Active Calls Container */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
                        <div className="h-3 w-28 bg-slate-100 rounded-md"></div>
                    </div>
                    <div className="py-8 flex flex-col items-center justify-center space-y-2.5">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <Headphones className="w-6 h-6 text-orange-500 animate-bounce" />
                        </div>
                        <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
                        <div className="h-3 w-64 bg-slate-100 rounded-md"></div>
                    </div>
                </div>

                {/* Skeleton Extension Team Roster (6 Cards) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="h-4 w-52 bg-slate-200 rounded-md"></div>
                        <div className="h-4 w-28 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-200"></div>
                                        <div className="space-y-1">
                                            <div className="h-3.5 w-24 bg-slate-200 rounded-md"></div>
                                            <div className="h-2.5 w-16 bg-slate-100 rounded-md"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-16 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between">
                                    <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
                                    <div className="h-3 w-20 bg-slate-200 rounded-md"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Control & Live Pulse Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="flex h-3.5 w-3.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5B22] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF5B22]"></span>
                        </span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            Airtel IQ Telephony Live Wallboard
                            {loading && (
                                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                                    <RefreshCw size={10} className="animate-spin" /> Syncing
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-gray-500">
                            Real-time PBX call sessions, telecaller presence &amp; CDR metrics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                        <span className="text-gray-500 font-medium">Auto-Sync:</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                                autoRefresh ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                            }`}
                        >
                            {autoRefresh ? `ON (${secondsToNext}s)` : "PAUSED"}
                        </button>
                    </div>

                    <button
                        onClick={() => fetchWallboard(false)}
                        disabled={loading}
                        className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF5B22] border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Refresh Now</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Live Calls */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Active Live Calls</span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF5B22] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                            <Radio size={12} className="animate-pulse" /> LIVE
                        </span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {liveCalls.length}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Ongoing call sessions right now</p>
                </div>

                {/* 2. Today Calls & Connection Rate */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Today Calls Dialed</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {metrics.connectionRate}% Connected
                        </span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {metrics.totalCallsToday}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="text-emerald-600 font-semibold">{metrics.connectedCallsToday} Answered</span>
                        <span>•</span>
                        <span className="text-rose-500 font-semibold">{metrics.missedCallsToday} Missed</span>
                    </div>
                </div>

                {/* 3. Total Talk Time */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Total Talk Time</span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Today
                        </span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {formatDuration(metrics.totalTalkTimeSec)}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Avg per call: {formatDuration(metrics.avgTalkTimeSec)}</p>
                </div>

                {/* 4. Extensions Roster */}
                {/* 4. Extensions Roster */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Connected Callers</span>
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                            PBX Mapped
                        </span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {agentsPresence.length} <span className="text-xs font-normal text-gray-400">Callers</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="text-emerald-600 font-semibold">
                            {Math.max(0, agentsPresence.filter(a => a.liveStatus === "AVAILABLE").length - (agentsPresence.some(a => a.liveStatus === "IN_CALL") ? 0 : (liveCalls.length > 0 ? 1 : 0)))} Available
                        </span>
                        <span>•</span>
                        <span className="text-[#FF5B22] font-semibold">
                            {Math.max(agentsPresence.filter(a => a.liveStatus === "IN_CALL").length, liveCalls.length)} Busy
                        </span>
                    </div>
                </div>
            </div>

            {/* Notice if no callers have connected extensions */}
            {agentsPresence.length === 0 && !loading && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">No Callers Connected to Extension IDs Yet</h4>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Airtel IQ live calls, recordings, and analytics are strictly filtered to callers connected via their Extension IDs. Assign Extension IDs to your callers in Caller Management to monitor their data.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/staff"
                        className="px-4 py-2 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-sm cursor-pointer"
                    >
                        Manage Callers &amp; Extensions
                    </Link>
                </div>
            )}

            {/* Section 1: 🔴 Live Ongoing Calls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/75 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radio size={16} className="text-[#FF5B22] animate-pulse" />
                        <h3 className="font-bold text-gray-900 text-sm">
                            Live Active Call Sessions ({liveCalls.length})
                        </h3>
                    </div>
                    <span className="text-xs text-gray-400">Updates automatically</span>
                </div>

                {liveCalls.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                        <Headphones className="w-10 h-10 mb-2.5 text-slate-300" />
                        <p className="text-sm font-bold text-gray-700">No Calls Currently Active</p>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-sm">
                            When telecallers click-to-dial or receive customer calls, active sessions will display here with live duration and agent details.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {liveCalls.map((call, idx) => (
                            <div key={call.id || idx} className="p-4.5 hover:bg-orange-50/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5B22] flex items-center justify-center font-black text-sm shrink-0">
                                        <PhoneCall size={18} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {call.callerName || (call.callerExtension ? `Extension ${call.callerExtension}` : "Agent")}
                                            </span>
                                            {call.callerExtension && (
                                                <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                                    Ext {call.callerExtension}
                                                </span>
                                            )}
                                            <span className="text-gray-400 text-xs">➔</span>
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                                {call.leadName || (call.customerPhone ? `Customer (${call.customerPhone})` : "Customer")}
                                                {call.customerPhone && call.leadName && !call.leadName.includes(call.customerPhone) && ` (${call.customerPhone})`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            <span>Direction: <strong className="text-gray-600">{call.direction}</strong></span>
                                            <span>•</span>
                                            <span>Status: <strong className="text-[#FF5B22]">{call.status}</strong></span>
                                            <span>•</span>
                                            <span>Call ID: <code className="text-gray-500 font-mono">{String(call.id || "").slice(-8) || "N/A"}</code></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-mono text-xs font-bold shadow-xs">
                                        <Clock size={13} className="text-[#FF5B22] animate-spin" />
                                        <span>{formatDuration(getCallLiveDuration(call))}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: 👥 Telecallers Live Presence Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Agent &amp; Telecaller Presence Roster</h3>
                        <p className="text-xs text-gray-500">Live agent availability, active calling status, and daily talk time</p>
                    </div>
                    <span className="text-xs font-semibold text-[#FF5B22] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                        {agentsPresence.length} Connected Callers
                    </span>
                </div>

                {agentsPresence.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
                        <User className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-gray-700">No Connected Callers in Team Roster</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm">
                            Only staff members with an assigned Airtel IQ extension ID are shown here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentsPresence.map((agent) => {
                        const isInCall = agent.liveStatus === "IN_CALL";
                        const isAvailable = agent.liveStatus === "AVAILABLE";

                        return (
                            <div 
                                key={agent.id}
                                onClick={() => openExtensionHistory(agent, 'today')}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
                                    isInCall 
                                        ? "bg-orange-50/40 border-orange-200 ring-1 ring-orange-300"
                                        : "bg-gray-50/50 border-gray-200/80 hover:border-orange-300 hover:bg-orange-50/10"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center text-white shrink-0 shadow-xs ${
                                            isInCall ? "bg-[#FF5B22]" : (isAvailable ? "bg-emerald-600" : "bg-slate-400")
                                        }`}>
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#FF5B22] transition truncate max-w-[130px]">{agent.name}</h4>
                                            <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                                        </div>
                                    </div>

                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                        isInCall
                                            ? "bg-orange-100 text-[#FF5B22] border border-orange-300"
                                            : (isAvailable ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-gray-200 text-gray-600")
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isInCall ? "bg-[#FF5B22] animate-ping" : (isAvailable ? "bg-emerald-600" : "bg-gray-400")}`} />
                                        {isInCall ? "IN CALL" : (isAvailable ? "AVAILABLE" : "OFFLINE")}
                                    </span>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <span>Ext:</span>
                                        <strong className="text-gray-800 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{agent.agentExtension || "None"}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Calls: <strong className="text-gray-900">{agent.totalCallsToday}</strong></span>
                                        <span>•</span>
                                        <span className="text-gray-500">Talk: <strong className="text-orange-700">{formatDuration(agent.totalTalkTimeSec)}</strong></span>
                                    </div>
                                </div>

                                <div className="mt-2 pt-1.5 flex items-center justify-between text-[10px] font-bold text-orange-600 group-hover:text-orange-700 opacity-80 group-hover:opacity-100 transition">
                                    <span>Click to view call history</span>
                                    <span className="flex items-center gap-0.5">Details <ChevronRight size={12} /></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>

            {/* Section 3: 🎙️ Recent Recordings Playback */}
            {recentRecordings.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Headphones size={16} className="text-[#FF5B22]" />
                            <h3 className="font-bold text-gray-900 text-sm">Recent Call Recordings (Airtel IQ PBX)</h3>
                        </div>
                        <span className="text-xs text-gray-400">Streamed securely from Airtel IQ Cloud</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recentRecordings.slice(0, 6).map((rec, idx) => {
                            const recId = rec.id || rec.recordingId || rec.recording_id || rec._id;
                            const audioUrl = getAudioStreamUrl(recId);
                            const agentLabel = rec.agentName || (rec.agentExtension ? `Extension ${rec.agentExtension}` : "Agent");
                            const leadLabel = rec.leadName || (rec.customerPhone ? `Customer (${rec.customerPhone})` : "Customer");
                            const durationSec = rec.durationSec || rec.duration || 0;

                            return (
                                <div key={recId || idx} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-2.5 hover:border-orange-200 transition">
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-xs">
                                                {agentLabel}
                                            </span>
                                            <span className="text-gray-400 text-[10px]">➔</span>
                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                                {leadLabel}
                                            </span>
                                        </div>
                                        {durationSec > 0 && (
                                            <span className="text-[11px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                                                ⏱️ {formatDuration(durationSec)}
                                            </span>
                                        )}
                                    </div>
                                    <AudioPlayer src={audioUrl} duration={durationSec} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 📊 Extension Call History & Analytics Modal */}
            {selectedExtAgent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-[#FF5B22] flex items-center justify-center font-black text-lg text-white shadow-md">
                                    {selectedExtAgent.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black tracking-tight">{selectedExtAgent.name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-orange-200 border border-white/20">
                                            Ext {selectedExtAgent.agentExtension}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        {selectedExtAgent.role} • {selectedExtAgent.email || selectedExtAgent.mobile || "Airtel IQ Telecaller"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedExtAgent(null)}
                                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Date Range Selector Bar */}
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                                {[
                                    { id: 'today', label: 'Today' },
                                    { id: 'yesterday', label: 'Yesterday' },
                                    { id: 'week', label: 'Last 7 Days' },
                                    { id: 'month', label: 'This Month' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleRangeChange(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            extHistoryRange === tab.id
                                                ? "bg-[#FF5B22] text-white shadow-xs"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Filter */}
                            <div className="relative w-full sm:w-64">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by customer phone..."
                                    value={extSearchFilter}
                                    onChange={(e) => setExtSearchFilter(e.target.value)}
                                    className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5B22]/30 focus:border-[#FF5B22]"
                                />
                            </div>
                        </div>

                        {/* Modal Body: Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {loadingExtHistory ? (
                                <div className="py-16 text-center space-y-3">
                                    <RefreshCw className="w-8 h-8 text-[#FF5B22] animate-spin mx-auto" />
                                    <p className="text-xs font-bold text-gray-600">Fetching Extension CDR Logs from Airtel IQ...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Extension Summary Metric Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                                            <span className="text-[11px] font-semibold text-gray-500">Total Dialed</span>
                                            <div className="text-2xl font-black text-gray-900 mt-1">
                                                {extHistoryData?.summary?.totalCalls ?? selectedExtAgent.totalCallsToday}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">Calls in period</div>
                                        </div>

                                        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                                            <span className="text-[11px] font-semibold text-emerald-800">Answered Calls</span>
                                            <div className="text-2xl font-black text-emerald-700 mt-1">
                                                {extHistoryData?.summary?.answeredCalls ?? "-"}
                                            </div>
                                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                                {extHistoryData?.summary?.connectionRate ?? 0}% Connected
                                            </div>
                                        </div>

                                        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200">
                                            <span className="text-[11px] font-semibold text-rose-800">Missed / Unanswered</span>
                                            <div className="text-2xl font-black text-rose-700 mt-1">
                                                {extHistoryData?.summary?.missedCalls ?? "-"}
                                            </div>
                                            <div className="text-[10px] text-rose-600 font-bold mt-0.5">No Response</div>
                                        </div>

                                        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                                            <span className="text-[11px] font-semibold text-amber-800">Total Talk Time</span>
                                            <div className="text-2xl font-black text-amber-900 mt-1">
                                                {formatDuration(extHistoryData?.summary?.totalDurationSec ?? selectedExtAgent.totalTalkTimeSec)}
                                            </div>
                                            <div className="text-[10px] text-amber-700 mt-0.5">
                                                Avg: {formatDuration(extHistoryData?.summary?.avgDurationSec ?? 0)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Call Logs Table */}
                                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                                        <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700">
                                            <span>Call Records ({extHistoryData?.logs?.length || 0})</span>
                                            <span className="text-[11px] font-normal text-gray-400">
                                                Range: {extHistoryRange.toUpperCase()}
                                            </span>
                                        </div>

                                        {(!extHistoryData?.logs || extHistoryData.logs.length === 0) ? (
                                            <div className="p-10 text-center text-gray-400">
                                                <PhoneCall className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-gray-600">No Call Logs Found</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">No calls were recorded for Extension {selectedExtAgent.agentExtension} in this time period.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
                                                {extHistoryData.logs
                                                    .filter(l => !extSearchFilter || String(l.to || l.from).includes(extSearchFilter))
                                                    .map((call, idx) => {
                                                        const isAns = call.status === "Answered" || (call.duration && call.duration > 0);
                                                        const isOut = String(call.direction || "").toLowerCase().includes("out");

                                                        return (
                                                            <div key={call.id || idx} className="p-3.5 hover:bg-gray-50 flex items-center justify-between gap-3 transition text-xs">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                                                        isAns ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                                    }`}>
                                                                        {isOut ? <PhoneOutgoing size={14} /> : <PhoneIncoming size={14} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono font-bold text-gray-900">
                                                                                {call.to || call.from || "Customer"}
                                                                            </span>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                                                                                isAns ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                                                                            }`}>
                                                                                {call.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                                                            {new Date(call.start).toLocaleString('en-IN', {
                                                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                                            })} • {call.direction || "Outbound"}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono font-bold text-slate-700 text-xs flex items-center gap-1">
                                                                        <Clock size={11} className="text-gray-400" />
                                                                        <span>{formatDuration(call.duration)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                            <span className="text-xs text-gray-500">
                                Official Airtel IQ Vonage CDR Telemetry
                            </span>
                            <button
                                onClick={() => setSelectedExtAgent(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
