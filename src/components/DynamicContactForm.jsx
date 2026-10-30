import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getFormBySlug, submitResponse, sendOtp, verifyOtp, updateResponseVerification } from '../api/formApi';
import { Loader2, CheckCircle2 } from 'lucide-react';

const DynamicContactForm = ({ variant = 'default', slug = 'enquiry-form-2026-27' }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [answers, setAnswers] = useState({});
    const [respondentPhone, setRespondentPhone] = useState('');
    const [respondentEmail, setRespondentEmail] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [responseId, setResponseId] = useState(null);

    useEffect(() => {
        fetchForm();
    }, [slug]);

    const fetchForm = async () => {
        try {
            const data = await getFormBySlug(slug);
            if (data.success) {
                setForm(data.data);
            }
        } catch (error) {
            console.error("Contact form not found", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const handleCheckboxChange = (qId, option, checked) => {
        setAnswers(prev => {
            const current = prev[qId] || [];
            if (checked) {
                return { ...prev, [qId]: [...current, option] };
            } else {
                return { ...prev, [qId]: current.filter(item => item !== option) };
            }
        });
    };

    const checkQuestionVisibility = (q) => {
        if (!q.logic?.targetQuestionId || q.isBranching) {
            if (!q.logic?.targetQuestionId) return true;

            const parentAnswer = answers[q.logic.targetQuestionId];
            return Array.isArray(parentAnswer)
                ? parentAnswer?.includes(q.logic.targetValue)
                : parentAnswer === q.logic.targetValue;
        }

        const parent = form.questions.find(pq => pq.id === q.logic.targetQuestionId);
        if (!parent) return false;
        if (!checkQuestionVisibility(parent)) return false;

        const parentAnswer = answers[parent.id];
        return Array.isArray(parentAnswer)
            ? parentAnswer?.includes(q.logic.targetValue)
            : parentAnswer === q.logic.targetValue;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let hasError = false;
        form?.questions?.forEach(q => {
            if (q.required && checkQuestionVisibility(q)) {
                const val = answers[q.id];
                if (!val || (Array.isArray(val) && val.length === 0)) {
                    hasError = true;
                }
            }
        });

        if (hasError) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const trackingData = {
                gclid: searchParams.get('gclid') || undefined,
                utm_source: searchParams.get('utm_source') || undefined,
                utm_medium: searchParams.get('utm_medium') || undefined,
                utm_campaign: searchParams.get('utm_campaign') || undefined,
                utm_term: searchParams.get('utm_term') || undefined
            };

            const submitData = {
                formId: form ? form._id : 'static-form',
                answers: Object.keys(answers).map(key => ({ questionId: key, answer: answers[key] })),
                respondentPhone: respondentPhone,
                respondentEmail: respondentEmail,
                verificationStatus: form?.settings?.verifyPhone ? 'Pending' : 'Not Required',
                trackingData
            };

            // Extract phone if available for respondentPhone
            if (!respondentPhone) {
                form?.questions?.forEach(q => {
                    if (q.type === 'phone' || q.questionText.toLowerCase().includes('mobile')) {
                        if (answers[q.id]) {
                            submitData.respondentPhone = answers[q.id];
                            setRespondentPhone(answers[q.id]);
                        }
                    }
                });
            }
            if (!respondentEmail) {
                form?.questions?.forEach(q => {
                    if (q.type === 'short_answer' && q.questionText.toLowerCase().includes('email')) {
                        if (answers[q.id]) {
                            submitData.respondentEmail = answers[q.id];
                            setRespondentEmail(answers[q.id]);
                        }
                    }
                });
            }

            const data = await submitResponse(submitData);

            if (data.success) {
                if (form?.settings?.verifyPhone) {
                    const extractedId = data.responseId || data.data?._id || data.data?.response?._id;
                    if (extractedId) setResponseId(extractedId);
                    await handleSendOtp(submitData.respondentPhone);
                    setShowOtpModal(true);
                } else {
                    toast.success('Message sent successfully!');
                    setSubmitted(true);
                }
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.success('Thanks for reaching out! We will contact you soon.');
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendOtp = async (phoneToUse) => {
        setOtpLoading(true);
        try {
            const phone = phoneToUse || respondentPhone;
            const res = await sendOtp(phone);
            if (res.success) {
                toast.success('OTP sent successfully');
            } else {
                toast.error(res.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        try {
            const res = await verifyOtp(respondentPhone, otp);
            if (res.success) {
                if (responseId) {
                    await updateResponseVerification(responseId, 'Verified');
                }
                toast.success('Phone verified successfully!');
                setShowOtpModal(false);
                setSubmitted(true);
            } else {
                toast.error('Invalid OTP');
            }
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_0_40px_rgba(0,0,0,0.06)] p-7 w-full max-w-md mx-auto relative z-20 flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="bg-emerald-50 rounded-2xl p-10 border border-emerald-100 text-center shadow-lg w-full max-w-md mx-auto relative z-20">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thanks for reaching out!</h3>
                <p className="text-gray-600 mb-8">
                    We've received your query and our team will connect with you soon.
                </p>
            </div>
        );
    }

    const renderQuestion = (q) => {
        if (q.isActive === false) return null;
        if (!checkQuestionVisibility(q)) return null;

        return (
            <div key={q.id}>
                <label className="block text-[13px] font-semibold text-[#1a2b4c] mb-0.5">
                    {q.questionText} {q.required && <span className="text-red-500">*</span>}
                </label>
                
                {(q.type === 'short_answer' || q.type === 'phone' || q.type === 'date' || q.type === 'time') && (
                    <input 
                        type={q.type === 'phone' ? 'tel' : q.type === 'date' ? 'date' : q.type === 'time' ? 'time' : 'text'}
                        name={q.id}
                        value={answers[q.id] || ''}
                        onChange={(e) => {
                            let val = e.target.value;
                            if (q.type === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                            handleAnswerChange(q.id, val);
                        }}
                        placeholder={`Enter your ${q.questionText.toLowerCase()}`} 
                        className="w-full px-3 py-1.5 bg-[#FCFCFC] border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#08BD80] focus:ring-1 focus:ring-[#08BD80] transition-all placeholder:text-gray-400" 
                        required={q.required}
                    />
                )}

                {q.type === 'dropdown' && (
                    <select
                        className="w-full px-3 py-1.5 bg-[#FCFCFC] border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#08BD80] focus:ring-1 focus:ring-[#08BD80] transition-all cursor-pointer text-gray-700"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required={q.required}
                    >
                        <option value="">Select an option...</option>
                        {q.options?.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                )}

                {q.type === 'multiple_choice' && (
                    <div className="space-y-1 mt-1">
                        {q.options?.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-4 h-4 text-[#08BD80] focus:ring-[#08BD80]"
                                />
                                <span className="text-[13px] text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}
                
                {q.type === 'checkbox' && (
                    <div className="space-y-1 mt-1">
                        {q.options?.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={answers[q.id]?.includes(opt) || false}
                                    onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                    className="w-4 h-4 text-[#08BD80] rounded focus:ring-[#08BD80]"
                                />
                                <span className="text-[13px] text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_0_40px_rgba(0,0,0,0.06)] p-5 w-full max-w-md mx-auto relative z-20">
            <h3 className="text-[20px] font-bold text-[#1a2b4c] mb-3">{form?.title || 'Enquire Now'}</h3>
            
            {form?.description && (
                <p className="text-gray-500 text-[13px] mb-3">{form.description}</p>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-2">
                {form?.settings?.collectEmail && (
                    <div>
                        <label className="block text-[13px] font-semibold text-[#1a2b4c] mb-0.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-1.5 bg-[#FCFCFC] border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#08BD80] focus:ring-1 focus:ring-[#08BD80] transition-all"
                            placeholder="your.email@example.com"
                            value={respondentEmail}
                            onChange={e => setRespondentEmail(e.target.value)}
                        />
                    </div>
                )}
                
                {form?.settings?.verifyPhone && (
                    <div>
                        <label className="block text-[13px] font-semibold text-[#1a2b4c] mb-0.5">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium text-[13px]">+91</span>
                            </div>
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                className="w-full pl-10 pr-3 py-1.5 bg-[#FCFCFC] border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#08BD80] focus:ring-1 focus:ring-[#08BD80] transition-all tracking-wide"
                                placeholder="00000 00000"
                                value={respondentPhone}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setRespondentPhone(val);
                                }}
                            />
                        </div>
                    </div>
                )}

                {form?.questions?.filter(q => !q.logic?.targetQuestionId || q.isBranching).map(q => (
                    <React.Fragment key={q.id}>
                        {renderQuestion(q)}
                        {/* Render Child Questions directly under their parents if visible */}
                        {form.questions.filter(child => child.logic?.targetQuestionId === q.id && !child.isBranching).map(childQ => renderQuestion(childQ))}
                    </React.Fragment>
                ))}

                <button 
                    type="submit" 
                    disabled={isSubmitting || !form}
                    className="w-full bg-[#08BD80] hover:bg-[#06a670] text-white font-bold py-2 rounded-xl transition-colors mt-4 text-[14px] flex items-center justify-center disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enquire Now"}
                </button>
                
                <div className="text-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-500 text-[12px] mb-0.5">Or call us at</p>
                    <p className="text-blue-600 font-bold text-[15px]">+91 6366527093</p>
                </div>
            </form>
        </div>
            
        {showOtpModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-5 bg-gradient-to-br from-[#08BD80] to-[#06a670]">
                            <h3 className="text-lg font-bold text-white text-center">Verify Your Phone</h3>
                            <p className="text-[#e6fcf5] text-center text-xs mt-1">We sent an OTP to +91 {respondentPhone}</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#08BD80] focus:ring-2 focus:ring-[#08BD80]/20 text-center tracking-[0.5em] text-xl font-bold text-slate-800"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otp.length < 4}
                                className="w-full py-3 bg-[#08BD80] hover:bg-[#06a670] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Submit'}
                            </button>
                            <div className="mt-4 flex flex-col gap-2 text-center">
                                <button type="button" onClick={() => handleSendOtp(respondentPhone)} disabled={otpLoading} className="text-[#08BD80] hover:text-[#06a670] font-semibold text-sm">Resend OTP</button>
                                <button type="button" onClick={() => { setShowOtpModal(false); setSubmitted(true); }} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Skip Verification</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DynamicContactForm;
