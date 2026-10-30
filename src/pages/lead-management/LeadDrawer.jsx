import React, { useState } from 'react';
import { 
    RefreshCw, X, Phone, Mail, MapPin, Calendar, CheckCircle, Clock, Send, 
    CreditCard, MessageSquare, IndianRupee, FileText, Download, PlusCircle, User,
    PhoneCall, Headphones, Radio, Flame, Sparkles, PhoneForwarded, PhoneOff,
    ChevronDown, Zap, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { initiateCallApi, getAudioStreamUrl, syncLeadRecordingApi, getCallStatusApi, hangupCallApi } from '../../api/telephonyApi';
import { logCallApi, updateLead, requestPayment, recordManualPayment, syncPayments } from '../../api/leadApi';

import AudioPlayer from '../../components/AudioPlayer';
import { jsPDF } from 'jspdf';
import { useAppContext } from '../../context/AppContext';

export const STAGE_OPTIONS = ["Hot", "Warm", "Cold", "Frozen"];

export const DISPOSITION_OPTIONS = [
    "Admission Done", "Already Joined UA", "Call Back", "Cut The Call", "Doing Self Study",
    "Duplicate No.", "Fees Issue", "Interested", "Invalid No.", "Joined At Hometown",
    "Joined College", "Joined Online Course", "Joined Other Institute", "Language Issue",
    "No Student Available", "Not Contactable", "Not Interested", "Not Responding",
    "Other Subject", "Registration Done", "Scholarship Issue", "Switch Off",
    "Think & Decide", "Visit Done", "Voice Issue", "Will Come For Free Test",
    "Will Join College", "Will Join Crash Course", "Will Join Next Year", "Will Join Test Series",
    "Will Pay Today", "Will Think After Adv Exam", "Will Think After Mains Exam",
    "Will Think After Neet Exam", "Will Visit", "Will Visit Again", "Will Wait For Result",
    "Won't Join Again", "Wrong No."
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
    const positive = ["Admission Done", "Interested", "Registration Done", "Will Pay Today", "Visit Done", "Will Visit", "Will Visit Again", "Will Come For Free Test"];
    const negative = ["Not Interested", "Not Contactable", "Invalid No.", "Duplicate No.", "Cut The Call", "Switch Off", "Not Responding", "Wrong No.", "Won't Join Again", "Joined Other Institute", "Already Joined UA", "Joined College", "Joined Online Course", "Joined At Hometown", "Language Issue", "No Student Available", "Fees Issue", "Scholarship Issue", "Voice Issue"];
    
    if (positive.includes(disp)) return 'text-emerald-600 bg-emerald-50';
    if (negative.includes(disp)) return 'text-rose-600 bg-rose-50';
    return 'text-amber-600 bg-amber-50';
};

const getVal = (obj, keyName) => {
    if (!obj) return "";
    const key = Object.keys(obj).find(k => k.toLowerCase() === keyName.toLowerCase());
    return key ? obj[key] : "";
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
    if (lead.formResponseId?.disposition) return lead.formResponseId.disposition;
    return getVal(lead.rawFormData, 'disposition');
};

const SearchableSelect = ({ options, value, onChange, placeholder, className }) => {
    const [search, setSearch] = React.useState(value || "");
    const [isOpen, setIsOpen] = React.useState(false);
    const wrapperRef = React.useRef(null);

    React.useEffect(() => {
        setSearch(value || "");
    }, [value]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch(value || ""); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, value]);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className={className}
            />
            {isOpen && (
                <div className="absolute bottom-[calc(100%+4px)] left-0 z-[100] w-[200px] bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto transform transition-all origin-bottom-left">
                    {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                        <div 
                            key={opt}
                            className="px-3 py-2 text-[11px] font-medium hover:bg-orange-50 cursor-pointer text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => {
                                onChange(opt);
                                setSearch(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    )) : (
                        <div className="px-3 py-2 text-[11px] text-gray-400">No options found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function LeadDrawer({ isOpen, onClose, lead, onLeadUpdated, staffList = [], leadUsersList = [] }) {
    const { user } = useAppContext();
    const drawerRef = React.useRef(null);
    
    const [currentLead, setCurrentLead] = useState(lead);
    
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(user?.role);
    const isFrozen = getStage(currentLead) === "Frozen";
    
    React.useEffect(() => {
        if (lead) {
            setCurrentLead(lead);
            setCallStage(lead.stage || getStage(lead) || "Warm");
            setCallDisposition(lead.disposition || getDisposition(lead) || "Interested");
            setCallStatus("");
            setCallDuration(0);

            // Auto-fetch latest Airtel IQ Inbound & Outbound recordings for this lead
            if (isOpen && lead._id && lead.mobileNumber && !lead.mobileNumber.startsWith("Form-")) {
                syncLeadRecordingApi(lead._id, {})
                    .then(res => {
                        if (res?.success && res.data) {
                            setCurrentLead(res.data);
                        }
                    })
                    .catch(() => {});
            }
        }
    }, [lead, isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                // Ignore clicks on table rows to allow immediate viewing of another lead
                if (event.target.closest('.lead-row')) return;
                // Also ignore clicks on toast notifications
                if (event.target.closest('.go3958317564')) return; 
                if (event.target.closest('[role="status"]')) return;
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const [noteText, setNoteText] = useState("");
    const [amount, setAmount] = useState("");
    const [onlinePaymentType, setOnlinePaymentType] = useState("Full");
    
    const [showPayment, setShowPayment] = useState(false);
    const [loadingReceipt, setLoadingReceipt] = useState(false);

    // Accordion states
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showManualPayment, setShowManualPayment] = useState(false);
    const [showActions, setShowActions] = useState(false);
    
    const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
    const [pendingDisposition, setPendingDisposition] = useState(null);
    const [followUpDate, setFollowUpDate] = useState("");

    const [totalFee, setTotalFee] = useState(lead?.totalCourseFee || "");
    const [manualAmount, setManualAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [manualPaymentType, setManualPaymentType] = useState("Full");
    
    React.useEffect(() => {
        if (currentLead) setTotalFee(currentLead.totalCourseFee || "");
    }, [currentLead]);
    
    // Auto calculate full amount
    React.useEffect(() => {
        if (manualPaymentType === "Full" && showManualPayment) {
            const fee = Number(totalFee) || 0;
            const paid = currentLead?.totalAmountPaid || 0;
            setManualAmount(Math.max(fee - paid, 0));
        }
    }, [manualPaymentType, totalFee, showManualPayment, currentLead]);

    React.useEffect(() => {
        if (onlinePaymentType === "Full" && showPayment) {
            const fee = Number(totalFee) || 0;
            const paid = currentLead?.totalAmountPaid || 0;
            setAmount(Math.max(fee - paid, 0));
        }
    }, [onlinePaymentType, totalFee, showPayment, currentLead]);

    const [manualRemarks, setManualRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tabs and Floating Bottom Action Sheet states
    const [activeTab, setActiveTab] = useState("timeline"); // "timeline" | "calls"
    const [showActionPanel, setShowActionPanel] = useState(false);

    // Caller & Call Logging State (Airtel IQ Ready)
    const [showCallLogger, setShowCallLogger] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState("");
    const [syncedAudioUrl, setSyncedAudioUrl] = useState(null);
    const [callDisposition, setCallDisposition] = useState("");
    const [callStage, setCallStage] = useState("");
    const [callNotes, setCallNotes] = useState("");
    const [callFollowUpDate, setCallFollowUpDate] = useState("");
    const [isDialingAirtel, setIsDialingAirtel] = useState(false);
    const [airtelCallFeedback, setAirtelCallFeedback] = useState(null);
    const [isSyncingRecording, setIsSyncingRecording] = useState(false);
    const [activeAirtelCallId, setActiveAirtelCallId] = useState(null);
    const [editingCallLogId, setEditingCallLogId] = useState(null);
    const [isAirtelCallActive, setIsAirtelCallActive] = useState(false);
    const pollIntervalRef = React.useRef(null);
    const callStartTimeRef = React.useRef(null);

    // Active Call Live Phase: "IDLE" | "DIALING" | "RINGING" | "IN_CALL" | "ENDED"
    const [callLivePhase, setCallLivePhase] = useState("IDLE");

    // Polling PBX live status during call
    const startCallStatusPolling = (leadId, callId) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        let attempts = 0;
        let consecutiveEndOrErrors = 0;
        const maxAttempts = 180; // Poll up to 6 minutes

        pollIntervalRef.current = setInterval(async () => {
            attempts += 1;
            try {
                if (callId) {
                    const statusRes = await getCallStatusApi(callId);
                    if (statusRes?.success) {
                        if (statusRes.state === "ENDED") {
                            // Call ended on PBX (customer or agent cut the call)
                            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                            await handleSyncRecording(callId, callStartTimeRef.current);
                            return;
                        } else {
                            consecutiveEndOrErrors = 0;
                        }
                    } else {
                        consecutiveEndOrErrors += 1;
                        if (consecutiveEndOrErrors >= 2) {
                            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                            await handleSyncRecording(callId, callStartTimeRef.current);
                            return;
                        }
                    }
                } else {
                    // If no callId returned, check if CDR log arrived after short delay
                    if (attempts >= 3 && attempts % 2 === 0) {
                        try {
                            const checkRes = await syncLeadRecordingApi(leadId, {
                                minTimestamp: callStartTimeRef.current
                            });
                            if (checkRes?.success && (checkRes.duration > 0 || checkRes.audioUrl)) {
                                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                await handleSyncRecording(callId, callStartTimeRef.current);
                                return;
                            }
                        } catch (e) {}
                    }
                }

                if (attempts >= maxAttempts) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setIsAirtelCallActive(false);
                    setCallLivePhase("IDLE");
                }
            } catch (pollErr) {
                console.warn("Call status poll warning:", pollErr.message);
                consecutiveEndOrErrors += 1;
                // If PBX returns 404 or connection closed, call is finished
                if (consecutiveEndOrErrors >= 2 || attempts >= maxAttempts) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    await handleSyncRecording(callId, callStartTimeRef.current);
                    return;
                }
            }
        }, 1500);
    };

    React.useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    const handleAirtelClickToCall = async () => {
        if (!user?.agentExtension) {
            return toast.error("No Extension configured for your account.");
        }
        if (!currentLead?.mobileNumber || currentLead.mobileNumber.startsWith("Form-")) {
            return toast.error("Valid customer mobile number required to call");
        }
        setIsDialingAirtel(true);
        setCallLivePhase("IN_CALL");
        setSyncedAudioUrl(null); // Clear previous recording audio from active session
        setCallDuration(0);
        setCallStatus("");
        callStartTimeRef.current = Date.now();

        try {
            const res = await initiateCallApi({
                leadId: currentLead._id,
                toPhoneNumber: currentLead.mobileNumber,
                fromExtension: user?.agentExtension
            });

            if (res.success) {
                toast.success("Ringing your extension! Please answer.");
                const callId = res.callId || "";
                setActiveAirtelCallId(callId);
                setIsAirtelCallActive(true);
                setShowActionPanel(true);
                setShowCallLogger(true);
                setCallLivePhase("IN_CALL");
                setCallStatus("Connected");

                setAirtelCallFeedback({
                    status: "connected",
                    message: "📞 Airtel IQ PBX Call in Progress (Ext ➔ Customer)"
                });

                // Start automatic live status polling
                startCallStatusPolling(currentLead._id, callId);
                onLeadUpdated();
            }
        } catch (error) {
            console.error("Click-to-Call error:", error);
            const err = error.response?.data?.message || "Failed to trigger Click-to-Call. Check extension configuration in Staff settings.";
            toast.error(err);
            setAirtelCallFeedback(null);
            setIsAirtelCallActive(false);
            setCallLivePhase("IDLE");
        } finally {
            setIsDialingAirtel(false);
        }
    };

    const handleSyncRecording = async (targetCallId, minTime) => {
        if (!currentLead?._id) return;
        setIsSyncingRecording(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        const callIdToSync = (typeof targetCallId === "string" ? targetCallId : activeAirtelCallId) || "";
        const timeToSync = (typeof minTime === "number" || typeof minTime === "string") ? minTime : callStartTimeRef.current;

        // 1. Terminate active HUD immediately in UI
        setIsAirtelCallActive(false);
        setCallLivePhase("ENDED");

        // 2. Send hangup signal to PBX if call active
        if (callIdToSync) {
            try {
                await hangupCallApi(callIdToSync);
            } catch (hErr) {
                // Ignore if already ended
            }
        }

        // 3. Helper function to perform CDR and Recording sync from Airtel IQ
        const performSync = async (isRetry = false) => {
            try {
                const res = await syncLeadRecordingApi(currentLead._id, {
                    callId: callIdToSync,
                    minTimestamp: timeToSync
                });

                if (res.success) {
                    if (!isRetry) toast.success(res.message || "Airtel IQ call data & audio synced!");
                    const apiDuration = (res.duration !== undefined && Number(res.duration) >= 0) ? Number(res.duration) : 0;
                    setCallDuration(apiDuration);
                    setCallStatus(res.callStatus || "Connected");
                    if (res.audioUrl) {
                        setSyncedAudioUrl(res.audioUrl);
                    }
                    if (res.data) {
                        setCurrentLead(res.data);
                    }
                    setAirtelCallFeedback({
                        status: "connected",
                        message: `✅ Call Completed! Talk time: ${apiDuration}s (from Airtel IQ API)`
                    });
                    onLeadUpdated();
                    return true;
                }
            } catch (syncErr) {
                console.warn("CDR sync attempt warning:", syncErr.message);
            }
            return false;
        };

        try {
            const synced = await performSync(false);
            if (!synced) {
                setCallStatus("Connected");
                setAirtelCallFeedback({
                    status: "connected",
                    message: "✅ Call Ended. Fetching talk time & audio from Airtel IQ..."
                });

                // Auto-retry at 3s and 7s to catch Airtel IQ CDR once processed
                setTimeout(() => performSync(true), 3000);
                setTimeout(() => performSync(true), 7000);
            }
        } catch (err) {
            console.error("Sync recording error:", err);
            setCallStatus("Connected");
        } finally {
            setIsSyncingRecording(false);
        }
    };


    const handleLogCall = async () => {
        setIsSubmitting(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setIsAirtelCallActive(false);
        const selectedStage = callStage || currentLead.stage || getStage(currentLead) || "Warm";
        const selectedDisposition = callDisposition || currentLead.disposition || getDisposition(currentLead) || "Interested";
        const isCallPlaced = Boolean(editingCallLogId) || Boolean(activeAirtelCallId) || Boolean(syncedAudioUrl) || (Number(callDuration) > 0) || ["Busy", "Failed", "No Answer", "Not Reachable", "Missed"].includes(callStatus);
        
        try {
            const res = await logCallApi(currentLead._id, {
                callLogId: editingCallLogId || undefined,
                duration: Number(callDuration) || 0,
                status: callStatus || (Number(callDuration) > 0 ? "Connected" : ""),
                disposition: selectedDisposition,
                stage: selectedStage,
                notes: callNotes,
                airtelCallId: activeAirtelCallId || undefined,
                recordingUrl: syncedAudioUrl || undefined,
                nextFollowUpDate: callFollowUpDate || undefined,
                isActualCall: isCallPlaced
            });

            if (editingCallLogId) {
                toast.success("Call record & notes updated!");
            } else if (isCallPlaced) {
                toast.success("Call outcome logged & lead updated!");
            } else {
                toast.success("Lead remarks & details updated!");
            }

            if (res.data) {
                setCurrentLead(res.data);
            }
            setShowCallLogger(false);
            setEditingCallLogId(null);
            setCallNotes("");
            setCallFollowUpDate("");
            setAirtelCallFeedback(null);
            onLeadUpdated();
        } catch (error) {
            console.error("Log Call Error:", error);
            toast.error(error.response?.data?.message || "Failed to update lead");
        } finally {
            setIsSubmitting(false);
        }
    };




    if (!isOpen || !currentLead) return null;

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await updateLead(currentLead._id, { remarks: noteText });
            toast.success("Note added successfully!");
            if (res && res.data) {
                setCurrentLead(res.data);
            }
            setNoteText("");
            onLeadUpdated();
        } catch (error) {
            toast.error("Failed to add note.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestPayment = async () => {
        if (!amount || amount <= 0) return toast.error("Enter a valid amount");
        setIsSubmitting(true);
        try {
            await requestPayment({ 
                leadId: currentLead._id, 
                amount: Number(amount), 
                paymentType: onlinePaymentType,
                totalCourseFee: Number(totalFee)
            });
            toast.success("Payment link sent via SMS!");
            
            // Optimistic UI update
            const newActivity = {
                action: "Payment Requested",
                description: `Payment link of ₹${amount} created.`,
                timestamp: new Date().toISOString(),
                performedByName: user?.name || "System"
            };
            setCurrentLead(prev => ({ ...prev, activities: [...(prev.activities || []), newActivity] }));
            
            setShowPayment(false);
            setAmount("");
            onLeadUpdated();
        } catch (error) {
            toast.error("Failed to send payment link.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualPayment = async () => {
        if (!manualAmount || manualAmount <= 0) return toast.error("Enter a valid amount");
        setIsSubmitting(true);
        try {
            const res = await recordManualPayment({
                leadId: currentLead._id,
                amount: Number(manualAmount),
                paymentMode,
                paymentType: manualPaymentType,
                totalCourseFee: Number(totalFee),
                remarks: manualRemarks
            });
            toast.success("Payment recorded successfully!");
            
            // Real-time UI update
            if (res && res.lead) {
                setCurrentLead(res.lead);
            }
            
            setShowManualPayment(false);
            setManualAmount("");
            setManualRemarks("");
            setPaymentMode("Cash");
            onLeadUpdated();
        } catch (error) {
            toast.error("Failed to record payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSyncPayments = async () => {
        setIsSubmitting(true);
        try {
            const res = await syncPayments(currentLead._id);
            if (res.syncedCount > 0) {
                toast.success(`Successfully synced ${res.syncedCount} payment(s)!`);
                setCurrentLead(res.lead);
                onLeadUpdated();
            } else {
                toast.success("All payments are up to date.");
            }
        } catch (error) {
            toast.error("Failed to sync payments.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateInvoice = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(33, 150, 243);
        doc.text("FEE RECEIPT / INVOICE", 105, 20, null, null, "center");
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 190, 30, null, null, "right");
        
        doc.setLineWidth(0.5);
        doc.line(15, 35, 195, 35);
        
        // Student Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Student Details:", 15, 45);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${currentLead.studentName || currentLead.firstName}`, 15, 55);
        const displayMobile = currentLead.mobileNumber?.startsWith("Form-") ? "No Mobile" : (currentLead.mobileNumber || "N/A");
        doc.text(`Mobile: ${displayMobile}`, 15, 65);
        doc.text(`Course: ${currentLead.course || 'N/A'}`, 15, 75);
        doc.text(`Class: ${currentLead.class || 'N/A'}`, 15, 85);
        
        // Payment Info
        doc.setFont("helvetica", "bold");
        doc.text("Payment Summary:", 120, 45);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Total Course Fee: Rs. ${currentLead.totalCourseFee || 0}`, 120, 55);
        doc.text(`Amount Paid: Rs. ${currentLead.totalAmountPaid || 0}`, 120, 65);
        doc.text(`Balance: Rs. ${currentLead.remainingFee || 0}`, 120, 75);
        
        // Transaction History
        let yPos = 105;
        const payments = currentLead.activities?.filter(a => a.action === "Payment Received") || [];
        if (payments.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Transaction History:", 15, yPos);
            yPos += 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            
            payments.forEach(p => {
                // Extract Txn ID if present
                const txnMatch = p.description.match(/Txn ID: ([A-Za-z0-9_]+)/);
                const txnId = txnMatch ? txnMatch[1] : "N/A";
                
                const amountMatch = p.description.match(/Payment of ₹([0-9.]+)/);
                const amt = amountMatch ? amountMatch[1] : "N/A";
                
                const date = new Date(p.timestamp).toLocaleDateString();
                
                doc.text(`Date: ${date} | Txn ID: ${txnId} | Amount: Rs. ${amt}`, 15, yPos);
                yPos += 7;
            });
        } else {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.text("No payments recorded yet.", 15, yPos);
            yPos += 7;
        }
        
        doc.setLineWidth(0.5);
        doc.line(15, yPos + 5, 195, yPos + 5);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("This is a computer generated receipt and does not require a physical signature.", 105, 280, null, null, "center");
        
        doc.save(`${currentLead.firstName}_Receipt.pdf`);
        toast.success("Invoice downloaded!");
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const res = await updateLead(currentLead._id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            if (res && res.data) {
                setCurrentLead(res.data);
            }
            onLeadUpdated();
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const getStatusForDisposition = (disp) => {
        if (!disp) return "New";
        const closed = [
            "Won't Join Again", "Wrong No.", "Already Joined UA", "Doing Self Study",
            "Duplicate No.", "Invalid No.", "Joined At Hometown", "Joined College", 
            "Joined Online Course", "Joined Other Institute", "Language Issue", 
            "No Student Available", "Not Interested", "Other Subject"
        ];
        const followUp = [
            "Call Back", "Cut The Call", "Fees Issue", "Interested", "Not Contactable", 
            "Not Responding", "Scholarship Issue", "Switch Off", "Think & Decide", 
            "Visit Done", "Voice Issue", "Will Come For Free Test", "Will Join Crash Course", 
            "Will Join Test Series", "Will Pay Today", "Will Think After Adv Exam", 
            "Will Think After Mains Exam", "Will Think After Neet Exam", "Will Visit", 
            "Will Visit Again", "Will Wait For Result"
        ];
        if (closed.includes(disp)) return "Closed";
        if (followUp.includes(disp)) return "Follow Up";
        if (disp === "Admission Done" || disp === "Registration Done") return "Converted";
        return "In Process";
    };

    const handleDispositionSelect = (val) => {
        setPendingDisposition(val);
        setShowFollowUpPicker(true);
    };

    const confirmDispositionWithFollowUp = async () => {
        try {
            const updates = { disposition: pendingDisposition };
            if (followUpDate) {
                updates.nextFollowUpDate = followUpDate;
            }
            const newStatus = getStatusForDisposition(pendingDisposition);
            if (newStatus) {
                updates.status = newStatus;
            }
            
            const res = await updateLead(currentLead._id, updates);
            if (res && res.data) {
                setCurrentLead(res.data);
                toast.success('Disposition updated');
                onLeadUpdated();
            }
            setShowFollowUpPicker(false);
            setPendingDisposition(null);
            setFollowUpDate("");
        } catch (error) {
            toast.error('Failed to update disposition');
        }
    };

    const handleInlineUpdate = async (field, value) => {
        try {
            const updates = { [field]: value };
            if (field === 'disposition') {
                const newStatus = getStatusForDisposition(value);
                if (newStatus) {
                    updates.status = newStatus;
                }
            }
            const res = await updateLead(currentLead._id, updates);
            if (res && res.data) {
                setCurrentLead(res.data);
                toast.success(`${field} updated`);
                onLeadUpdated();
            }
        } catch (error) {
            toast.error(`Failed to update ${field}`);
        }
    };

    const handleAssignmentUpdate = async (value) => {
        if (!value) return;
        try {
            let updates = {};
            let newName = "";
            if (value.startsWith('leaduser_')) {
                const newId = value.replace('leaduser_', '');
                const u = leadUsersList.find(u => u._id === newId);
                updates = { assignedToLeadUser: newId, assignedTo: null, assignedToName: `${u?.firstName} ${u?.lastName}` };
            } else {
                const newId = value;
                const staff = staffList.find(s => s._id === newId);
                updates = { assignedTo: newId, assignedToLeadUser: null, assignedToName: staff?.name };
            }
            const res = await updateLead(currentLead._id, updates);
            if (res && res.data) {
                setCurrentLead(res.data);
                toast.success("Assignment updated");
                onLeadUpdated();
            }
        } catch (error) {
            toast.error("Failed to update assignment");
        }
    };

    const statusOptions = [
        "New", "In Process", "Follow Up", "Converted", "Closed",
        "Visit Done", "CNR", "Not Interested", "Interested",
        "Will Think", "Call Me Later", "Already Admitted Elsewhere",
        "Admission Done", "Registration Done"
    ];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            {/* No Backdrop Blocking to allow background interaction */}
            <div className="absolute inset-0 pointer-events-none" />

            <div ref={drawerRef} className="relative w-full max-w-[560px] h-full bg-white shadow-2xl flex flex-col transform transition-all duration-300 ease-out translate-x-0 pointer-events-auto border-l border-gray-100">

                {/* ── Premium Header ── */}
                <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 px-6 py-5 flex items-start justify-between shrink-0 z-10 shadow-md">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                            <span className="text-white font-bold text-sm">
                                {(currentLead.firstName || currentLead.studentName || "?")[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-white leading-tight truncate flex items-center gap-2">
                                <span>{currentLead.firstName} {currentLead.lastName || ""}</span>
                                {currentLead.leadNo && (
                                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white shadow-sm border border-white/10 shrink-0">
                                        #{String(currentLead.leadNo).padStart(4, '0')}
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 ${
                                        currentLead.status === 'Admission Done' ? 'bg-emerald-500/20 text-emerald-300' :
                                        currentLead.status === 'New' ? 'bg-orange-500/20 text-orange-300' :
                                        currentLead.status === 'Closed' || currentLead.status === 'Not Interested' ? 'bg-red-500/20 text-red-300' :
                                        'bg-amber-500/20 text-amber-300'
                                    }`}
                                >
                                    {currentLead.status || "New"}
                                </span>
                                
                                {getStage(currentLead) && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/90 ${getStageColor(getStage(currentLead)).split(' ')[0]}`}>
                                        {getStage(currentLead)}
                                    </span>
                                )}

                                {getDisposition(currentLead) && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/90 max-w-[120px] truncate">
                                        {getDisposition(currentLead)}
                                    </span>
                                )}

                                <span className="text-slate-400 text-[10px] ml-1 truncate max-w-[80px]">{currentLead.source || "Manual"}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 shadow-sm border border-white/10 relative z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Scrollable Content ── */}
                <div className={`flex-1 overflow-y-auto bg-gray-50/50 transition-all ${showActionPanel ? 'pb-[320px]' : 'pb-24'}`}>

                {/* ── Quick Info Strip ── */}
                <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-200">
                    <div className="bg-white px-5 py-3 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Mobile</p>
                            <p className="text-xs font-semibold text-gray-800 truncate">
                                {currentLead.mobileNumber?.startsWith("Form-") ? "No Mobile" : (currentLead.mobileNumber || "—")}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Email</p>
                            <p className="text-xs font-semibold text-gray-800 truncate">{currentLead.email || "—"}</p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Class / Course</p>
                            <p className="text-xs font-semibold text-gray-800 truncate">
                                {currentLead.class || "—"} {currentLead.course ? `/ ${currentLead.course}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">City</p>
                            <p className="text-xs font-semibold text-gray-800 truncate">{currentLead.city || "—"}</p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 flex items-center gap-2.5 col-span-2">
                        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div className="min-w-0 w-full pr-2">
                            <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Assigned To</p>
                            {isAdmin ? (
                                <select
                                    value={currentLead.assignedTo?._id || currentLead.assignedTo || ""}
                                    onChange={(e) => handleAssignmentUpdate(e.target.value)}
                                    className="text-xs font-semibold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-orange-500 w-full cursor-pointer pb-0.5"
                                >
                                    <option value="" disabled>Unassigned</option>
                                    {staffList.map(staff => (
                                        <option key={staff._id} value={staff._id}>{staff.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    {currentLead.assignedTo ? (currentLead.assignedTo.name || "Counselor") : (currentLead.assignedToLeadUser ? `${currentLead.assignedToLeadUser.firstName || ''} ${currentLead.assignedToLeadUser.lastName || ''}` : "Unassigned")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                    <div className="mx-5 mt-5">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setShowMoreDetails(!showMoreDetails)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-orange-500" /> Additional Info
                                </span>
                                <span className={`text-gray-400 text-xs transition-transform duration-200 ${showMoreDetails ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {showMoreDetails && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                                    {currentLead.rawFormData && Object.keys(currentLead.rawFormData).length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            {Object.entries(currentLead.rawFormData).map(([key, value]) => (
                                                <div key={key} className="col-span-2 border-b border-gray-50 pb-2 last:border-0">
                                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{key.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs font-semibold text-gray-700">{value || "—"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            {[
                                                { label: 'Parent Name', value: currentLead.parentName },
                                                { label: 'Parent Mobile', value: currentLead.parentMobile },
                                                { label: 'Source', value: currentLead.source },
                                                { label: 'Created At', value: currentLead.createdAt ? new Date(currentLead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                                                    <p className="text-xs font-semibold text-gray-700">{value || "—"}</p>
                                                </div>
                                            ))}
                                            {currentLead.address && (
                                                <div className="col-span-2">
                                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Address</p>
                                                    <p className="text-xs font-semibold text-gray-700">{currentLead.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="mx-5 mt-5">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                                    <IndianRupee className="w-3.5 h-3.5" /> Financials
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={handleSyncPayments} 
                                        disabled={isSubmitting}
                                        className="text-[10px] flex items-center gap-1 bg-white/15 text-white px-2 py-1 rounded-lg hover:bg-white/25 transition disabled:opacity-50 border border-white/20"
                                    >
                                        <RefreshCw className={`w-2.5 h-2.5 ${isSubmitting ? 'animate-spin' : ''}`} /> Sync
                                    </button>
                                    <button onClick={generateInvoice} className="text-[10px] flex items-center gap-1 bg-white/15 text-white px-2 py-1 rounded-lg hover:bg-white/25 transition border border-white/20">
                                        <Download className="w-2.5 h-2.5" /> Receipt
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/15 backdrop-blur rounded-lg p-2.5 text-center border border-white/20">
                                    <p className="text-[9px] text-white/70 uppercase tracking-wide mb-0.5">Total Fee</p>
                                    <p className="text-sm font-bold text-white">₹{currentLead.totalCourseFee || 0}</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur rounded-lg p-2.5 text-center border border-white/20">
                                    <p className="text-[9px] text-white/70 uppercase tracking-wide mb-0.5">Paid</p>
                                    <p className="text-sm font-bold text-white">₹{currentLead.totalAmountPaid || 0}</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur rounded-lg p-2.5 text-center border border-white/20">
                                    <p className="text-[9px] text-white/70 uppercase tracking-wide mb-0.5">Balance</p>
                                    <p className="text-sm font-bold text-white">₹{currentLead.remainingFee || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* ── Tabs Navigation: Activity Timeline vs Call Recordings ── */}
                    <div className="mx-5 mt-5">
                        <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 gap-1 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setActiveTab("timeline")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "timeline"
                                        ? "bg-white text-[#FF5B22] shadow-xs border border-gray-200/80"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                <span>Activity Timeline</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                    activeTab === "timeline" ? "bg-orange-50 text-[#FF5B22]" : "bg-gray-200 text-gray-600"
                                }`}>
                                    {((currentLead.activities?.length || 0) + (currentLead.formResponseId?.remarks?.length || 0))}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("calls")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "calls"
                                        ? "bg-white text-[#FF5B22] shadow-xs border border-gray-200/80"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                                }`}
                            >
                                <Headphones className="w-3.5 h-3.5 text-orange-500" />
                                <span>Call Recordings</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                    activeTab === "calls" ? "bg-orange-50 text-[#FF5B22]" : "bg-gray-200 text-gray-600"
                                }`}>
                                    {currentLead.callLogs?.length || 0}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Tab 1: Activity Timeline & Remarks */}
                    {activeTab === "timeline" && (
                        <div className="mx-5 mt-4 mb-5 animate-fade-in">
                            <div className="w-full flex items-center justify-between px-1 mb-3">
                                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2 m-0">
                                    <Clock className="w-4 h-4 text-orange-500" /> Activity Timeline &amp; Remarks
                                </h3>
                            </div>
                            
                            <div className="mt-2">
                                {((!currentLead.activities || currentLead.activities.length === 0) && (!currentLead.formResponseId?.remarks || currentLead.formResponseId.remarks.length === 0)) ? (
                                    <div className="bg-white rounded-xl border border-gray-100 py-8 text-center shadow-xs">
                                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 font-medium">No activities or remarks yet</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Vertical line */}
                                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gradient-to-b from-orange-200 via-gray-200 to-transparent" />
                                        <div className="space-y-2">
                                            {(() => {
                                                let allActivities = currentLead.activities ? [...currentLead.activities] : [];
                                                if (currentLead.formResponseId?.remarks?.length > 0) {
                                                    const formRemarks = currentLead.formResponseId.remarks.map(r => ({
                                                        action: "Form Remark Added",
                                                        description: `Stage: ${r.stage || 'N/A'} | Disposition: ${r.disposition || 'N/A'}\nNote: ${r.text}`,
                                                        performedByName: r.adminName || 'System',
                                                        timestamp: r.createdAt || currentLead.createdAt
                                                    }));
                                                    allActivities = [...allActivities, ...formRemarks];
                                                }
                                                return allActivities
                                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                                    .map((activity, idx) => (
                                                <div key={idx} className="relative flex gap-3 items-start pl-1">
                                                    {/* Dot */}
                                                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white mt-0.5 ${
                                                        activity.action.includes('Inbound') ? 'bg-purple-600' :
                                                        activity.action.includes('Outbound') || activity.action.includes('Call') ? 'bg-[#FF5B22]' :
                                                        activity.action.includes('Payment') ? 'bg-emerald-500' :
                                                        activity.action.includes('Status') ? 'bg-amber-500' :
                                                        'bg-slate-400'
                                                    }`}>
                                                        {activity.action.includes('Inbound') || activity.action.includes('Outbound') || activity.action.includes('Call')
                                                            ? <PhoneCall className="w-2.5 h-2.5 text-white" />
                                                            : activity.action.includes('Payment') 
                                                            ? <IndianRupee className="w-2.5 h-2.5 text-white" /> 
                                                            : activity.action.includes('Status')
                                                            ? <CheckCircle className="w-2.5 h-2.5 text-white" />
                                                            : <MessageSquare className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    {/* Card */}
                                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                            <span className="text-xs font-semibold text-gray-800 truncate">{activity.action}</span>
                                                            <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                                                {new Date(activity.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-line">
                                                            {activity.description ? activity.description.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                                                part.startsWith('**') && part.endsWith('**') 
                                                                    ? <strong key={i} className="font-bold text-gray-800 bg-gray-100 px-1 py-0.5 rounded mx-0.5">{part.slice(2, -2)}</strong> 
                                                                    : part
                                                            ) : ""}
                                                        </p>

                                                        <p className="text-[10px] text-gray-400 mt-1">— {activity.performedByName || 'System'}</p>
                                                    </div>
                                                </div>
                                            ))})()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Dedicated Call Recordings & History Section */}
                    {activeTab === "calls" && (
                        <div className="mx-5 mt-4 mb-5 animate-fade-in">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Headphones className="w-3.5 h-3.5 text-orange-600" />
                                    Past Call History &amp; Recordings ({currentLead.callLogs?.length || 0})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => handleSyncRecording()}
                                    disabled={isSyncingRecording}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isSyncingRecording ? 'animate-spin text-orange-600' : 'text-orange-600'}`} />
                                    <span>{isSyncingRecording ? 'Syncing...' : '🔄 Sync Calls'}</span>
                                </button>
                            </div>

                            {!currentLead.callLogs || currentLead.callLogs.length === 0 ? (
                                <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-2 shadow-xs">
                                    <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-xs font-semibold text-slate-600">No call recordings found yet</p>
                                    <p className="text-[11px] text-slate-400">Calls made or received via Airtel IQ will appear here with playable recordings.</p>
                                    <button
                                        type="button"
                                        onClick={() => handleSyncRecording()}
                                        disabled={isSyncingRecording}
                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 border border-orange-200 cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isSyncingRecording ? 'animate-spin' : ''}`} />
                                        <span>Check Airtel IQ for recent calls</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {currentLead.callLogs.slice().reverse().map((call, cIdx) => {
                                        const callAudio = call.recordingUrl || (call.airtelCallId ? getAudioStreamUrl(call.airtelCallId) : null);
                                        const durSec = call.duration || 0;
                                        const isConn = call.status === "Connected" || durSec > 0;

                                        return (
                                            <div key={cIdx} className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-orange-300 transition-all space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {/* Inbound vs Outbound Direction Badge */}
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                                            call.callType === 'Inbound' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            {call.callType === 'Inbound' ? '↙️ Inbound' : '↗️ Outbound'}
                                                        </span>

                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                            isConn ? 'bg-emerald-100 text-emerald-700' :
                                                            call.status === 'Busy' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {isConn ? '✅ Connected' : call.status || 'Call Placed'}
                                                        </span>

                                                        {durSec > 0 && (
                                                            <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                                                ⏱️ Talk: {Math.floor(durSec / 60)}m {durSec % 60}s
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(call.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-1">
                                                    {call.callType === 'Inbound' ? (
                                                        <span>Incoming from: <strong>{call.customerNumber || currentLead.mobileNumber}</strong> ➔ Ext: {call.agentNumber && String(call.agentNumber).length <= 6 ? call.agentNumber : 'Office'}</span>
                                                    ) : (
                                                        <span>Caller: <strong>{call.callerName || 'Agent'}</strong> {call.agentNumber && String(call.agentNumber).length <= 6 ? `(Ext: ${call.agentNumber})` : ''} ➔ {call.customerNumber || currentLead.mobileNumber}</span>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        {call.disposition && <span className="text-slate-600 font-medium text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{call.disposition}</span>}
                                                        {!isFrozen && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCallLogId(call._id || call.airtelCallId);
                                                                    setCallNotes(call.notes && !call.notes.startsWith("Airtel IQ Synced:") ? call.notes : "");
                                                                    setCallDisposition(call.disposition || currentLead.disposition || "Interested");
                                                                    setCallStage(currentLead.stage || "Warm");
                                                                    setCallDuration(call.duration || 0);
                                                                    setCallStatus(call.status || "Connected");
                                                                    setShowActionPanel(true);
                                                                    setShowCallLogger(true);
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors cursor-pointer"
                                                                title="Edit remarks & disposition for this call"
                                                            >
                                                                <Edit3 className="w-2.5 h-2.5" />
                                                                <span>Edit Note</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {call.notes && (
                                                    <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                                                        "{call.notes}"
                                                    </p>
                                                )}

                                                {callAudio && (
                                                    <div className="pt-1">
                                                        <AudioPlayer 
                                                            src={callAudio} 
                                                            duration={durSec}
                                                            title={`${call.callType === 'Inbound' ? 'Inbound Call with Customer' : `Call by ${call.callerName || 'Agent'}`} (Talk Time: ${durSec}s)`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Floating Action Trigger Button (Bottom Right) ── */}
                {!showActionPanel && !isFrozen && (
                    <div className="absolute bottom-5 right-5 z-40 animate-fade-in pointer-events-auto">
                        <button
                            type="button"
                            onClick={() => setShowActionPanel(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF5B22] via-[#FF6433] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white rounded-full font-bold text-xs shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer border border-white/20 group"
                        >
                            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 group-hover:rotate-12 transition-transform" />
                            <span>⚡ Actions &amp; Log Call</span>
                        </button>
                    </div>
                )}

                {/* Bottom Action Sheet with smooth slide up/down */}
                <div className={`absolute bottom-0 inset-x-0 z-50 transition-all duration-300 ease-in-out transform ${
                    showActionPanel ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
                }`}>
                    {isFrozen && !isAdmin ? (
                        <div className="pointer-events-auto bg-gray-100 border-t border-gray-200 px-4 py-3 flex items-center justify-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                <span className="text-[14px]">❄️</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 leading-tight">Lead is Frozen</p>
                                <p className="text-[10px] text-gray-500 font-medium">This lead is read-only and cannot be modified.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full bg-white border-t-2 border-orange-100 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] rounded-t-2xl">                
                             {/* Handle Bar & Collapse Header */}
                             <div className="flex items-center justify-between px-4 pt-2.5 pb-1 border-b border-gray-100">
                                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                     <Zap className="w-3.5 h-3.5 text-orange-600" />
                                     <span>Quick Actions</span>
                                 </div>
                                 <div 
                                     onClick={() => setShowActionPanel(false)}
                                     className="w-10 h-1 bg-gray-300 hover:bg-gray-400 rounded-full cursor-pointer transition-colors"
                                     title="Click to minimize"
                                 />
                                 <button
                                     type="button"
                                     onClick={() => {
                                         setShowActionPanel(false);
                                     }}
                                     className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                                     title="Minimize action panel"
                                 >
                                     <ChevronDown className="w-4 h-4" />
                                 </button>
                             </div>

                             <div className="px-4 pb-4 pt-2">
                                     {showCallLogger ? (
                                         <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                                             <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                                                 <div className="flex items-center gap-2">
                                                     <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                         <PhoneCall className="w-3.5 h-3.5" />
                                                     </div>
                                                     <div>
                                                         <h4 className="text-xs font-bold text-emerald-900 leading-none">Airtel IQ Telephony &amp; Call Desk</h4>
                                                         <span className="text-[9px] text-emerald-700 font-medium">Click-to-Dial &amp; Recording Ready</span>
                                                     </div>
                                                 </div>
                                                 <button onClick={() => setShowCallLogger(false)} className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors">
                                                     <X className="w-4 h-4" />
                                                 </button>
                                             </div>

                                             {/* Editing specific call log banner */}
                                             {editingCallLogId && (
                                                 <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between text-xs text-orange-900 shadow-xs animate-fade-in">
                                                     <div className="flex items-center gap-2">
                                                         <Edit3 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                                         <span className="font-semibold">Editing Remarks &amp; Disposition for selected call record</span>
                                                     </div>
                                                     <button
                                                         type="button"
                                                         onClick={() => {
                                                             setEditingCallLogId(null);
                                                             setCallNotes("");
                                                         }}
                                                         className="text-[11px] font-bold text-orange-600 hover:text-orange-800 underline cursor-pointer"
                                                     >
                                                         Cancel
                                                     </button>
                                                 </div>
                                             )}

                                             {/* Live Active Call HUD */}
                                             {isAirtelCallActive ? (
                                                 <div className="p-4 bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 border border-orange-500/30 rounded-2xl text-white shadow-xl space-y-3 animate-fade-in">
                                                     <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="relative flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                            </span>
                                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                                                🟢 Airtel IQ Call In Progress
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                                                                Ext: {user?.agentExtension || 'Self'} ➔ {currentLead.mobileNumber}
                                                            </span>
                                                            <button 
                                                                type="button" 
                                                                title="Dismiss active call banner"
                                                                onClick={() => {
                                                                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                                                    setIsAirtelCallActive(false);
                                                                    setCallLivePhase("IDLE");
                                                                }} 
                                                                className="text-orange-300 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                     </div>

                                                     <div className="flex items-center justify-between py-1">
                                                         <div>
                                                             <p className="text-[10px] uppercase text-orange-300 font-semibold tracking-wide">PBX Status</p>
                                                             <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                                                                 <span>Connected via CommsSetup</span>
                                                             </p>
                                                         </div>
                                                         <button
                                                             type="button"
                                                             onClick={() => handleSyncRecording()}
                                                             disabled={isSyncingRecording}
                                                             className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition cursor-pointer"
                                                         >
                                                             {isSyncingRecording ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
                                                             <span>End &amp; Sync Call</span>
                                                         </button>
                                                     </div>

                                                     <div className="flex items-center gap-2 text-[11px] text-orange-200/80 bg-zinc-900/50 p-2 rounded-xl border border-orange-500/10">
                                                         <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400 shrink-0" />
                                                         <span>Exact talk time &amp; audio recording will sync directly from Airtel IQ API on call completion.</span>
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <>
                                                      {/* Airtel IQ 1-Click Call Button (Shown only if user has an extension configured) */}
                                                      <div className={`grid gap-2 ${user?.agentExtension ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                                                          {user?.agentExtension && (
                                                              <button
                                                                  type="button"
                                                                  onClick={handleAirtelClickToCall}
                                                                  disabled={isDialingAirtel || !currentLead.mobileNumber}
                                                                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#FF5B22] via-orange-600 to-amber-600 hover:from-[#EA580C] hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-50 cursor-pointer"
                                                              >
                                                                  {isDialingAirtel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
                                                                  <span>Call via Airtel IQ (Ext: {user.agentExtension})</span>
                                                              </button>
                                                          )}

                                                          {currentLead.mobileNumber && !currentLead.mobileNumber.startsWith("Form-") && (
                                                              <a 
                                                                  href={`tel:${currentLead.mobileNumber}`}
                                                                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 shadow-xs transition"
                                                              >
                                                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                                  <span>Direct Phone: {currentLead.mobileNumber}</span>
                                                              </a>
                                                          )}
                                                      </div>

                                                     {/* Live Call Outcome Banner (For the Call Just Completed) */}
                                                     {airtelCallFeedback && (
                                                         <div className={`p-3 rounded-xl text-xs flex items-center justify-between shadow-xs transition-all ${
                                                             airtelCallFeedback.status === "connected"
                                                                 ? "bg-emerald-100/90 text-emerald-900 border border-emerald-300"
                                                                 : airtelCallFeedback.status === "busy" || airtelCallFeedback.status === "no_answer" || airtelCallFeedback.status === "failed"
                                                                 ? "bg-amber-50 text-amber-900 border border-amber-200"
                                                                 : "bg-orange-50 text-orange-900 border border-orange-200"
                                                         }`}>
                                                             <div className="flex items-center gap-2">
                                                                 {airtelCallFeedback.status === "connected" ? (
                                                                     <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                 ) : (
                                                                     <PhoneOff className="w-4 h-4 text-amber-600 shrink-0" />
                                                                 )}
                                                                 <span className="font-semibold">{airtelCallFeedback.message}</span>
                                                             </div>
                                                             <button 
                                                                 onClick={() => setAirtelCallFeedback(null)} 
                                                                 className="text-gray-400 hover:text-gray-700 text-xs font-bold px-1"
                                                             >
                                                                 ✕
                                                             </button>
                                                         </div>
                                                     )}

                                                     {/* Current Call Status & Duration Outcome */}
                                                     <div className="grid grid-cols-2 gap-2">
                                                         <div>
                                                             <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 flex items-center justify-between">
                                                                 <span>Call Status</span>
                                                                 {callStatus && (
                                                                     <span className="text-[9px] font-semibold text-emerald-600">Auto-detected</span>
                                                                 )}
                                                             </label>
                                                             <select 
                                                                 value={callStatus} 
                                                                 onChange={(e) => setCallStatus(e.target.value)}
                                                                 className={`w-full border rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold ${
                                                                     callStatus === "Connected" ? "border-emerald-400 text-emerald-800 bg-emerald-50/30" :
                                                                     callStatus === "Busy" || callStatus === "No Answer" || callStatus === "Failed" ? "border-amber-300 text-amber-800 bg-amber-50/20" :
                                                                     "border-emerald-200 text-gray-800"
                                                                 }`}
                                                             >
                                                                 <option value="">-- Auto-detecting / Select --</option>
                                                                 <option value="Connected">✅ Connected</option>
                                                                 <option value="Busy">⏳ Busy / Rejected</option>
                                                                 <option value="Not Reachable">🚫 Not Reachable</option>
                                                                 <option value="No Answer">📞 No Answer / Missed</option>
                                                                 <option value="Failed">❌ Failed</option>
                                                             </select>
                                                         </div>
                                                         <div>
                                                              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 flex items-center justify-between">
                                                                  <span>Call Duration</span>
                                                                  <span className="text-[10px] text-gray-400 font-medium">
                                                                      {callDuration > 0 ? `${Math.floor(callDuration / 60)}m ${callDuration % 60}s` : '0s'}
                                                                  </span>
                                                              </label>
                                                              <div className="relative">
                                                                  <input 
                                                                      type="number" 
                                                                      value={callDuration} 
                                                                      onChange={(e) => setCallDuration(Number(e.target.value) || 0)}
                                                                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold ${
                                                                          callDuration > 0 ? 'border-emerald-400 text-emerald-800 bg-emerald-50/30' : 'border-emerald-200 text-gray-800'
                                                                      }`}
                                                                      placeholder="0"
                                                                  />
                                                                  <span className="absolute right-2.5 top-1.5 text-[10px] text-gray-400 font-bold pointer-events-none">sec</span>
                                                              </div>
                                                         </div>
                                                     </div>
                                                 </>
                                             )}

                                             {/* Disposition & Stage */}
                                             <div className="grid grid-cols-2 gap-2">
                                                 <div>
                                                     <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 block">Stage</label>
                                                     <select 
                                                         value={callStage || getStage(currentLead) || "Warm"} 
                                                         onChange={(e) => setCallStage(e.target.value)}
                                                         className="w-full border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-800 font-medium"
                                                     >
                                                         {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                     </select>
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 block">Disposition</label>
                                                     <select 
                                                         value={callDisposition || getDisposition(currentLead) || "Interested"} 
                                                         onChange={(e) => setCallDisposition(e.target.value)}
                                                         className="w-full border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-800 font-medium"
                                                     >
                                                         {DISPOSITION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                                     </select>
                                                 </div>
                                             </div>

                                             {/* Next Follow Up */}
                                             <div>
                                                 <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 block">Next Follow-up Date & Time (Optional)</label>
                                                 <input 
                                                     type="datetime-local" 
                                                     value={callFollowUpDate} 
                                                     onChange={(e) => setCallFollowUpDate(e.target.value)}
                                                     className="w-full border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-800"
                                                 />
                                             </div>

                                             {/* Call Notes */}
                                             <div>
                                                 <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1 block">Discussion Summary / Notes</label>
                                                 <textarea 
                                                     rows={2}
                                                     value={callNotes} 
                                                     onChange={(e) => setCallNotes(e.target.value)}
                                                     placeholder="Spoke with student. Interested in batch starting next month..."
                                                     className="w-full border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-800 resize-none"
                                                 />
                                             </div>

                                             {/* In-App Call Recording Audio Player (ONLY for call just synced in this active session) */}
                                             {syncedAudioUrl && (
                                                 <div className="p-3 bg-white border-2 border-emerald-300 rounded-xl shadow-xs space-y-1 animate-fade-in">
                                                     <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                                                         <span className="flex items-center gap-1.5">🎙️ Current Call Audio</span>
                                                         <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">Just Synced</span>
                                                     </div>
                                                     <AudioPlayer 
                                                         src={syncedAudioUrl} 
                                                         duration={Number(callDuration) || 0}
                                                         title={`Latest Call Audio - ${currentLead.studentName || currentLead.mobileNumber}`} 
                                                     />
                                                 </div>
                                             )}

                                             <div className="flex gap-2 mt-2">
                                                 <button 
                                                     type="button"
                                                     onClick={handleSyncRecording}
                                                     disabled={isSyncingRecording}
                                                     className="px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                                     title="Sync latest recording and CDR from Airtel IQ"
                                                 >
                                                     {isSyncingRecording ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-[#FF5B22]" />}
                                                     <span>Sync Audio</span>
                                                 </button>
                                                 <button 
                                                     type="button"
                                                     onClick={handleLogCall} 
                                                     disabled={isSubmitting}
                                                     className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                                 >
                                                     {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                     <span>Save Call & Update Lead</span>
                                                 </button>
                                             </div>
                                         </div>
                                     ) : showPayment ? (
                                         <div>
                                             <div className="flex justify-between items-center mb-3">
                                                 <h4 className="text-sm font-bold text-orange-700 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-[#FF5B22]" /> Request Online Payment</h4>
                                                 <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                             </div>
                                             <div className="mb-2">
                                                 <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Total Course Fee</label>
                                                 <div className="relative">
                                                     <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                                                     <input type="number" placeholder="Enter total course fee" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} />
                                                 </div>
                                             </div>
                                             <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Amount &amp; Type</label>
                                             <div className="flex gap-2">
                                                 <select className="w-1/3 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:outline-none" value={onlinePaymentType} onChange={(e) => setOnlinePaymentType(e.target.value)}>
                                                     <option value="Full">Full</option>
                                                     <option value="Partial">Partial</option>
                                                 </select>
                                                 <div className="relative flex-1">
                                                     <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                                                     <input type="number" placeholder="Amount" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={onlinePaymentType === "Full" ? Math.max((totalFee || currentLead.totalCourseFee || 0) - (currentLead.totalAmountPaid || 0), 0) : amount} onChange={(e) => setAmount(e.target.value)} disabled={onlinePaymentType === "Full"} />
                                                 </div>
                                                 <button onClick={handleRequestPayment} disabled={isSubmitting} className="px-4 py-2 bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shadow-md shrink-0">
                                                     {isSubmitting ? '...' : <Send className="w-4 h-4" />}
                                                 </button>
                                             </div>
                                             {totalFee !== "" && (<p className="text-xs text-gray-400 mt-2">Balance after: <strong className="text-orange-600">₹{Math.max(Number(totalFee||0)-(currentLead.totalAmountPaid||0)-Number(onlinePaymentType==="Full"?Math.max((totalFee||currentLead.totalCourseFee||0)-(currentLead.totalAmountPaid||0),0):amount||0),0)}</strong></p>)}
                                         </div>
                                     ) : showManualPayment ? (
                                         <div>
                                             <div className="flex justify-between items-center mb-3">
                                                 <h4 className="text-sm font-bold text-purple-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Record Offline Payment</h4>
                                                 <button onClick={() => setShowManualPayment(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                             </div>
                                             <div className="grid grid-cols-2 gap-2 mb-2">
                                                 <div>
                                                     <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Total Fee</label>
                                                     <div className="relative"><span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span><input type="number" placeholder="Total fee" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-400 focus:outline-none" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} /></div>
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Mode</label>
                                                     <select className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-400 focus:outline-none" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                                         <option value="Cash">Cash</option><option value="Card">Card</option><option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option><option value="Cheque">Cheque</option>
                                                     </select>
                                                 </div>
                                             </div>
                                             <div className="flex gap-2 mb-2">
                                                 <select className="w-1/3 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-400 focus:outline-none" value={manualPaymentType} onChange={(e) => setManualPaymentType(e.target.value)}>
                                                     <option value="Full">Full</option><option value="Partial">Partial</option>
                                                 </select>
                                                 <div className="relative flex-1"><span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span><input type="number" placeholder="Amount received" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none" value={manualPaymentType==="Full"?Math.max((totalFee||currentLead.totalCourseFee||0)-(currentLead.totalAmountPaid||0),0):manualAmount} onChange={(e) => setManualAmount(e.target.value)} disabled={manualPaymentType==="Full"} /></div>
                                             </div>
                                             <input type="text" placeholder="Remarks / Transaction ID (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none mb-3" value={manualRemarks} onChange={(e) => setManualRemarks(e.target.value)} />
                                             {totalFee !== "" && (<p className="text-xs text-gray-400 mb-2">Balance after: <strong className="text-purple-600">₹{Math.max(Number(totalFee||0)-(currentLead.totalAmountPaid||0)-Number(manualPaymentType==="Full"?Math.max((totalFee||currentLead.totalCourseFee||0)-(currentLead.totalAmountPaid||0),0):manualAmount||0),0)}</strong></p>)}
                                             <button onClick={handleManualPayment} disabled={isSubmitting} className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm font-semibold shadow-md">
                                                 {isSubmitting ? 'Saving...' : 'Save Payment'}
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="space-y-3">
                                             {/* Quick Update Row */}
                                             <div className="grid grid-cols-2 gap-2">
                                                 <select className="w-full border border-gray-200 rounded-xl text-[11px] px-2.5 py-2 font-medium bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:outline-none focus:bg-white transition-colors" value={getStage(currentLead) || ""} onChange={(e) => handleInlineUpdate('stage', e.target.value)}>
                                                     <option value="" disabled>Stage...</option>
                                                     {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                 </select>
                                                 <SearchableSelect className="w-full border border-gray-200 rounded-xl text-[11px] px-2.5 py-2 font-medium bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:outline-none focus:bg-white transition-colors" value={getDisposition(currentLead) || ""} onChange={(val) => handleDispositionSelect(val)} options={DISPOSITION_OPTIONS} placeholder="Disposition..." />
                                             </div>

                                             {/* Follow Up Date Picker */}
                                             {showFollowUpPicker && (
                                                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col gap-2">
                                                     <p className="text-[11px] font-bold text-orange-800">Set Follow-up Date &amp; Time</p>
                                                     <input 
                                                         type="datetime-local" 
                                                         className="w-full border border-orange-200 rounded-lg text-xs px-2.5 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white"
                                                         value={followUpDate}
                                                         onChange={(e) => setFollowUpDate(e.target.value)}
                                                     />
                                                     <div className="flex justify-end gap-2 mt-1">
                                                         <button 
                                                             onClick={() => { setShowFollowUpPicker(false); setPendingDisposition(null); setFollowUpDate(""); }} 
                                                             className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                                         >
                                                             Cancel
                                                         </button>
                                                         <button 
                                                             onClick={confirmDispositionWithFollowUp}
                                                             disabled={!followUpDate}
                                                             className="px-3 py-1.5 text-[11px] font-semibold bg-[#FF5B22] hover:bg-[#EA580C] text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                         >
                                                             Save
                                                         </button>
                                                     </div>
                                                 </div>
                                             )}

                                             {/* Action Buttons: Log Call, Request Pay, Record Pay */}
                                             <div className="grid grid-cols-3 gap-2">
                                                 <button 
                                                     onClick={() => {
                                                         setShowCallLogger(true);
                                                         setShowPayment(false);
                                                         setShowManualPayment(false);
                                                     }} 
                                                     className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                 >
                                                     <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Log Call
                                                 </button>
                                                 <button onClick={() => {setShowPayment(true); setShowManualPayment(false); setShowCallLogger(false);}} className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                                                     <CreditCard className="w-3.5 h-3.5 text-orange-600" /> Request Pay
                                                 </button>
                                                 <button onClick={() => {setShowManualPayment(true); setShowPayment(false); setShowCallLogger(false);}} className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                                                     <CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Record Pay
                                                 </button>
                                             </div>

                                             {/* Note Input */}
                                             <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 focus-within:bg-white transition-all">
                                                 <MessageSquare className="w-4 h-4 text-gray-300 shrink-0" />
                                                 <input 
                                                     type="text" 
                                                     placeholder="Type a note or remark..." 
                                                     className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 min-w-0"
                                                     value={noteText}
                                                     onChange={(e) => setNoteText(e.target.value)}
                                                     onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                                 />
                                                 <button 
                                                     onClick={handleAddNote} 
                                                     disabled={isSubmitting || !noteText.trim()} 
                                                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5B22] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors disabled:opacity-40 shrink-0 cursor-pointer shadow-xs"
                                                 >
                                                     {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3" /> Save</>}
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                    )}
                </div>
            </div>
        </div>
    );
}
