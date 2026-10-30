import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    getFormById, getFormBySlug, submitResponse, uploadFile, 
    sendOtp, verifyOtp, updateResponseVerification, createPaymentOrder, 
    updateResponsePayment 
} from '../../api/formApi';
import { 
    CheckCircle2, Sparkles, ShieldCheck, CreditCard, Upload, 
    FileText, Phone, Mail, Star, Calendar, Clock, ChevronRight, 
    RotateCcw, Lock, ArrowRight, ExternalLink, AlertCircle,
    Hash, Globe, MapPin, GraduationCap, CheckCheck, Clock3,
    SplitSquareVertical, SlidersHorizontal
} from 'lucide-react';
import Confetti from 'react-confetti';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

export default function FormView({ formId, formSlug, onSuccess, previewFormData, showHeader = true, showFooter = true }) {
    const params = useParams();
    const id = formId || params.id;
    const slug = formSlug || params.slug;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState(previewFormData || null);
    const [loading, setLoading] = useState(!previewFormData);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [respondentEmail, setRespondentEmail] = useState('');
    const [respondentPhone, setRespondentPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [currentResponseId, setCurrentResponseId] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [showConfetti, setShowConfetti] = useState(false);
    const [hoverRating, setHoverRating] = useState({});

    useEffect(() => {
        if (previewFormData) {
            setForm(previewFormData);
            setLoading(false);
        } else {
            fetchForm();
        }
    }, [id, slug, previewFormData]);

    const fetchForm = async () => {
        try {
            let data;
            if (slug) {
                data = await getFormBySlug(slug);
            } else {
                data = await getFormById(id);
            }
            if (data.success) {
                setForm(data.data);
            } else {
                toast.error('Form not found');
            }
        } catch (error) {
            console.error('Fetch form error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));

        if (validationErrors[qId]) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next[qId];
                return next;
            });
        }
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

        if (validationErrors[qId]) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next[qId];
                return next;
            });
        }
    };

    const checkQuestionVisibility = (q) => {
        if (!q.logic?.targetQuestionId || q.isBranching) {
            if (!q.logic?.targetQuestionId) return true;

            const parentAnswer = answers[q.logic.targetQuestionId];
            return Array.isArray(parentAnswer)
                ? parentAnswer?.includes(q.logic.targetValue)
                : parentAnswer === q.logic.targetValue;
        }

        const parent = form?.questions?.find(pq => pq.id === q.logic.targetQuestionId);
        if (!parent) return false;

        if (!checkQuestionVisibility(parent)) return false;

        const parentAnswer = answers[parent.id];
        return Array.isArray(parentAnswer)
            ? parentAnswer?.includes(q.logic.targetValue)
            : parentAnswer === q.logic.targetValue;
    };

    const handleFileUpload = async (qId, files) => {
        const file = files?.[0];
        if (!file) return;

        setUploadingFiles(prev => ({ ...prev, [qId]: true }));
        const toastId = toast.loading('Uploading document...');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const res = await uploadFile(reader.result);
                if (res.success && res.url) {
                    handleAnswerChange(qId, res.url);
                    toast.success('File uploaded successfully!', { id: toastId });
                } else {
                    toast.error('Failed to upload file', { id: toastId });
                }
                setUploadingFiles(prev => ({ ...prev, [qId]: false }));
            };
        } catch (err) {
            console.error('File upload error:', err);
            toast.error('File upload error', { id: toastId });
            setUploadingFiles(prev => ({ ...prev, [qId]: false }));
        }
    };

    const handleSendOtp = async () => {
        const phoneQ = form?.questions?.find(q => q.type === 'phone' || q.isPrimaryPhone);
        const targetPhone = phoneQ ? answers[phoneQ.id] : respondentPhone;

        if (!targetPhone || targetPhone.length < 10) {
            toast.error('Please provide a valid 10-digit phone number');
            return;
        }

        setOtpLoading(true);
        try {
            const res = await sendOtp(targetPhone);
            if (res.success) {
                setOtpSent(true);
                toast.success('OTP sent successfully!');
            } else {
                toast.error(res.message || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error('Error sending OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) {
            toast.error('Please enter valid 4-digit OTP');
            return;
        }

        const phoneQ = form?.questions?.find(q => q.type === 'phone' || q.isPrimaryPhone);
        const targetPhone = phoneQ ? answers[phoneQ.id] : respondentPhone;

        setOtpLoading(true);
        try {
            const res = await verifyOtp(targetPhone, otp);
            if (res.success) {
                setPhoneVerified(true);
                setShowOtpModal(false);
                toast.success('Phone verified successfully!');

                if (currentResponseId) {
                    await updateResponseVerification(currentResponseId, { isVerified: true });
                }

                handleFinalSuccess();
            } else {
                toast.error(res.message || 'Invalid OTP');
            }
        } catch (err) {
            toast.error('OTP verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (responseId) => {
        setIsSubmitting(true);
        const toastId = toast.loading('Initiating Payment...');

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load", { id: toastId });
                setIsSubmitting(false);
                handleFinalSuccess();
                return;
            }

            const orderData = await createPaymentOrder(form.settings.paymentAmount, form.settings.currency || 'INR');
            if (!orderData.success) {
                toast.error(orderData.message || "Failed to create order", { id: toastId });
                setIsSubmitting(false);
                handleFinalSuccess();
                return;
            }

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: form.branding?.companyName || form.title,
                description: "Application Fee",
                order_id: orderData.order.id,
                handler: async function (paymentResponse) {
                    toast.dismiss(toastId);
                    toast.success('Payment Successful!');
                    if (responseId) {
                        try {
                            await updateResponsePayment(responseId, paymentResponse);
                        } catch (err) {
                            console.error('Failed to update payment status:', err);
                        }
                    }
                    if (form.settings?.verifyPhone && !phoneVerified) {
                        setCurrentResponseId(responseId);
                        setShowOtpModal(true);
                        handleSendOtp();
                    } else {
                        handleFinalSuccess();
                    }
                },
                modal: {
                    ondismiss: function () {
                        toast.dismiss(toastId);
                        if (form.settings?.verifyPhone && !phoneVerified) {
                            setCurrentResponseId(responseId);
                            setShowOtpModal(true);
                            handleSendOtp();
                        } else {
                            handleFinalSuccess();
                        }
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('Payment initiation error', { id: toastId });
            setIsSubmitting(false);
            handleFinalSuccess();
        }
    };

    const handleFinalSuccess = () => {
        setSubmitted(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 7000);

        if (onSuccess) {
            onSuccess({
                form,
                answers,
                thankYou: form.settings?.thankYou
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        const visibleQuestions = (form?.questions || []).filter(q => q.isActive !== false && checkQuestionVisibility(q));

        for (const q of visibleQuestions) {
            if (q.type === 'section_header') continue;

            const val = answers[q.id];
            if (q.required) {
                if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                    errors[q.id] = 'This field is required';
                }
            }

            if (q.type === 'email' && val) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    errors[q.id] = 'Please enter a valid email address';
                }
            }

            if (q.type === 'phone' && val) {
                if (val.length < 10) {
                    errors[q.id] = 'Please enter a valid 10-digit number';
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (previewFormData) {
            toast.success('Preview Mode: Form validated successfully!');
            handleFinalSuccess();
            return;
        }

        if (!validateForm()) {
            toast.error('Please complete all required fields');
            const firstErrorEl = document.querySelector('[data-has-error="true"]');
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting your response...');

        try {
            const trackingData = {
                gclid: searchParams.get('gclid') || undefined,
                utm_source: searchParams.get('utm_source') || undefined,
                utm_medium: searchParams.get('utm_medium') || undefined,
                utm_campaign: searchParams.get('utm_campaign') || undefined,
                utm_term: searchParams.get('utm_term') || undefined
            };

            const payload = {
                formId: form._id,
                answers,
                tracking: trackingData,
                respondentEmail,
                respondentPhone
            };

            const res = await submitResponse(payload);
            if (res.success) {
                toast.success('Response recorded successfully!', { id: toastId });
                const responseId = res.data?._id || res.data?.id;
                setSubmittedData(res.data);

                if (form.settings?.collectPayment && form.settings?.paymentAmount > 0) {
                    await handlePayment(responseId);
                } else if (form.settings?.verifyPhone && !phoneVerified) {
                    setCurrentResponseId(responseId);
                    setShowOtpModal(true);
                    handleSendOtp();
                } else {
                    handleFinalSuccess();
                }
            } else {
                toast.error(res.message || 'Submission failed', { id: toastId });
            }
        } catch (error) {
            console.error('Submit form error:', error);
            toast.error(error.response?.data?.message || 'Error submitting response', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-[#FF5B22] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-gray-500">Loading form...</p>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="text-center py-20">
                <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-base font-bold text-gray-800">Form Not Available</h3>
                <p className="text-xs text-gray-500">This form is currently inactive or does not exist.</p>
            </div>
        );
    }

    const primaryColor = form.theme?.primaryColor || '#FF5B22';
    const backgroundColor = form.theme?.backgroundColor || '#F8FAFC';
    const cardRadius = form.theme?.cardStyle || 'rounded-2xl';
    const isPillButton = form.theme?.buttonStyle === 'pill';
    const bgPattern = form.theme?.bgPattern || 'clean';
    const layoutMode = form.theme?.layoutMode || 'unified-card'; // 'unified-card' | 'section-blocks' | 'minimal-cards' | 'linear-doc'
    const formWidth = form.theme?.formWidth || 'standard'; // 'compact' | 'standard' | 'wide'
    const formDensity = form.theme?.formDensity || 'compact'; // 'compact' | 'balanced' | 'spacious'
    const numberingStyle = form.theme?.numberingStyle || 'badge'; // 'badge' | 'dot' | 'hidden'
    
    const bgStyle = {
        backgroundColor,
        ...(bgPattern === 'subtle-grid' ? {
            backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
        } : bgPattern === 'mesh-gradient' ? {
            backgroundImage: `radial-gradient(at 10% 10%, ${primaryColor}18 0px, transparent 50%), radial-gradient(at 90% 90%, ${primaryColor}12 0px, transparent 50%)`,
        } : {})
    };

    const widthClass = {
        'compact': 'max-w-lg',
        'standard': 'max-w-2xl',
        'wide': 'max-w-3xl'
    }[formWidth] || 'max-w-2xl';

    const visibleQuestions = (form.questions || []).filter(q => q.isActive !== false && checkQuestionVisibility(q));

    // SUCCESS / THANK YOU VIEW
    if (submitted) {
        return (
            <div className="min-h-screen py-12 px-4 flex items-center justify-center transition-colors" style={bgStyle}>
                {showConfetti && <Confetti numberOfPieces={250} recycle={false} />}
                
                <div className={`w-full max-w-lg bg-white p-8 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6 relative overflow-hidden animate-fadeIn ${cardRadius}`}>
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-inner">
                        <CheckCircle2 size={36} className="stroke-[2.5]" />
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            {form.settings?.thankYou?.title || 'Thank You!'}
                        </h2>
                        <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                            {form.settings?.thankYou?.message || 'Your response has been recorded successfully. Our admissions team will get back to you shortly.'}
                        </p>
                    </div>

                    {/* Response Receipt Card */}
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-left text-xs space-y-2">
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Form Submitted:</span>
                            <span className="font-bold text-gray-800">{form.title}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Timestamp:</span>
                            <span className="font-semibold text-gray-700">{new Date().toLocaleString()}</span>
                        </div>
                        {form.settings?.collectPayment && form.settings?.paymentAmount > 0 && (
                            <div className="flex justify-between items-center text-emerald-700 font-bold pt-1 border-t border-gray-200">
                                <span>Fee Status:</span>
                                <span>₹{form.settings.paymentAmount} (Paid)</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        <button
                            onClick={() => {
                                setAnswers({});
                                setSubmitted(false);
                                setPhoneVerified(false);
                            }}
                            className={`w-full py-3 font-bold text-xs text-white transition active:scale-98 shadow-md hover:shadow-lg cursor-pointer ${
                                isPillButton ? 'rounded-full' : 'rounded-xl'
                            }`}
                            style={{ backgroundColor: primaryColor }}
                        >
                            Submit Another Response
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderQuestionInput = (q, hasError) => {
        return (
            <div className="space-y-1.5 pt-1">
                {/* 1. Short Answer */}
                {q.type === 'short_answer' && (
                    <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF5B22] focus:ring-2 focus:ring-orange-500/10 transition"
                    />
                )}

                {/* 2. Paragraph */}
                {q.type === 'paragraph' && (
                    <textarea
                        rows={3}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Write your detailed answer..."
                        className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF5B22] focus:ring-2 focus:ring-orange-500/10 transition resize-none"
                    />
                )}

                {/* 3. Numeric input */}
                {q.type === 'number' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <Hash size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="number"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="e.g. 95, 17, 2500"
                            className="w-full text-xs sm:text-sm font-bold bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 4. Phone */}
                {q.type === 'phone' && (
                    <div className="flex bg-gray-50/70 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <div className="bg-gray-100 px-3 py-2.5 text-gray-700 font-bold text-xs flex items-center gap-1.5 border-r border-gray-200 shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                        </div>
                        <input
                            type="tel"
                            maxLength={10}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit mobile number"
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 bg-transparent focus:outline-none placeholder:font-normal"
                        />
                    </div>
                )}

                {/* 5. Email */}
                {q.type === 'email' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <Mail size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="email"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="name@example.com"
                            className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 6. City / Location */}
                {q.type === 'location' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <MapPin size={15} className="text-[#FF5B22] shrink-0" />
                        <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="Enter City & State (e.g. Jaipur, Rajasthan)"
                            className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 7. Website / Portfolio URL */}
                {q.type === 'url' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <Globe size={15} className="text-blue-500 shrink-0" />
                        <input
                            type="url"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="https://example.com"
                            className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 8. Date Picker */}
                {q.type === 'date' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <Calendar size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="date"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 9. Time Picker */}
                {q.type === 'time' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus-within:border-[#FF5B22] focus-within:ring-2 focus-within:ring-orange-500/10 transition">
                        <Clock3 size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="time"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-800"
                        />
                    </div>
                )}

                {/* 10. Rating Scale (1 to 5 Stars) */}
                {q.type === 'rating' && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 pt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = (hoverRating[q.id] || answers[q.id] || 0) >= star;
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(prev => ({ ...prev, [q.id]: star }))}
                                        onMouseLeave={() => setHoverRating(prev => ({ ...prev, [q.id]: 0 }))}
                                        onClick={() => handleAnswerChange(q.id, star)}
                                        className="p-1 transition transform hover:scale-110 cursor-pointer"
                                    >
                                        <Star
                                            size={24}
                                            className={isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        {answers[q.id] && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                {answers[q.id] === 5 ? '5 Stars - Outstanding!' : `${answers[q.id]} Stars Selected`}
                            </span>
                        )}
                    </div>
                )}

                {/* 11. Scale 1-10 (NPS Scale) */}
                {q.type === 'scale_10' && (
                    <div className="space-y-1.5 pt-0.5">
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                const isSelected = answers[q.id] === num;
                                return (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => handleAnswerChange(q.id, num)}
                                        className={`py-2 rounded-xl font-bold text-xs transition border cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#FF5B22] text-white border-[#FF5B22] shadow-sm scale-105'
                                                : 'bg-gray-50 hover:bg-orange-50 text-gray-700 border-gray-200'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold px-1">
                            <span>1 - Not Likely</span>
                            <span>10 - Extremely Likely</span>
                        </div>
                    </div>
                )}

                {/* 12. Range / Budget Slider */}
                {q.type === 'range_slider' && (
                    <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-500">Selected Value:</span>
                            <span className="text-[#FF5B22] text-xs font-black">
                                ₹{(answers[q.id] || 50000).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={10000}
                            max={300000}
                            step={5000}
                            value={answers[q.id] || 50000}
                            onChange={(e) => handleAnswerChange(q.id, Number(e.target.value))}
                            className="w-full accent-[#FF5B22] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                            <span>₹10,000</span>
                            <span>₹3,00,000+</span>
                        </div>
                    </div>
                )}

                {/* 13. Multiple Choice & Course Select */}
                {(q.type === 'multiple_choice' || q.type === 'course_select') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {(q.options || []).map((opt, oIdx) => {
                            const isSelected = answers[q.id] === opt;
                            return (
                                <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, opt)}
                                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition cursor-pointer ${
                                        isSelected ? 'border-[#FF5B22] bg-orange-50/60 shadow-2xs ring-1 ring-orange-500/20' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                                        isSelected ? 'border-[#FF5B22] bg-[#FF5B22]' : 'border-gray-300'
                                    }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#FF5B22]' : 'text-gray-800'}`}>
                                        {opt}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 14. Checkboxes */}
                {q.type === 'checkbox' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {(q.options || []).map((opt, oIdx) => {
                            const isChecked = (answers[q.id] || []).includes(opt);
                            return (
                                <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleCheckboxChange(q.id, opt, !isChecked)}
                                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition cursor-pointer ${
                                        isChecked ? 'border-[#FF5B22] bg-orange-50/60 shadow-2xs ring-1 ring-orange-500/20' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                                        isChecked ? 'border-[#FF5B22] bg-[#FF5B22]' : 'border-gray-300'
                                    }`}>
                                        {isChecked && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold truncate ${isChecked ? 'text-[#FF5B22]' : 'text-gray-800'}`}>
                                        {opt}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 15. Dropdown Select */}
                {q.type === 'dropdown' && (
                    <select
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#FF5B22] cursor-pointer"
                    >
                        <option value="">Select an option...</option>
                        {(q.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                        ))}
                    </select>
                )}

                {/* 16. WhatsApp / Terms Consent Checkbox */}
                {q.type === 'consent' && (
                    <label className="flex items-start gap-2.5 p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!answers[q.id]}
                            onChange={(e) => handleAnswerChange(q.id, e.target.checked)}
                            className="mt-0.5 w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-emerald-950 leading-relaxed">
                            {q.questionText}
                        </span>
                    </label>
                )}

                {/* 17. File Upload */}
                {q.type === 'file_upload' && (
                    <div className="space-y-2">
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-[#FF5B22] hover:bg-orange-50/30 rounded-xl cursor-pointer transition">
                            <Upload size={20} className="text-gray-400 mb-1" />
                            <span className="text-xs font-bold text-gray-700">Click to upload document / file</span>
                            <span className="text-[10px] text-gray-400">PDF, DOC, JPG or PNG up to 10MB</span>
                            <input
                                type="file"
                                onChange={(e) => handleFileUpload(q.id, e.target.files)}
                                className="hidden"
                                disabled={uploadingFiles[q.id]}
                            />
                        </label>

                        {uploadingFiles[q.id] && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-xl">
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading file...</span>
                            </div>
                        )}

                        {answers[q.id] && (
                            <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                                <span className="truncate">✓ File attached successfully</span>
                                <a href={answers[q.id]} target="_blank" rel="noreferrer" className="text-emerald-900 underline ml-2 shrink-0">
                                    Preview
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Validation Error Message */}
                {hasError && (
                    <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 pt-0.5">
                        <AlertCircle size={12} /> {validationErrors[q.id]}
                    </p>
                )}
            </div>
        );
    };

    const screenLayout = form.theme?.screenLayout || 'center-floating'; // 'center-floating' | 'split-left' | 'split-right' | 'fullscreen-flow'
    const headerAlignment = form.theme?.headerAlignment || 'left';
    const fontScale = form.theme?.fontScale || 'normal';

    const titleSizeClass = fontScale === 'compact' ? 'text-base sm:text-lg' : fontScale === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';
    const labelSizeClass = fontScale === 'compact' ? 'text-xs' : fontScale === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm';
    const inputPaddingClass = fontScale === 'compact' ? 'py-2 px-3 text-xs' : fontScale === 'large' ? 'py-3 px-4 text-sm' : 'py-2.5 px-3.5 text-xs sm:text-sm';
    const headerAlignClass = headerAlignment === 'center' ? 'text-center items-center' : 'text-left items-start';

    // RENDER SIDE HERO FOR SPLIT-SCREEN LAYOUTS
    const renderSideHero = () => {
        const hero = form.theme?.sideHero || {};
        const heroTitle = hero.title || form.title || 'Admissions & Enrollment';
        const heroSubtitle = hero.subtitle || form.description || 'Fill out the simple form to connect with our dedicated counseling team.';
        const heroImage = hero.imageUrl || form.images?.[0] || '';
        const badgeText = hero.badgeText || '⚡ Official Portal';
        const features = (hero.features && hero.features.length > 0) ? hero.features : [
            '⚡ Fast & easy 2-minute application',
            '🎓 Direct academic counselor consultation',
            '🔒 100% verified & SSL encrypted submission'
        ];

        return (
            <div className={`bg-white/90 backdrop-blur-md border border-gray-200/80 p-6 sm:p-8 space-y-6 shadow-md sticky top-8 ${cardRadius}`}>
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3">
                    {form.branding?.logoUrl ? (
                        <img src={form.branding.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl border border-gray-100 p-0.5 bg-white shadow-2xs" />
                    ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-2xs" style={{ backgroundColor: primaryColor }}>
                            {form.title?.charAt(0) || 'F'}
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{form.branding?.companyName || 'Admissions Desk'}</h3>
                        {form.branding?.tagline && (
                            <p className="text-xs font-semibold" style={{ color: primaryColor }}>{form.branding.tagline}</p>
                        )}
                    </div>
                </div>

                {/* Badge & Headline */}
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5B22]">
                        <Sparkles size={12} /> {badgeText}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                        {heroTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>

                {/* Hero Image if provided */}
                {heroImage && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs max-h-56">
                        <img src={heroImage} alt="Hero Banner" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2">
                    {features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs" style={{ backgroundColor: primaryColor }}>
                                <CheckCheck size={12} />
                            </div>
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>

                {/* Testimonial / Social Proof */}
                {hero.showTestimonial && hero.testimonialQuote && (
                    <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-2">
                        <div className="flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => <Star key={star} size={12} fill="currentColor" />)}
                        </div>
                        <p className="text-xs italic text-gray-700">"{hero.testimonialQuote}"</p>
                        {hero.testimonialAuthor && (
                            <p className="text-[10px] font-bold text-gray-900">— {hero.testimonialAuthor}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // RENDER MAIN FORM BOX CONTENT
    const renderMainForm = () => {
        return (
            <div className="space-y-4">
                {/* UNIFIED CARD / LINEAR DOC PRESENTATION MODE */}
                {(layoutMode === 'unified-card' || layoutMode === 'linear-doc') ? (
                    <div className={`bg-white border transition-all duration-200 overflow-hidden ${
                        layoutMode === 'linear-doc' ? 'border-gray-200/50 shadow-xs' : 'border-gray-200/80 shadow-md'
                    } ${cardRadius}`}>
                        {/* Optional Banner Image Carousel */}
                        {showHeader && form.images?.length > 0 && (
                            <div className="w-full aspect-[21/9] max-h-48 bg-gray-100 overflow-hidden relative">
                                <Swiper
                                    modules={[Autoplay, EffectFade, Navigation]}
                                    effect="fade"
                                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                                    loop={form.images.length > 1}
                                    className="w-full h-full"
                                >
                                    {form.images.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <img src={img} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        )}

                        {/* Unified Form Header */}
                        {showHeader && (
                            <div className={`p-5 sm:p-7 border-b border-gray-100 space-y-2.5 flex flex-col ${headerAlignClass}`}>
                                <div className={`flex items-center gap-2.5 ${headerAlignment === 'center' ? 'justify-center' : ''}`}>
                                    {form.branding?.logoUrl ? (
                                        <img src={form.branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg border border-gray-100 p-0.5" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs" style={{ backgroundColor: primaryColor }}>
                                            {form.title?.charAt(0) || 'F'}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">
                                            {form.branding?.companyName || 'Admissions Desk'}
                                        </h4>
                                        {form.branding?.tagline && (
                                            <p className="text-[10px] font-semibold" style={{ color: primaryColor }}>
                                                {form.branding.tagline}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h1 className={`${titleSizeClass} font-black text-gray-950 tracking-tight`}>
                                        {form.title}
                                    </h1>
                                    {form.description && (
                                        <p className="text-xs text-gray-500 leading-relaxed pt-1">
                                            {form.description}
                                        </p>
                                    )}
                                </div>

                                {form.settings?.collectPayment && form.settings?.paymentAmount > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-bold">
                                        <CreditCard size={12} />
                                        <span>Registration Fee: ₹{form.settings.paymentAmount}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Questions Flow inside Unified Card */}
                        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
                            {visibleQuestions.map((q, idx) => {
                                const hasError = !!validationErrors[q.id];

                                if (q.type === 'section_header') {
                                    return (
                                        <div key={q.id} className="pt-3 pb-1 border-b border-gray-200/80">
                                            <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5 pb-2">
                                                <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                                <span>{q.questionText}</span>
                                            </h2>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={q.id} className="space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {numberingStyle !== 'hidden' && (
                                                <span className="text-[11px] font-bold text-gray-400 font-mono">
                                                    {numberingStyle === 'dot' ? '•' : `${idx + 1}.`}
                                                </span>
                                            )}
                                            <label className={`${labelSizeClass} font-bold text-gray-900`}>
                                                {q.questionText}
                                                {q.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                                            </label>
                                        </div>
                                        {renderQuestionInput(q, hasError)}
                                    </div>
                                );
                            })}

                            {/* Unified Submit Bar */}
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] ${
                                        isPillButton ? 'rounded-full' : 'rounded-xl'
                                    }`}
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{form.branding?.submitButtonText || 'Submit Response'}</span>
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* MULTI-CARD / MINIMAL-CARDS PRESENTATION MODE */
                    <>
                        {showHeader && (
                            <div className={`bg-white border border-gray-200/80 shadow-2xs p-5 sm:p-6 space-y-2.5 flex flex-col ${headerAlignClass} ${cardRadius}`}>
                                <div className={`flex items-center gap-2.5 ${headerAlignment === 'center' ? 'justify-center' : ''}`}>
                                    {form.branding?.logoUrl ? (
                                        <img src={form.branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg border border-gray-100 p-0.5" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs" style={{ backgroundColor: primaryColor }}>
                                            {form.title?.charAt(0) || 'F'}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">
                                            {form.branding?.companyName || 'Admissions Desk'}
                                        </h4>
                                        {form.branding?.tagline && (
                                            <p className="text-[10px] font-semibold" style={{ color: primaryColor }}>
                                                {form.branding.tagline}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h1 className={`${titleSizeClass} font-black text-gray-950 tracking-tight`}>
                                        {form.title}
                                    </h1>
                                    {form.description && (
                                        <p className="text-xs text-gray-500 leading-relaxed pt-1">
                                            {form.description}
                                        </p>
                                    )}
                                </div>

                                {form.settings?.collectPayment && form.settings?.paymentAmount > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-bold">
                                        <CreditCard size={12} />
                                        <span>Registration Fee: ₹{form.settings.paymentAmount}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {visibleQuestions.map((q, idx) => {
                                const hasError = !!validationErrors[q.id];

                                if (q.type === 'section_header') {
                                    return (
                                        <div key={q.id} className="pt-3 pb-1">
                                            <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2">
                                                <div className="w-1.5 h-3.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700">
                                                    {q.questionText}
                                                </h2>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={q.id}
                                        data-has-error={hasError}
                                        className={`bg-white p-4 sm:p-5 border transition-all duration-200 shadow-2xs space-y-1.5 ${cardRadius} ${
                                            hasError ? 'border-red-400 ring-2 ring-red-400/20 bg-red-50/20' : 'border-gray-200/80 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {numberingStyle !== 'hidden' && (
                                                <span className="text-[11px] font-bold text-gray-400 font-mono">
                                                    {numberingStyle === 'dot' ? '•' : `${idx + 1}.`}
                                                </span>
                                            )}
                                            <h3 className={`${labelSizeClass} font-bold text-gray-900`}>
                                                {q.questionText}
                                                {q.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                                            </h3>
                                        </div>
                                        {renderQuestionInput(q, hasError)}
                                    </div>
                                );
                            })}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] ${
                                        isPillButton ? 'rounded-full' : 'rounded-xl'
                                    }`}
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{form.branding?.submitButtonText || 'Submit Response'}</span>
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Footer Security Badge */}
                {showFooter && (
                    <div className="text-center py-3 text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>Protected by 256-bit SSL Security • Powered by LeadConnect</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen py-6 sm:py-10 px-4 font-sans text-gray-900 transition-colors" style={bgStyle}>
            {/* SPLIT SCREEN LAYOUT MODES */}
            {screenLayout === 'split-left' ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5">
                        {renderSideHero()}
                    </div>
                    <div className="lg:col-span-7">
                        {renderMainForm()}
                    </div>
                </div>
            ) : screenLayout === 'split-right' ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7">
                        {renderMainForm()}
                    </div>
                    <div className="lg:col-span-5">
                        {renderSideHero()}
                    </div>
                </div>
            ) : screenLayout === 'fullscreen-flow' ? (
                <div className="max-w-4xl mx-auto">
                    {renderMainForm()}
                </div>
            ) : (
                /* DEFAULT CENTER FLOATING CANVAS */
                <div className={`${widthClass} mx-auto`}>
                    {renderMainForm()}
                </div>
            )}

            {/* OTP VERIFICATION MODAL */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4 animate-scaleIn">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <ShieldCheck size={28} />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-gray-900">Verify Mobile Number</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                We sent a 4-digit verification OTP code to your number.
                            </p>
                        </div>

                        <input
                            type="text"
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="• • • •"
                            className="w-full text-center text-2xl tracking-[0.5em] font-black py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5B22]"
                        />

                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || otp.length < 4}
                            className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer disabled:opacity-50"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {otpLoading ? 'Verifying...' : 'Confirm & Complete'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading}
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer block mx-auto"
                        >
                            Resend Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
