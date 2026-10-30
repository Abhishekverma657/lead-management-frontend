import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Plus, Edit, ExternalLink, Copy, Search, FileText, 
    CheckCircle2, Users, Sparkles, Share2, Layers, BarChart3,
    ArrowUpRight, Clock, Trash2, AlertTriangle, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getForms, deleteForm } from '../../api/formApi';
import { useAppContext } from '../../context/AppContext';

export default function FormsList() {
    const { user } = useAppContext();
    const [forms, setForms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'closed'
    const [loading, setLoading] = useState(true);
    const [formToDelete, setFormToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const canCreateForm = user?.role !== 'SUB_ADMIN' && user?.role !== 'COUNSELOR';

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const data = await getForms();
            if (data.success) {
                setForms(data.data || []);
            } else {
                toast.error('Failed to load forms');
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
            toast.error('Error fetching forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!formToDelete) return;
        try {
            setIsDeleting(true);
            const res = await deleteForm(formToDelete._id);
            if (res.success) {
                toast.success('Form deleted successfully');
                setForms(prev => prev.filter(f => f._id !== formToDelete._id));
                setFormToDelete(null);
            } else {
                toast.error(res.message || 'Failed to delete form');
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            toast.error(error.response?.data?.message || 'Failed to delete form');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (form) => {
        const url = form.slug
            ? `${window.location.origin}/form/${form.slug}`
            : `${window.location.origin}/forms/view/${form._id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Form link copied to clipboard!');
        }, () => {
            toast.error('Failed to copy link');
        });
    };

    const getFormUrl = (form) => {
        return form.slug ? `/form/${form.slug}` : `/forms/view/${form._id}`;
    };

    const totalForms = forms.length;
    const activeForms = forms.filter(f => f.isActive).length;
    const totalResponses = forms.reduce((acc, f) => acc + (f.responseCount || 0), 0);

    const filteredForms = forms.filter(form => {
        const matchesSearch = 
            form.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            form.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            form.slug?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (filterTab === 'active') return form.isActive;
        if (filterTab === 'closed') return !form.isActive;
        return true;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 p-6 sm:p-8 rounded-3xl border border-orange-100 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#FF5B22] text-white shadow-xs">
                            <Layers size={20} />
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Form Studio</h1>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1.5 font-medium">
                        Create high-converting lead capture forms, admission applications & surveys with instant CRM synchronization.
                    </p>
                </div>

                {canCreateForm && (
                    <Link
                        to="/admin/forms/create"
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-2xl transition shadow-md hover:shadow-lg active:scale-98 font-bold text-xs sm:text-sm shrink-0 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Create New Form</span>
                    </Link>
                )}
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Forms</div>
                        <div className="text-2xl font-black text-gray-900 mt-1">{totalForms}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5B22] flex items-center justify-center font-bold">
                        <FileText size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Live Active Forms</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{activeForms}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Captured Leads / Responses</div>
                        <div className="text-2xl font-black text-blue-600 mt-1">{totalResponses}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Users size={20} />
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search & Status Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search forms by title, slug or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5B22] outline-none text-xs font-medium transition shadow-2xs"
                    />
                </div>

                <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/80 self-start sm:self-auto">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            filterTab === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        All ({totalForms})
                    </button>
                    <button
                        onClick={() => setFilterTab('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            filterTab === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Active ({activeForms})
                    </button>
                    <button
                        onClick={() => setFilterTab('closed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            filterTab === 'closed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Paused ({totalForms - activeForms})
                    </button>
                </div>
            </div>

            {/* Content Body */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#FF5B22] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400">Loading forms studio...</p>
                </div>
            ) : filteredForms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-2xs space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#FF5B22] flex items-center justify-center mx-auto">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">No Forms Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        {searchQuery ? 'No forms match your search query.' : 'Create your first lead capture or admission form to start capturing responses.'}
                    </p>
                    {canCreateForm && (
                        <Link
                            to="/admin/forms/create"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5B22] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#EA580C] transition"
                        >
                            <Plus size={14} /> Create Form Now
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForms.map((form) => (
                        <div
                            key={form._id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden"
                        >
                            {/* Card Header Strip */}
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#FF5B22] transition-colors">
                                        {form.title}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                                        form.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                    }`}>
                                        {form.isActive ? 'Active' : 'Paused'}
                                    </span>
                                </div>

                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                    {form.description || 'No description provided for this form.'}
                                </p>

                                {/* Tags & Metadata */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                    <span className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-200">
                                        {form.questions?.length || 0} Questions
                                    </span>
                                    <span className="text-[10px] font-bold bg-orange-50 text-[#FF5B22] px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1">
                                        <Users size={11} /> {form.responseCount || 0} Responses
                                    </span>
                                    {form.slug && (
                                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">
                                            /{form.slug}
                                        </span>
                                    )}
                                    {form.images?.length > 0 && (
                                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-lg border border-purple-100">
                                            📸 {form.images.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Bottom Actions */}
                            <div className="border-t border-gray-100 p-3.5 bg-gray-50/60 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => window.open(getFormUrl(form), '_blank')}
                                        className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#FF5B22] transition px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer"
                                        title="View Public Form"
                                    >
                                        <ExternalLink size={13} /> Public
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(form)}
                                        className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-emerald-600 transition px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer"
                                        title="Copy Link"
                                    >
                                        <Copy size={13} /> Copy
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Link
                                        to={`/admin/forms/responses/${form._id}`}
                                        className="text-xs font-bold text-[#FF5B22] hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                                    >
                                        <BarChart3 size={13} />
                                        <span>Responses</span>
                                    </Link>
                                    <Link
                                        to={`/admin/forms/edit/${form._id}`}
                                        className="p-1.5 text-gray-500 hover:text-[#FF5B22] hover:bg-white rounded-lg transition"
                                        title="Edit Form"
                                    >
                                        <Edit size={15} />
                                    </Link>
                                    {canCreateForm && (
                                        <button
                                            onClick={() => setFormToDelete(form)}
                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                            title="Delete Form"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modern Delete Confirmation Dialog Modal */}
            {formToDelete && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <button
                                onClick={() => !isDeleting && setFormToDelete(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2">
                            <h3 className="text-lg font-black text-gray-900">Delete Form?</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-gray-900">"{formToDelete.title}"</span>?
                            </p>
                            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-800 font-medium">
                                ⚠️ This will permanently remove the form template and all <span className="font-bold">{formToDelete.responseCount || 0} captured response(s)</span>. This action cannot be undone.
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-2">
                            <button
                                type="button"
                                onClick={() => setFormToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Delete Form</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
