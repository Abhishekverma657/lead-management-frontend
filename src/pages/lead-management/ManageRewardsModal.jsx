import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { 
    LucideAward, 
    LucideHistory, 
    LucideSend, 
    LucideInfo, 
    LucideCalendar, 
    LucideChevronDown, 
    LucideSparkles,
    LucideCoins,
    LucideCheckCircle2,
    LucideFileText,
    LucidePaperclip
} from "lucide-react";
import { getLeadUserHistory, assignReward } from "../../api/leadApi";
import toast from "react-hot-toast";

export default function ManageRewardsModal({ isOpen, onClose, user, onUpdate }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rewardingLeadId, setRewardingLeadId] = useState(null);
    const [expandedLeadId, setExpandedLeadId] = useState(null);
    const [rewardForm, setRewardForm] = useState({
        points: "",
        status: "",
        remarks: ""
    });

    useEffect(() => {
        if (isOpen && user) {
            fetchHistory();
        }
    }, [isOpen, user]);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const res = await getLeadUserHistory(user._id);
            if (res.success) {
                setHistory(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Failed to load lead history");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignReward = async (leadId) => {
        if (!rewardForm.points || !rewardForm.status) {
            toast.error("Please provide points and status");
            return;
        }

        try {
            const res = await assignReward(user._id, {
                leadId,
                points: Number(rewardForm.points),
                status: rewardForm.status,
                remarks: rewardForm.remarks
            });

            if (res.success) {
                toast.success("Reward points assigned successfully!");
                setRewardingLeadId(null);
                setRewardForm({ points: "", status: "", remarks: "" });
                fetchHistory();
                onUpdate && onUpdate(); 
            }
        } catch (error) {
            console.error("Reward error:", error);
            toast.error(error.response?.data?.message || "Failed to assign reward");
        }
    };

    const REWARDABLE_STATUSES = ["Visit Done", "Registration Done", "Admission Done", "Converted"];

    if (!user) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Manage Rewards: ${user.firstName} ${user.lastName}`} 
            subtitle="View lead history and award incentive milestone points"
            icon={LucideCoins}
            size="2xl"
        >
            <div className="space-y-6">
                
                {/* Header Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-4 rounded-2xl border border-orange-200/70 shadow-2xs">
                        <div className="text-[10px] font-bold text-[#FF5B22] uppercase tracking-wider">Current Points</div>
                        <div className="text-2xl font-black text-orange-700 mt-1">{user.points || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 p-4 rounded-2xl border border-amber-200/70 shadow-2xs">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Assigned Leads</div>
                        <div className="text-2xl font-black text-amber-800 mt-1">{history.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/70 shadow-2xs">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Admissions Converted</div>
                        <div className="text-2xl font-black text-emerald-800 mt-1">
                            {history.filter(h => h.status === "Admission Done" || h.status === "Converted").length}
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <LucideHistory size={14} className="text-[#FF5B22]" />
                            Lead Activity & Milestone Allocation
                        </h3>
                        <span className="text-[11px] text-gray-400">{history.length} total records</span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-xs font-medium">Loading lead history...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div 
                                    key={item._id} 
                                    className={`border rounded-2xl transition-all overflow-hidden ${
                                        expandedLeadId === item._id 
                                            ? 'border-orange-300 ring-2 ring-orange-500/10 bg-white shadow-sm' 
                                            : 'border-gray-200/80 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div 
                                        className="p-3.5 cursor-pointer hover:bg-gray-50/70 flex justify-between items-center transition-colors"
                                        onClick={() => setExpandedLeadId(expandedLeadId === item._id ? null : item._id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5B22] flex items-center justify-center font-bold text-sm shrink-0">
                                                {item.studentName?.charAt(0) || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">{item.studentName || "Unnamed Lead"}</h4>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <LucideCalendar size={11} /> {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                item.status === 'Admission Done' ? 'bg-emerald-100 text-emerald-800' :
                                                item.status === 'Visit Done' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <div className={`text-gray-400 transform transition-transform duration-200 ${expandedLeadId === item._id ? 'rotate-180 text-[#FF5B22]' : ''}`}>
                                                <LucideChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {expandedLeadId === item._id && (
                                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-4 animate-in fade-in duration-150">
                                            {/* Details Grid */}
                                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Mobile</div>
                                                    <div className="font-bold text-gray-800 mt-0.5">{item.mobileNumber || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Class</div>
                                                    <div className="font-bold text-orange-700 mt-0.5">{item.class || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Course</div>
                                                    <div className="font-bold text-purple-700 mt-0.5">{item.inquiryFor || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">City</div>
                                                    <div className="font-bold text-gray-800 mt-0.5">{item.city || "N/A"}</div>
                                                </div>
                                                {item.remarks && (
                                                    <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-200/60">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Remarks</div>
                                                        <div className="text-gray-600 italic mt-0.5">"{item.remarks}"</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Existing Rewards */}
                                            {item.rewards && item.rewards.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Awarded Milestones:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.rewards.map((r, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                                                                <LucideAward size={13} className="text-amber-600" />
                                                                {r.status}: +{r.points} pts
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reward Action Form */}
                                            {rewardingLeadId === item._id ? (
                                                <div className="bg-orange-50/70 p-3.5 rounded-xl border border-orange-200 space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-orange-900 uppercase mb-1">Select Milestone</label>
                                                            <select 
                                                                className="w-full text-xs border border-orange-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-orange-500 bg-white font-medium"
                                                                value={rewardForm.status}
                                                                onChange={(e) => setRewardForm({...rewardForm, status: e.target.value})}
                                                            >
                                                                <option value="">Select Milestone</option>
                                                                {REWARDABLE_STATUSES.map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-orange-900 uppercase mb-1">Points to Award</label>
                                                            <input 
                                                                type="number"
                                                                placeholder="e.g. 100"
                                                                className="w-full text-xs border border-orange-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-orange-500 bg-white font-bold"
                                                                value={rewardForm.points}
                                                                onChange={(e) => setRewardForm({...rewardForm, points: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleAssignReward(item._id)}
                                                            className="flex-1 bg-gradient-to-r from-[#FF5B22] to-amber-600 text-white py-2 rounded-xl font-bold text-xs hover:from-[#EA580C] hover:to-amber-700 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                                        >
                                                            <LucideSend size={13} /> Confirm Points
                                                        </button>
                                                        <button 
                                                            onClick={() => setRewardingLeadId(null)}
                                                            className="px-4 py-2 text-gray-500 font-semibold text-xs hover:bg-white rounded-xl cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setRewardingLeadId(item._id);
                                                        setRewardForm({
                                                            points: item.status === "Admission Done" ? 400 : (item.status === "Registration Done" ? 100 : 50),
                                                            status: item.status,
                                                            remarks: ""
                                                        });
                                                    }}
                                                    className="w-full py-2 bg-gradient-to-r from-[#FF5B22] to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:from-[#EA580C] hover:to-amber-700 shadow-xs transition-all cursor-pointer"
                                                >
                                                    <LucideAward size={14} /> Award Incentive Points for this Lead
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {history.length === 0 && (
                                <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs">
                                    No leads assigned or recorded for this user yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer notice */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-400">
                    <LucideInfo size={13} className="text-[#FF5B22]" />
                    Click any lead card to expand details and allocate reward points.
                </div>
            </div>
        </Modal>
    );
}
