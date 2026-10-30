import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Download, Plus, User, Clock, MessageSquarePlus, MessageSquare, 
    Eye, EyeOff, Settings2, ChevronDown, Loader2, Search, Filter, Phone, 
    Mail, ExternalLink, Copy, CheckCircle2, ShieldCheck, CreditCard, 
    Flame, Sparkles, FileSpreadsheet, RefreshCw, X, ArrowUpRight,
    HelpCircle, ChevronRight, MessageCircle, PhoneCall, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getFormById, getFormResponses, addResponseRemark, syncFormFields } from '../../api/formApi';
import { useAppContext } from '../../context/AppContext';

export default function FormResponses() {
    const { user } = useAppContext();
    const isAdmin = user?.role === 'ADMIN';
    const isSubAdmin = user?.role === 'SUB_ADMIN';
    const { id } = useParams();
    
    const [responses, setResponses] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Modals
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRemark, setNewRemark] = useState({ text: '', disposition: '', stage: '' });
    
    // Column Visibility
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColMenu, setShowColMenu] = useState(false);
    
    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStage, setFilterStage] = useState('');
    const [filterDisposition, setFilterDisposition] = useState('');
    const [filterVerification, setFilterVerification] = useState('');
    const [filterPayment, setFilterPayment] = useState('');
    
    // Mapping state
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapTargetField, setMapTargetField] = useState('studentName');
    const [mapSourceQuestionId, setMapSourceQuestionId] = useState('');
    const [isMapping, setIsMapping] = useState(false);
    const [syncProgress, setSyncProgress] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    const DISPOSITIONS = [
        "Admission Done",
        "Already Joined UA",
        "Call Back",
        "Cut The Call",
        "Doing Self Study",
        "Duplicate No.",
        "Fees Issue",
        "Interested",
        "Invalid No.",
        "Joined At Hometown",
        "Joined College",
        "Joined Online Course",
        "Joined Other Institute",
        "Language Issue",
        "No Student Available",
        "Not Contactable",
        "Not Interested",
        "Not Responding",
        "Other Subject",
        "Registration Done",
        "Scholarship Issue",
        "Switch Off",
        "Think & Decide",
        "Visit Done",
        "Voice Issue",
        "Will Come For Free Test",
        "Will Join College",
        "Will Join Crash Course",
        "Will Join Next Year",
        "Will Join Test Series",
        "Will Pay Today",
        "Will Think After Adv Exam",
        "Will Think After Mains Exam",
        "Will Think After Neet Exam",
        "Will Visit",
        "Will Visit Again",
        "Will Wait For Result",
        "Won't Join Again",
        "Wrong No."
    ];

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStage, filterDisposition, filterVerification, filterPayment]);

    const fetchData = async (isManualRefresh = false) => {
        if (!id || id === 'undefined') return;
        try {
            if (isManualRefresh) setIsRefreshing(true);
            const [formData, responsesData] = await Promise.all([
                getFormById(id),
                getFormResponses(id)
            ]);

            if (formData.success) setForm(formData.data);
            if (responsesData.success) setResponses(responsesData.data || []);
            if (isManualRefresh) toast.success('Data refreshed');
        } catch (error) {
            console.error('Error fetching form responses:', error);
            toast.error('Error fetching responses data');
        } finally {
            setLoading(false);
            if (isManualRefresh) setIsRefreshing(false);
        }
    };

    // Calculate max remarks to know how many columns to show
    const maxRemarks = Math.max(1, ...responses.map(r => r.remarks?.length || 0));

    const toggleColumn = (colId) => {
        setHiddenColumns(prev => 
            prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
        );
    };

    const isVisible = (colId) => !hiddenColumns.includes(colId);

    const handleAddRemarkClick = (resp, e) => {
        if (e) e.stopPropagation();
        setSelectedResponse(resp);
        setNewRemark({ text: '', disposition: '', stage: '' });
        setIsRemarkModalOpen(true);
    };

    const handleViewDetailClick = (resp) => {
        setSelectedResponse(resp);
        setIsDetailModalOpen(true);
    };

    const handleAddRemark = async () => {
        if (!newRemark.text || !newRemark.disposition) {
            toast.error('Please enter remark and select disposition');
            return;
        }

        if (!newRemark.stage) {
            toast.error('Please select a stage');
            return;
        }

        try {
            setIsSubmitting(true);
            await addResponseRemark(selectedResponse._id, {
                text: newRemark.text,
                disposition: newRemark.disposition,
                stage: newRemark.stage
            });
            toast.success('Remark added successfully');
            setIsRemarkModalOpen(false);
            setNewRemark({ text: '', disposition: '', stage: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding remark:', error);
            toast.error(error.response?.data?.message || 'Failed to add remark');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMapData = async () => {
        if (!mapSourceQuestionId) {
            toast.error("Please select a source question");
            return;
        }
        setIsMapping(true);
        setSyncProgress({ current: 0, total: responses.length });
        
        try {
            const chunkSize = 20;
            let totalUpdated = 0;
            
            for (let i = 0; i < responses.length; i += chunkSize) {
                const chunk = responses.slice(i, i + chunkSize).map(r => r._id);
                const res = await syncFormFields(id, { 
                    targetField: mapTargetField, 
                    questionId: mapSourceQuestionId,
                    responseIds: chunk
                });
                totalUpdated += res.updatedCount;
                setSyncProgress({ current: Math.min(i + chunkSize, responses.length), total: responses.length });
            }
            
            toast.success(`Successfully mapped ${totalUpdated} records`);
            setIsMapModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to map data");
        } finally {
            setIsMapping(false);
            setSyncProgress(null);
            setMapSourceQuestionId('');
        }
    };

    // Helper: Normalize text for flexible matching
    const normalizeKey = (text) => (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Helper: Identify unique question texts to merge duplicate columns
    const getUniqueHeaders = (questions) => {
        if (!questions) return [];
        const seenKeys = new Set();
        return questions
            .filter(q => {
                const key = normalizeKey(q.questionText);
                if (seenKeys.has(key)) return false;
                seenKeys.add(key);
                return true;
            })
            .map(q => q.questionText);
    };

    // Helper: Find answer across all potential question IDs for a given text header
    const getMergedAnswer = (response, questionText, allQuestions) => {
        if (!allQuestions || !response.answers) return '-';
        const targetKey = normalizeKey(questionText);

        const matchingQIds = allQuestions
            .filter(q => normalizeKey(q.questionText) === targetKey)
            .map(q => q.id);

        for (const qId of matchingQIds) {
            const ansObj = response.answers.find(a => a.questionId === qId);
            if (ansObj && ansObj.answer != null) {
                const val = ansObj.answer;
                if (Array.isArray(val) && val.length === 0) continue;
                if (typeof val === 'string' && val.trim() === '') continue;
                return Array.isArray(val) ? val.join(', ') : val;
            }
        }
        return '-';
    };

    const getDispositionColor = (disp) => {
        const d = disp?.toUpperCase();
        if (d === 'SWITCH OFF' || d === 'SWITCH OFF/NOT REACHABLE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (d === 'COLD') return 'bg-sky-50 text-sky-700 border-sky-200';
        if (d === 'NOT INTERESTED') return 'bg-rose-50 text-rose-700 border-rose-200';
        if (d === 'THINK & DECIDE') return 'bg-purple-50 text-purple-700 border-purple-200';
        if (d === 'OUT OF TOWN') return 'bg-amber-50 text-amber-800 border-amber-200';
        if (d === 'CALL BACK' || d === 'ASK TO CALL BACK') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (d === 'ADMISSION DONE' || d === 'REGISTRATION DONE') return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
        if (d === 'INTERESTED') return 'bg-teal-50 text-teal-700 border-teal-200';
        
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStageBadge = (stage) => {
        switch (stage) {
            case 'Hot':
                return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-xs font-bold';
            case 'Warm':
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-bold';
            case 'Cold':
                return 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-xs font-bold';
            case 'Frozen':
                return 'bg-gradient-to-r from-slate-400 to-gray-600 text-white shadow-xs font-bold';
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
    };

    const exportToExcel = () => {
        if (!form || responses.length === 0) return;

        const uniqueHeaders = getUniqueHeaders(form.questions);
        const headers = ['Submitted At', 'Respondent', 'Verification', 'Payment Status', 'Stage', ...uniqueHeaders];
        
        for (let i = 0; i < maxRemarks; i++) {
            headers.push(`Remark ${i + 1}`, `Disposition ${i + 1}`);
        }
        
        if (isAdmin) {
            headers.push('GCLID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Term');
        }

        const data = responses.map(r => {
            const row = {
                'Submitted At': new Date(r.createdAt).toLocaleString(),
                'Respondent': r.respondentPhone || r.respondentEmail || 'Anonymous',
                'Verification': r.verificationStatus || 'Not Required',
                'Payment Status': r.paymentStatus || 'Not Required',
                'Stage': r.stage || '-'
            };

            uniqueHeaders.forEach(header => {
                row[header] = getMergedAnswer(r, header, form.questions);
            });

            for (let i = 0; i < maxRemarks; i++) {
                const rem = r.remarks?.[i];
                row[`Remark ${i + 1}`] = rem ? (rem.adminName ? `${rem.text} (By: ${rem.adminName})` : rem.text) : '-';
                row[`Disposition ${i + 1}`] = rem ? rem.disposition : '-';
            }
            
            if (isAdmin) {
                row['GCLID'] = r.trackingData?.gclid || '-';
                row['UTM Source'] = r.trackingData?.utm_source || '-';
                row['UTM Medium'] = r.trackingData?.utm_medium || '-';
                row['UTM Campaign'] = r.trackingData?.utm_campaign || '-';
                row['UTM Term'] = r.trackingData?.utm_term || '-';
            }
            
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Responses");
        XLSX.writeFile(wb, `${form.title || 'Form'}_Responses.xlsx`);
    };

    const copyPublicFormLink = () => {
        const url = form?.slug
            ? `${window.location.origin}/form/${form.slug}`
            : `${window.location.origin}/forms/view/${form?._id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Form link copied to clipboard!');
        }, () => {
            toast.error('Failed to copy link');
        });
    };

    // Filter & Search Logic
    const filteredResponses = useMemo(() => {
        return responses.filter(r => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                String(r.respondentPhone || '').toLowerCase().includes(query) ||
                String(r.respondentEmail || '').toLowerCase().includes(query) ||
                (r.answers && r.answers.some(a => String(a.answer || '').toLowerCase().includes(query))) ||
                (r.remarks && r.remarks.some(rem => 
                    String(rem.text || '').toLowerCase().includes(query) || 
                    String(rem.disposition || '').toLowerCase().includes(query)
                ));

            const latestRemark = r.remarks && r.remarks.length > 0 ? r.remarks[r.remarks.length - 1] : null;
            const matchesStage = !filterStage || (latestRemark && latestRemark.stage === filterStage) || (r.stage === filterStage);
            const matchesDisposition = !filterDisposition || (latestRemark && latestRemark.disposition === filterDisposition);
            const matchesVerification = !filterVerification || r.verificationStatus === filterVerification;
            const matchesPayment = !filterPayment || r.paymentStatus === filterPayment;

            return matchesSearch && matchesStage && matchesDisposition && matchesVerification && matchesPayment;
        });
    }, [responses, searchQuery, filterStage, filterDisposition, filterVerification, filterPayment]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = responses.length;
        const verified = responses.filter(r => r.verificationStatus === 'Verified').length;
        const paid = responses.filter(r => r.paymentStatus === 'Paid').length;
        const hotLeads = responses.filter(r => {
            const latest = r.remarks?.[r.remarks.length - 1];
            return (latest?.stage === 'Hot' || r.stage === 'Hot');
        }).length;
        return { total, verified, paid, hotLeads };
    }, [responses]);

    const hasActiveFilters = searchQuery || filterStage || filterDisposition || filterVerification || filterPayment;
    const resetFilters = () => {
        setSearchQuery('');
        setFilterStage('');
        setFilterDisposition('');
        setFilterVerification('');
        setFilterPayment('');
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredResponses.length / rowsPerPage) || 1;
    const paginatedResponses = filteredResponses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-sans">
                <div className="w-10 h-10 border-4 border-[#FF5B22] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500">Loading Responses Studio...</p>
            </div>
        );
    }

    const uniqueHeaders = getUniqueHeaders(form?.questions);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
            {/* Header Hero Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-3.5">
                        <Link 
                            to="/admin/forms" 
                            className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-[#FF5B22] rounded-2xl text-gray-600 transition border border-gray-100 shrink-0"
                            title="Back to Forms"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                    {form?.title || 'Form Responses'}
                                </h1>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                    form?.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                    {form?.isActive ? 'Active Form' : 'Paused'}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 flex items-center gap-2">
                                <span>{responses.length} total captured response{responses.length === 1 ? '' : 's'}</span>
                                {filteredResponses.length !== responses.length && (
                                    <span className="text-[#FF5B22] font-semibold">
                                        • {filteredResponses.length} filtered
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Top Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition cursor-pointer"
                            title="Refresh Data"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-[#FF5B22]' : ''} />
                        </button>

                        <button
                            onClick={copyPublicFormLink}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 font-bold text-xs transition cursor-pointer"
                            title="Copy Live Form URL"
                        >
                            <Copy size={14} />
                            <span>Copy Link</span>
                        </button>

                        {form?.slug && (
                            <a
                                href={`/form/${form.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 font-bold text-xs transition"
                                title="Open Live Form"
                            >
                                <ExternalLink size={14} />
                                <span>Open Form</span>
                            </a>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => setIsMapModalOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition cursor-pointer"
                            >
                                <Settings2 size={14} />
                                <span>Map Old Data</span>
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={exportToExcel}
                                disabled={responses.length === 0}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                <Download size={14} />
                                <span>Export Excel</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Leads</div>
                        <div className="text-2xl font-black text-gray-900 mt-0.5">{metrics.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5B22] flex items-center justify-center font-bold">
                        <User size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Verified Leads</div>
                        <div className="text-2xl font-black text-emerald-600 mt-0.5">{metrics.verified}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldCheck size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Paid Fee</div>
                        <div className="text-2xl font-black text-blue-600 mt-0.5">{metrics.paid}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <CreditCard size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">High Intent (Hot)</div>
                        <div className="text-2xl font-black text-rose-600 mt-0.5">{metrics.hotLeads}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Flame size={18} />
                    </div>
                </div>
            </div>

            {/* Filter & Column Visibility Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                        <input
                            type="text"
                            placeholder="Search phone, email, answers, remarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] focus:bg-white outline-none text-xs font-medium transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Column Manager Button */}
                    <div className="relative self-end md:self-auto">
                        <button 
                            onClick={() => setShowColMenu(!showColMenu)}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 transition text-xs font-bold cursor-pointer"
                        >
                            <Settings2 size={15} />
                            <span>Columns ({uniqueHeaders.length + 4 - hiddenColumns.length})</span>
                            <ChevronDown size={14} className={`transition-transform ${showColMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showColMenu && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-[110] p-3 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Visible Columns</span>
                                    <button
                                        onClick={() => setHiddenColumns([])}
                                        className="text-[11px] font-bold text-[#FF5B22] hover:underline"
                                    >
                                        Show All
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {[
                                        { id: 'submitted', label: 'Submitted At' },
                                        { id: 'mobile', label: 'Respondent (Phone/Email)' },
                                        { id: 'verify', label: 'Verification Status' },
                                        { id: 'payment', label: 'Payment Status' },
                                        ...uniqueHeaders.map(h => ({ id: `q-${h}`, label: h })),
                                        ...(() => {
                                            const remCols = [];
                                            for(let i=0; i<maxRemarks; i++) {
                                                remCols.push({ id: `rem-${i}`, label: `Remark ${i+1}` });
                                                remCols.push({ id: `disp-${i}`, label: `Disposition ${i+1}` });
                                            }
                                            return remCols;
                                        })(),
                                        ...(isAdmin ? [
                                            { id: 'gclid', label: 'GCLID' },
                                            { id: 'source', label: 'UTM Source' },
                                            { id: 'medium', label: 'UTM Medium' },
                                            { id: 'campaign', label: 'UTM Campaign' }
                                        ] : [])
                                    ].map(col => (
                                        <label key={col.id} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition text-xs text-gray-700">
                                            <input 
                                                type="checkbox" 
                                                checked={isVisible(col.id)}
                                                onChange={() => toggleColumn(col.id)}
                                                className="w-4 h-4 rounded text-[#FF5B22] focus:ring-orange-500 accent-[#FF5B22]"
                                            />
                                            <span className={`truncate ${isVisible(col.id) ? 'font-medium' : 'text-gray-400'}`}>
                                                {col.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Select Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                        <Filter size={12} /> Filter by:
                    </span>

                    <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
                            filterStage ? 'bg-orange-50 text-[#FF5B22] border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <option value="">All Stages</option>
                        <option value="Hot">🔥 Hot</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Cold">❄️ Cold</option>
                        <option value="Frozen">🧊 Frozen</option>
                    </select>

                    <select
                        value={filterDisposition}
                        onChange={(e) => setFilterDisposition(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none transition max-w-[200px] cursor-pointer ${
                            filterDisposition ? 'bg-orange-50 text-[#FF5B22] border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <option value="">All Dispositions</option>
                        {DISPOSITIONS.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <select
                        value={filterVerification}
                        onChange={(e) => setFilterVerification(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
                            filterVerification ? 'bg-orange-50 text-[#FF5B22] border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <option value="">All Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
                            filterPayment ? 'bg-orange-50 text-[#FF5B22] border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <option value="">All Payment</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                            <X size={12} /> Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Submissions Table / Empty State */}
            {responses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#FF5B22] flex items-center justify-center mx-auto">
                        <FileSpreadsheet size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-800">No Responses Captured Yet</h3>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                            Share this form link with your students or embed it on your website to start capturing leads in real-time.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            onClick={copyPublicFormLink}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                        >
                            <Copy size={14} /> Copy Form Link
                        </button>
                        {form?.slug && (
                            <a
                                href={`/form/${form.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                            >
                                <ExternalLink size={14} /> Test Form
                            </a>
                        )}
                    </div>
                </div>
            ) : filteredResponses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-2xs">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                        <Search size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">No Matching Submissions</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        We couldn't find any responses matching your active search terms and filters.
                    </p>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="min-w-full text-left text-xs text-gray-600 bg-white">
                            <thead className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                                    {isVisible('submitted') && <th className="px-4 py-3.5 min-w-[140px]">Submitted At</th>}
                                    {isVisible('mobile') && <th className="px-4 py-3.5 min-w-[190px]">Respondent</th>}
                                    {isVisible('verify') && <th className="px-4 py-3.5 min-w-[120px]">Verification</th>}
                                    {isVisible('payment') && <th className="px-4 py-3.5 min-w-[110px]">Payment</th>}
                                    
                                    {/* Merged Question Headers */}
                                    {uniqueHeaders.map((header, idx) => (
                                        isVisible(`q-${header}`) && (
                                            <th key={idx} className="px-4 py-3.5 min-w-[180px] max-w-xs truncate" title={header}>
                                                {header}
                                            </th>
                                        )
                                    ))}
                                    
                                    {/* Remarks/Dispositions */}
                                    {[...Array(maxRemarks)].map((_, i) => (
                                        isVisible(`rem-${i}`) && (
                                            <React.Fragment key={i}>
                                                <th className="px-4 py-3.5 min-w-[110px] bg-slate-50/80 border-x border-slate-200">Stage {i + 1}</th>
                                                <th className="px-4 py-3.5 min-w-[140px] bg-slate-50/80 border-x border-slate-200">Disposition {i + 1}</th>
                                                <th className="px-4 py-3.5 min-w-[180px] bg-slate-50/80 border-x border-slate-200">Remark {i + 1}</th>
                                            </React.Fragment>
                                        )
                                    ))}

                                    <th className="px-4 py-3.5 min-w-[120px] text-right">Actions</th>

                                    {isAdmin && (
                                        <>
                                            {isVisible('gclid') && <th className="px-4 py-3.5 min-w-[110px]">GCLID</th>}
                                            {isVisible('source') && <th className="px-4 py-3.5 min-w-[110px]">UTM Source</th>}
                                            {isVisible('medium') && <th className="px-4 py-3.5 min-w-[110px]">UTM Medium</th>}
                                            {isVisible('campaign') && <th className="px-4 py-3.5 min-w-[130px]">UTM Campaign</th>}
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {paginatedResponses.map((r, idx) => {
                                    const rowNum = (currentPage - 1) * rowsPerPage + idx + 1;
                                    const latestRemark = r.remarks?.[r.remarks.length - 1];

                                    return (
                                        <tr 
                                            key={r._id} 
                                            onClick={() => handleViewDetailClick(r)}
                                            className="hover:bg-orange-50/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3 text-center text-gray-400 text-[11px] font-mono">
                                                {rowNum}
                                            </td>

                                            {isVisible('submitted') && (
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800">
                                                            {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {isVisible('mobile') && (
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF5B22] flex items-center justify-center font-bold text-xs shrink-0">
                                                            {(r.respondentPhone || r.respondentEmail || 'A').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            {r.respondentPhone ? (
                                                                <span className="font-bold text-gray-900 group-hover:text-[#FF5B22] transition-colors flex items-center gap-1">
                                                                    {r.respondentPhone}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Anonymous</span>
                                                            )}
                                                            {r.respondentEmail && (
                                                                <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                                                    {r.respondentEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {isVisible('verify') && (
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.verificationStatus === 'Verified' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {isVisible('payment') && (
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.paymentStatus === 'Paid' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Paid
                                                        </span>
                                                    ) : r.paymentStatus === 'Failed' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Failed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                            {r.paymentStatus || 'None'}
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Merged Question Answers */}
                                            {uniqueHeaders.map((header, hIdx) => {
                                                const ans = getMergedAnswer(r, header, form?.questions);
                                                return isVisible(`q-${header}`) && (
                                                    <td key={hIdx} className="px-4 py-3 truncate max-w-xs text-gray-700" title={String(ans)}>
                                                        {ans && String(ans).startsWith('http') ? (
                                                            <a
                                                                href={ans}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-md text-[11px]"
                                                            >
                                                                <ExternalLink size={11} /> View File
                                                            </a>
                                                        ) : (
                                                            <span>{ans}</span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {/* Remark / Stage Columns */}
                                            {[...Array(maxRemarks)].map((_, i) => {
                                                const rem = r.remarks?.[i];
                                                return isVisible(`rem-${i}`) && (
                                                    <React.Fragment key={i}>
                                                        <td className="px-4 py-3 border-x border-slate-100">
                                                            {rem?.stage ? (
                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${getStageBadge(rem.stage)}`}>
                                                                    {rem.stage}
                                                                </span>
                                                            ) : <span className="text-gray-300">-</span>}
                                                        </td>
                                                        <td className="px-4 py-3 border-x border-slate-100">
                                                            {rem?.disposition ? (
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDispositionColor(rem.disposition)}`}>
                                                                    {rem.disposition}
                                                                </span>
                                                            ) : <span className="text-gray-300">-</span>}
                                                        </td>
                                                        <td className="px-4 py-3 border-x border-slate-100 max-w-xs truncate">
                                                            {rem ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-800 truncate" title={rem.text}>{rem.text}</span>
                                                                    <span className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                        <Clock size={9} /> {new Date(rem.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            ) : <span className="text-gray-300">-</span>}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}

                                            {/* Row Actions */}
                                            <td className="px-4 py-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {r.respondentPhone && (
                                                        <a
                                                            href={`https://wa.me/${r.respondentPhone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                            title="WhatsApp Respondent"
                                                        >
                                                            <MessageCircle size={15} />
                                                        </a>
                                                    )}
                                                    {r.respondentPhone && (
                                                        <a
                                                            href={`tel:${r.respondentPhone}`}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Call Respondent"
                                                        >
                                                            <PhoneCall size={15} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleAddRemarkClick(r, e)}
                                                        className="p-1.5 text-[#FF5B22] hover:bg-orange-50 rounded-lg transition cursor-pointer"
                                                        title="Add Remark"
                                                    >
                                                        <MessageSquarePlus size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDetailClick(r)}
                                                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                </div>
                                            </td>

                                            {isAdmin && (
                                                <>
                                                    {isVisible('gclid') && <td className="px-4 py-3 whitespace-nowrap text-cyan-600 text-[11px] font-mono">{r.trackingData?.gclid || '-'}</td>}
                                                    {isVisible('source') && <td className="px-4 py-3 whitespace-nowrap text-[11px]">{r.trackingData?.utm_source || '-'}</td>}
                                                    {isVisible('medium') && <td className="px-4 py-3 whitespace-nowrap text-[11px]">{r.trackingData?.utm_medium || '-'}</td>}
                                                    {isVisible('campaign') && <td className="px-4 py-3 whitespace-nowrap text-[11px] truncate max-w-[120px]" title={r.trackingData?.utm_campaign}>{r.trackingData?.utm_campaign || '-'}</td>}
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gray-50/80 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-900">{paginatedResponses.length}</span> of <span className="font-bold text-gray-900">{filteredResponses.length}</span> responses
                        </span>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                                >
                                    Previous
                                </button>
                                
                                <span className="text-xs font-bold text-gray-700 px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interactive Response Details Modal */}
            {isDetailModalOpen && selectedResponse && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gradient-to-r from-orange-50/50 to-amber-50/30">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FF5B22] text-white flex items-center justify-center font-black">
                                        {(selectedResponse.respondentPhone || selectedResponse.respondentEmail || 'L').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">
                                            {selectedResponse.respondentPhone || selectedResponse.respondentEmail || 'Form Submission'}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Submitted on {new Date(selectedResponse.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Quick Action Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                    selectedResponse.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    Verification: {selectedResponse.verificationStatus || 'Pending'}
                                </span>
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                    selectedResponse.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                    Payment: {selectedResponse.paymentStatus || 'None'}
                                </span>
                                {selectedResponse.stage && (
                                    <span className={`px-3 py-1 rounded-xl text-xs ${getStageBadge(selectedResponse.stage)}`}>
                                        Stage: {selectedResponse.stage}
                                    </span>
                                )}
                            </div>

                            {/* Question Responses Card */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <FileSpreadsheet size={14} /> Submitted Form Data
                                </h4>
                                <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 divide-y divide-gray-100 space-y-3">
                                    {uniqueHeaders.map((header, idx) => {
                                        const ans = getMergedAnswer(selectedResponse, header, form?.questions);
                                        return (
                                            <div key={idx} className={idx > 0 ? 'pt-3' : ''}>
                                                <div className="text-[11px] font-bold text-gray-500">{header}</div>
                                                <div className="text-xs font-semibold text-gray-900 mt-0.5">
                                                    {ans && String(ans).startsWith('http') ? (
                                                        <a
                                                            href={ans}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[#FF5B22] hover:underline"
                                                        >
                                                            <ExternalLink size={12} /> View Uploaded File
                                                        </a>
                                                    ) : (
                                                        ans
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tracking & Attribution Data */}
                            {isAdmin && selectedResponse.trackingData && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                        <Sparkles size={14} /> Marketing Attribution
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-50/70 rounded-2xl p-4 border border-gray-100 text-xs">
                                        <div>
                                            <span className="text-gray-400 text-[10px]">Source:</span>
                                            <p className="font-bold text-gray-800">{selectedResponse.trackingData.utm_source || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px]">Campaign:</span>
                                            <p className="font-bold text-gray-800">{selectedResponse.trackingData.utm_campaign || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px]">Medium:</span>
                                            <p className="font-bold text-gray-800">{selectedResponse.trackingData.utm_medium || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-[10px]">GCLID:</span>
                                            <p className="font-bold text-gray-800 truncate" title={selectedResponse.trackingData.gclid}>{selectedResponse.trackingData.gclid || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Remarks & History Timeline */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                        <Clock size={14} /> Remarks & Follow-up History ({selectedResponse.remarks?.length || 0})
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setIsDetailModalOpen(false);
                                            handleAddRemarkClick(selectedResponse);
                                        }}
                                        className="text-xs font-bold text-[#FF5B22] hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={13} /> Add Remark
                                    </button>
                                </div>

                                {selectedResponse.remarks?.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {selectedResponse.remarks.map((rem, i) => (
                                            <div key={i} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {rem.stage && (
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStageBadge(rem.stage)}`}>
                                                                {rem.stage}
                                                            </span>
                                                        )}
                                                        {rem.disposition && (
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDispositionColor(rem.disposition)}`}>
                                                                {rem.disposition}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(rem.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-800 font-medium">{rem.text}</p>
                                                {rem.adminName && (
                                                    <p className="text-[10px] text-gray-400">By: {rem.adminName}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                                        No remarks recorded yet for this respondent.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {selectedResponse.respondentPhone && (
                                    <a
                                        href={`https://wa.me/${selectedResponse.respondentPhone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs transition"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </a>
                                )}
                                {selectedResponse.respondentPhone && (
                                    <a
                                        href={`tel:${selectedResponse.respondentPhone}`}
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition"
                                    >
                                        <PhoneCall size={14} /> Call
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remark Modal */}
            {isRemarkModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5B22]">
                                    <MessageSquarePlus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Add Remark</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedResponse?.respondentPhone || 'Update follow-up note'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsRemarkModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Stage <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] transition text-xs font-semibold"
                                    value={newRemark.stage}
                                    onChange={(e) => setNewRemark({ ...newRemark, stage: e.target.value })}
                                >
                                    <option value="">Select Lead Stage</option>
                                    <option value="Hot">🔥 Hot</option>
                                    <option value="Warm">⚡ Warm</option>
                                    <option value="Cold">❄️ Cold</option>
                                    <option value="Frozen">🧊 Frozen</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Disposition <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] transition text-xs font-semibold"
                                    value={newRemark.disposition}
                                    onChange={(e) => setNewRemark({ ...newRemark, disposition: e.target.value })}
                                >
                                    <option value="">Select Call Disposition</option>
                                    {DISPOSITIONS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Remark Note <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] transition text-xs font-medium h-24"
                                    placeholder="Add detailed counselor discussion notes..."
                                    value={newRemark.text}
                                    onChange={(e) => setNewRemark({ ...newRemark, text: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-2">
                            <button 
                                onClick={() => setIsRemarkModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRemark}
                                disabled={isSubmitting}
                                className="flex-1 bg-[#FF5B22] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#EA580C] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    'Save Remark'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Map Data Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Map Old Data</h3>
                                    <p className="text-xs text-gray-500">Sync responses to CRM Lead fields</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Target CRM Field <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs font-semibold"
                                    value={mapTargetField}
                                    onChange={(e) => setMapTargetField(e.target.value)}
                                >
                                    <option value="studentName">Student Name</option>
                                    <option value="mobileNumber">Mobile Number</option>
                                    <option value="email">Email</option>
                                    <option value="class">Class</option>
                                    <option value="course">Course</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                    Source Form Question <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-xs font-semibold"
                                    value={mapSourceQuestionId}
                                    onChange={(e) => setMapSourceQuestionId(e.target.value)}
                                >
                                    <option value="">Select Question</option>
                                    {form?.questions?.filter(q => q.type !== 'file_upload').map(q => (
                                        <option key={q.id} value={q.id}>{q.questionText}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-2">
                            <button 
                                onClick={() => { setIsMapModalOpen(false); setSyncProgress(null); }}
                                disabled={isMapping}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMapData}
                                disabled={isMapping || !mapSourceQuestionId}
                                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                            >
                                {isMapping ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>
                                            {syncProgress ? `Syncing ${syncProgress.current}/${syncProgress.total}` : 'Syncing...'}
                                        </span>
                                    </>
                                ) : (
                                    'Sync Data'
                                )}
                            </button>
                        </div>
                        
                        {isMapping && syncProgress && (
                            <div className="mt-4">
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
                                        style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-[11px] text-center text-gray-500 font-medium">
                                    {Math.round((syncProgress.current / syncProgress.total) * 100)}% Complete
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
