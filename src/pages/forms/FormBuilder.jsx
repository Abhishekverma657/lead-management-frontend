import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Plus, Trash2, Save, Copy, ArrowLeft, PlusCircle,
    Palette, Settings as SettingsIcon, Eye, Layers, Check, Sparkles,
    Image, Smartphone, Monitor, Tablet, CreditCard, ChevronUp,
    ChevronDown, Upload, X, HelpCircle, FileText, AlignLeft,
    CheckSquare, CircleDot, List, Phone, Mail, Star, Calendar,
    Share2, ExternalLink, ShieldCheck, CheckCircle2, Lock, ArrowRight,
    RefreshCw, Sliders, Zap, Hash, SlidersHorizontal, Globe,
    MapPin, GraduationCap, CheckCheck, Clock3, SplitSquareVertical,
    Type, Wand2, Paintbrush, Sun, Moon, Maximize2, Layout, LayoutTemplate
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createForm, getFormById, updateForm, uploadFormImages, uploadFile } from '../../api/formApi';
import { useAppContext } from '../../context/AppContext';
import FormView from './FormView';

const THEME_PRESETS = [
    {
        id: 'clean-light',
        name: 'Clean SaaS Light',
        category: 'minimal',
        desc: 'Crisp white cards, zinc borders, modern electric blue accent',
        primary: '#2563EB',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A',
        badge: 'Default',
        tag: '⚡ High Clarity',
        gradient: 'from-blue-600 to-indigo-600',
        cardStyle: 'rounded-3xl',
        fontFamily: 'inter',
        bgPattern: 'subtle-grid',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'ocean-indigo',
        name: 'Ocean Indigo Glow',
        category: 'popular',
        desc: 'Deep electric indigo gradient, modern tech aesthetic for tech courses',
        primary: '#4F46E5',
        bg: '#EEF2FF',
        card: '#FFFFFF',
        text: '#1E1B4B',
        badge: 'Popular',
        tag: '🚀 High Conversion',
        gradient: 'from-indigo-600 to-cyan-500',
        cardStyle: 'rounded-3xl',
        fontFamily: 'plus-jakarta',
        bgPattern: 'mesh-gradient',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'emerald-growth',
        name: 'Emerald Mint Growth',
        category: 'popular',
        desc: 'Fresh mint green growth aesthetic optimized for high response rates',
        primary: '#059669',
        bg: '#F0FDF4',
        card: '#FFFFFF',
        text: '#064E3B',
        badge: 'High Conversion',
        tag: '📈 +34% Submissions',
        gradient: 'from-emerald-600 to-teal-500',
        cardStyle: 'rounded-3xl',
        fontFamily: 'outfit',
        bgPattern: 'subtle-grid',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'obsidian-dark',
        name: 'Obsidian Cyber Dark',
        category: 'dark',
        desc: 'High-end dark mode with luminous borders & neon sky cyan accent',
        primary: '#38BDF8',
        bg: '#0B0F19',
        card: '#161F30',
        text: '#F8FAFC',
        badge: 'Dark Mode',
        tag: '🌌 Cyber Neon',
        gradient: 'from-cyan-400 to-blue-500',
        cardStyle: 'rounded-3xl',
        fontFamily: 'space-grotesk',
        bgPattern: 'clean',
        buttonStyle: 'gradient-glow',
        cardElevation: 'glass'
    },
    {
        id: 'sunset-rose',
        name: 'Sunset Coral & Rose',
        category: 'luxury',
        desc: 'Warm coral & violet luxury aesthetic for coaching and admissions',
        primary: '#E11D48',
        bg: '#FFF1F2',
        card: '#FFFFFF',
        text: '#881337',
        badge: 'Vibrant',
        tag: '🌸 Warm & Engaging',
        gradient: 'from-rose-600 to-orange-500',
        cardStyle: 'rounded-3xl',
        fontFamily: 'plus-jakarta',
        bgPattern: 'mesh-gradient',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'amber-luxury',
        name: 'Amber Champagne Gold',
        category: 'luxury',
        desc: 'Warm golden champagne hues for premier academies & test series',
        primary: '#D97706',
        bg: '#FFFBEB',
        card: '#FFFFFF',
        text: '#78350F',
        badge: 'Premier',
        tag: '👑 Royal Academy',
        gradient: 'from-amber-500 to-yellow-600',
        cardStyle: 'rounded-2xl',
        fontFamily: 'playfair',
        bgPattern: 'clean',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'cosmic-violet',
        name: 'Cosmic Royal Violet',
        category: 'popular',
        desc: 'Futuristic royal violet & neon magenta accents for next-gen institutes',
        primary: '#7C3AED',
        bg: '#FAF5FF',
        card: '#FFFFFF',
        text: '#3B0764',
        badge: 'Modern',
        tag: '✨ Ultra Modern',
        gradient: 'from-purple-600 to-pink-500',
        cardStyle: 'rounded-3xl',
        fontFamily: 'outfit',
        bgPattern: 'mesh-gradient',
        buttonStyle: 'gradient-glow',
        cardElevation: 'soft-glow'
    },
    {
        id: 'glass-frosted',
        name: 'Frosted Glassmorphism',
        category: 'minimal',
        desc: 'Translucent glass cards with ambient backlight glow and frosted blur',
        primary: '#0284C7',
        bg: '#F0F9FF',
        card: '#FFFFFF',
        text: '#0C4A6E',
        badge: 'Trending',
        tag: '💎 Aero Glass',
        gradient: 'from-sky-500 to-blue-600',
        cardStyle: 'rounded-3xl',
        fontFamily: 'inter',
        bgPattern: 'glass-blur',
        buttonStyle: 'gradient-glow',
        cardElevation: 'glass'
    },
    {
        id: 'midnight-crimson',
        name: 'Midnight Crimson Void',
        category: 'dark',
        desc: 'Deep luxury dark theme with rich ruby crimson glow for elite programs',
        primary: '#F43F5E',
        bg: '#120D16',
        card: '#1D1424',
        text: '#FFF1F2',
        badge: 'Dark Elite',
        tag: '🔥 Neon Crimson',
        gradient: 'from-rose-500 to-purple-600',
        cardStyle: 'rounded-3xl',
        fontFamily: 'space-grotesk',
        bgPattern: 'clean',
        buttonStyle: 'gradient-glow',
        cardElevation: 'glass'
    },
    {
        id: 'notion-mono',
        name: 'Notion Minimal Slate',
        category: 'minimal',
        desc: 'Clean editorial monochrome design with razor sharp focus on content',
        primary: '#18181B',
        bg: '#FAFAFA',
        card: '#FFFFFF',
        text: '#18181B',
        badge: 'Minimalist',
        tag: '🎯 Focus Mode',
        gradient: 'from-zinc-800 to-zinc-950',
        cardStyle: 'rounded-xl',
        fontFamily: 'inter',
        bgPattern: 'clean',
        buttonStyle: 'solid-vibrant',
        cardElevation: 'minimal'
    }
];

const QUESTION_CATEGORIES = [
    {
        category: 'Text & Information',
        types: [
            { id: 'short_answer', label: 'Short Answer', icon: FileText, desc: 'Single line text input' },
            { id: 'paragraph', label: 'Paragraph Text', icon: AlignLeft, desc: 'Multi-line detailed text' },
            { id: 'number', label: 'Numeric / Count', icon: Hash, desc: 'Marks, rank, age, score' },
            { id: 'section_header', label: 'Section Header', icon: SplitSquareVertical, desc: 'Group & divide questions' }
        ]
    },
    {
        category: 'Choices & Selections',
        types: [
            { id: 'multiple_choice', label: 'Multiple Choice', icon: CircleDot, desc: 'Select single option' },
            { id: 'checkbox', label: 'Checkboxes (Multi)', icon: CheckSquare, desc: 'Select multiple choices' },
            { id: 'dropdown', label: 'Dropdown List', icon: List, desc: 'Compact select menu' },
            { id: 'course_select', label: 'Stream / Exam', icon: GraduationCap, desc: 'JEE, NEET, Board, 10th/12th' }
        ]
    },
    {
        category: 'Contact & Lead Info',
        types: [
            { id: 'phone', label: 'Mobile / WhatsApp', icon: Phone, desc: '10-digit with optional OTP' },
            { id: 'email', label: 'Email Address', icon: Mail, desc: 'Validated email field' },
            { id: 'location', label: 'City & State', icon: MapPin, desc: 'Resident location' },
            { id: 'url', label: 'Website / Social URL', icon: Globe, desc: 'Web links & portfolios' }
        ]
    },
    {
        category: 'Rating & Feedback',
        types: [
            { id: 'rating', label: 'Star Rating (1-5)', icon: Star, desc: '1 to 5 interactive stars' },
            { id: 'scale_10', label: 'NPS Scale (1-10)', icon: Sparkles, desc: 'Likelihood to recommend' },
            { id: 'range_slider', label: 'Budget Slider', icon: SlidersHorizontal, desc: 'Fee / range slider' }
        ]
    },
    {
        category: 'Date, Time & Media',
        types: [
            { id: 'date', label: 'Date Picker', icon: Calendar, desc: 'Calendar date selection' },
            { id: 'time', label: 'Time Slot Picker', icon: Clock3, desc: 'Preferred call/visit time' },
            { id: 'file_upload', label: 'Document / Image Upload', icon: Upload, desc: 'PDF, marksheet, ID cards' },
            { id: 'consent', label: 'WhatsApp Consent', icon: CheckCheck, desc: 'Terms & Opt-in checkbox' }
        ]
    }
];

const ALL_QUESTION_TYPES = QUESTION_CATEGORIES.flatMap(c => c.types);

export default function FormBuilder() {
    const { id } = useParams();
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'design' | 'settings' | 'preview'
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
    const [themeFilter, setThemeFilter] = useState('all'); // 'all' | 'popular' | 'dark' | 'luxury' | 'minimal'
    const [themeInspectorDevice, setThemeInspectorDevice] = useState('desktop'); // 'desktop' | 'mobile'
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);

    const [formData, setFormData] = useState({
        title: 'Untitled Form',
        description: '',
        questions: [],
        isActive: true,
        slug: '',
        images: [],
        branding: {
            companyName: '',
            logoUrl: '',
            tagline: '',
            submitButtonText: 'Submit Response'
        },
        theme: {
            preset: 'clean-light',
            primaryColor: '#2563EB',
            backgroundColor: '#F8FAFC',
            cardStyle: 'rounded-3xl',
            cardElevation: 'soft-glow',
            fontFamily: 'inter',
            bgPattern: 'subtle-grid',
            buttonStyle: 'gradient-glow',
            layoutStyle: 'single-page',
            layoutMode: 'unified-card',
            screenLayout: 'center-floating',
            formAlignment: 'center',
            headerAlignment: 'left',
            fontScale: 'normal',
            formWidth: 'standard',
            formDensity: 'balanced',
            numberingStyle: 'badge',
            sideHero: {
                badgeText: '⚡ Limited Seats Available',
                title: '',
                subtitle: '',
                imageUrl: '',
                features: [],
                showTestimonial: false,
                testimonialQuote: '',
                testimonialAuthor: ''
            }
        },
        settings: {
            verifyPhone: false,
            collectEmail: false,
            limitOneResponse: false,
            collectPayment: false,
            paymentAmount: 0,
            currency: 'INR',
            thankYou: {
                title: 'Thank You!',
                message: 'Your response has been recorded successfully. Our team will get back to you shortly.',
                buttons: [
                    { text: 'Submit Another Response', url: '', style: 'primary' }
                ]
            },
            landingPage: {
                enabled: false,
                bannerImage: '',
                bannerImages: [],
                videoUrl: '',
                content: '',
                ctaTitle: 'Ready to get started?',
                buttonText: 'Proceed to Form'
            }
        }
    });

    useEffect(() => {
        if (!id && (user?.role === 'SUB_ADMIN' || user?.role === 'COUNSELOR')) {
            toast.error("You don't have permission to create new forms");
            navigate('/admin/forms');
            return;
        }
    }, [id, user, navigate]);

    useEffect(() => {
        if (id) {
            fetchForm();
        } else {
            addQuestion('short_answer');
        }
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveForm();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [formData]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            const data = await getFormById(id);
            if (data.success) {
                const normalizedQuestions = (data.data.questions || []).map(q => ({
                    ...q,
                    isActive: q.isActive !== false
                }));

                setFormData(prev => ({
                    ...prev,
                    ...data.data,
                    questions: normalizedQuestions,
                    branding: {
                        companyName: data.data.branding?.companyName || '',
                        logoUrl: data.data.branding?.logoUrl || '',
                        tagline: data.data.branding?.tagline || '',
                        submitButtonText: data.data.branding?.submitButtonText || 'Submit Response'
                    },
                    theme: {
                        preset: data.data.theme?.preset || 'clean-light',
                        primaryColor: data.data.theme?.primaryColor || '#2563EB',
                        backgroundColor: data.data.theme?.backgroundColor || '#F8FAFC',
                        cardStyle: data.data.theme?.cardStyle || 'rounded-3xl',
                        cardElevation: data.data.theme?.cardElevation || 'soft-glow',
                        fontFamily: data.data.theme?.fontFamily || 'inter',
                        bgPattern: data.data.theme?.bgPattern || 'subtle-grid',
                        buttonStyle: data.data.theme?.buttonStyle || 'gradient-glow',
                        layoutStyle: data.data.theme?.layoutStyle || 'single-page',
                        layoutMode: data.data.theme?.layoutMode || 'unified-card',
                        screenLayout: data.data.theme?.screenLayout || 'center-floating',
                        formAlignment: data.data.theme?.formAlignment || 'center',
                        headerAlignment: data.data.theme?.headerAlignment || 'left',
                        fontScale: data.data.theme?.fontScale || 'normal',
                        formWidth: data.data.theme?.formWidth || 'standard',
                        formDensity: data.data.theme?.formDensity || 'balanced',
                        numberingStyle: data.data.theme?.numberingStyle || 'badge',
                        sideHero: {
                            badgeText: data.data.theme?.sideHero?.badgeText || '⚡ Limited Seats Available',
                            title: data.data.theme?.sideHero?.title || '',
                            subtitle: data.data.theme?.sideHero?.subtitle || '',
                            imageUrl: data.data.theme?.sideHero?.imageUrl || '',
                            features: data.data.theme?.sideHero?.features || [],
                            showTestimonial: data.data.theme?.sideHero?.showTestimonial || false,
                            testimonialQuote: data.data.theme?.sideHero?.testimonialQuote || '',
                            testimonialAuthor: data.data.theme?.sideHero?.testimonialAuthor || ''
                        },
                        ...(data.data.theme || {})
                    },
                    settings: {
                        ...formData.settings,
                        ...(data.data.settings || {}),
                        thankYou: {
                            title: data.data.settings?.thankYou?.title || 'Thank You!',
                            message: data.data.settings?.thankYou?.message || 'Your response has been recorded successfully.',
                            buttons: data.data.settings?.thankYou?.buttons?.length ? data.data.settings.thankYou.buttons : [
                                { text: 'Submit Another Response', url: '', style: 'primary' }
                            ]
                        }
                    }
                }));
            } else {
                toast.error('Failed to load form');
                navigate('/admin/forms');
            }
        } catch (error) {
            toast.error('Error fetching form details');
        } finally {
            setLoading(false);
        }
    };

    const updateFormHeader = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const updateBranding = (key, value) => {
        setFormData(prev => ({
            ...prev,
            branding: { ...prev.branding, [key]: value }
        }));
    };

    const updateTheme = (key, value) => {
        setFormData(prev => ({
            ...prev,
            theme: { ...prev.theme, [key]: value }
        }));
    };

    const applyThemePreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                preset: preset.id,
                primaryColor: preset.primary,
                backgroundColor: preset.bg,
                cardStyle: preset.cardStyle || prev.theme?.cardStyle || 'rounded-3xl',
                fontFamily: preset.fontFamily || prev.theme?.fontFamily || 'inter',
                bgPattern: preset.bgPattern || prev.theme?.bgPattern || 'subtle-grid',
                buttonStyle: preset.buttonStyle || prev.theme?.buttonStyle || 'gradient-glow',
                cardElevation: preset.cardElevation || prev.theme?.cardElevation || 'soft-glow'
            }
        }));
        toast.success(`Applied ${preset.name} Theme`);
    };

    const updateSettings = (key, value) => {
        setFormData(prev => ({
            ...prev,
            settings: { ...prev.settings, [key]: value }
        }));
    };

    const updateThankYou = (key, value) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                thankYou: { ...prev.settings.thankYou, [key]: value }
            }
        }));
    };

    const addQuestion = (type = 'short_answer') => {
        const newId = Date.now().toString();
        let defaultTitle = 'Question Title';
        let defaultOptions = ['Option 1', 'Option 2', 'Option 3'];

        switch (type) {
            case 'short_answer':
                defaultTitle = 'Student Full Name';
                break;
            case 'paragraph':
                defaultTitle = 'Detailed Query / Address';
                break;
            case 'number':
                defaultTitle = 'Current Class Percentage / Marks';
                break;
            case 'section_header':
                defaultTitle = 'Personal & Academic Details';
                break;
            case 'phone':
                defaultTitle = 'WhatsApp / Contact Number';
                break;
            case 'email':
                defaultTitle = 'Email Address';
                break;
            case 'location':
                defaultTitle = 'City & State';
                break;
            case 'url':
                defaultTitle = 'Website / Portfolio Link';
                break;
            case 'multiple_choice':
                defaultTitle = 'Preferred Batch Timing';
                defaultOptions = ['Morning (8:00 AM - 12:00 PM)', 'Evening (4:00 PM - 8:00 PM)', 'Weekend Special Batch'];
                break;
            case 'checkbox':
                defaultTitle = 'Subjects of Interest';
                defaultOptions = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
                break;
            case 'dropdown':
                defaultTitle = 'Select Current Class';
                defaultOptions = ['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th', 'Target Dropper'];
                break;
            case 'course_select':
                defaultTitle = 'Target Competitive Exam';
                defaultOptions = ['JEE (Main + Advanced)', 'NEET (Medical Entrance)', 'Foundation (Olympiads/NTSE)', 'Board Booster Program'];
                break;
            case 'rating':
                defaultTitle = 'How was your consultation experience?';
                break;
            case 'scale_10':
                defaultTitle = 'On a scale of 1-10, how likely are you to recommend Testly?';
                break;
            case 'range_slider':
                defaultTitle = 'Expected Course Fee Budget (INR)';
                break;
            case 'date':
                defaultTitle = 'Preferred Admission / Visit Date';
                break;
            case 'time':
                defaultTitle = 'Best Time to Call';
                break;
            case 'file_upload':
                defaultTitle = 'Upload Marksheet / ID Proof';
                break;
            case 'consent':
                defaultTitle = 'I authorize receiving course schedules & scholarship alerts via WhatsApp & SMS.';
                break;
            default:
                defaultTitle = 'Question Title';
        }

        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: newId,
                    type,
                    questionText: defaultTitle,
                    options: defaultOptions,
                    required: type !== 'section_header' && type !== 'url',
                    isActive: true,
                    isStudentName: prev.questions.length === 0,
                    isPrimaryPhone: type === 'phone',
                    isPrimaryEmail: type === 'email',
                    logic: {}
                }
            ]
        }));
        setExpandedQuestionId(newId);
        toast.success(`Added ${ALL_QUESTION_TYPES.find(t => t.id === type)?.label || 'Question'}`);
    };

    const updateQuestion = (index, key, value) => {
        setFormData(prev => {
            let newQuestions = [...prev.questions];
            if (key === 'isStudentName' && value === true) {
                newQuestions = newQuestions.map((q, i) => ({
                    ...q,
                    isStudentName: i === index
                }));
            } else if (key === 'isPrimaryPhone' && value === true) {
                newQuestions = newQuestions.map((q, i) => ({
                    ...q,
                    isPrimaryPhone: i === index
                }));
            } else if (key === 'isPrimaryEmail' && value === true) {
                newQuestions = newQuestions.map((q, i) => ({
                    ...q,
                    isPrimaryEmail: i === index
                }));
            } else {
                newQuestions[index] = { ...newQuestions[index], [key]: value };
            }
            return { ...prev, questions: newQuestions };
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = [...formData.questions];
        newQuestions.splice(index, 1);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
        toast.success('Question removed');
    };

    const duplicateQuestion = (index) => {
        const newQuestions = [...formData.questions];
        const qToCopy = { ...newQuestions[index], id: Date.now().toString() };
        newQuestions.splice(index + 1, 0, qToCopy);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
        toast.success('Question duplicated');
    };

    const moveQuestion = (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= formData.questions.length) return;
        const newQuestions = [...formData.questions];
        const [movedItem] = newQuestions.splice(index, 1);
        newQuestions.splice(targetIndex, 0, movedItem);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addOption = (qIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options.push(`Option ${newQuestions[qIndex].options.length + 1}`);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex, oIndex, val) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = val;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addConditionalQuestion = (parentIndex, optionValue) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            const parentQ = newQuestions[parentIndex];
            const newId = Date.now().toString();
            const newQ = {
                id: newId,
                type: 'short_answer',
                questionText: `Details for ${optionValue}`,
                options: ['Option 1'],
                required: false,
                logic: {
                    targetQuestionId: parentQ.id,
                    targetValue: optionValue,
                    condition: 'equals'
                },
                isActive: true
            };
            newQuestions.splice(parentIndex + 1, 0, newQ);
            return { ...prev, questions: newQuestions };
        });
        toast.success(`Added follow-up question linked to "${optionValue}"`);
    };

    const updateSideHero = (key, value) => {
        setFormData(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                sideHero: {
                    ...(prev.theme?.sideHero || {}),
                    [key]: value
                }
            }
        }));
    };

    const handleSideHeroImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading('Uploading hero banner image...');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const res = await uploadFile(reader.result);
                if (res.success && res.url) {
                    updateSideHero('imageUrl', res.url);
                    toast.success('Hero image uploaded successfully!', { id: loadingToast });
                } else {
                    toast.error('Failed to upload hero image', { id: loadingToast });
                }
            };
        } catch (err) {
            console.error('Hero image upload error:', err);
            toast.error('Upload failed', { id: loadingToast });
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading('Uploading brand logo...');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const res = await uploadFile(reader.result);
                if (res.success && res.url) {
                    updateBranding('logoUrl', res.url);
                    toast.success('Logo uploaded successfully!', { id: loadingToast });
                } else {
                    toast.error('Failed to upload logo', { id: loadingToast });
                }
            };
        } catch (err) {
            console.error('Logo upload error:', err);
            toast.error('Upload failed', { id: loadingToast });
        }
    };

    const handleBannerUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const loadingToast = toast.loading(`Uploading ${files.length} banner(s)...`);
        try {
            const base64Images = await Promise.all(
                files.map(file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }))
            );

            const response = await uploadFormImages(base64Images);
            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...(response.imageUrls || [])]
                }));
                toast.success('Banners uploaded successfully!', { id: loadingToast });
            } else {
                toast.error('Failed to upload banners', { id: loadingToast });
            }
        } catch (err) {
            console.error('Banner upload error:', err);
            toast.error('Error uploading banners', { id: loadingToast });
        }
    };

    const removeBanner = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        toast.success('Banner removed');
    };

    const saveForm = async () => {
        if (!formData.title.trim()) {
            return toast.error("Form title is required");
        }

        try {
            setLoading(true);
            const payload = { ...formData };
            if (!payload.slug || !payload.slug.trim()) {
                delete payload.slug;
            }

            payload.questions = (payload.questions || []).map(q => ({
                ...q,
                isActive: q.isActive !== false
            }));

            let response;
            if (id) {
                response = await updateForm(id, payload);
            } else {
                response = await createForm(payload);
            }

            if (response.success) {
                toast.success(id ? 'Form updated successfully!' : 'Form created successfully!');
                navigate('/admin/forms');
            } else {
                toast.error(response.message || 'Failed to save form');
            }
        } catch (error) {
            console.error('Save Form Error:', error);
            toast.error(error.response?.data?.message || 'Error saving form');
        } finally {
            setLoading(false);
        }
    };

    const publicUrl = formData.slug 
        ? `${window.location.origin}/form/${formData.slug}`
        : (id ? `${window.location.origin}/forms/view/${id}` : '');

    const copyPublicUrl = () => {
        if (!publicUrl) {
            toast.error('Save the form first to generate link');
            return;
        }
        navigator.clipboard.writeText(publicUrl);
        toast.success('Public form link copied to clipboard!');
    };

    if (loading && id && formData.questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-[#FF5B22] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-62px)] flex flex-col font-sans text-gray-900 overflow-hidden px-3 sm:px-6 pt-3 pb-2 max-w-7xl mx-auto w-full">
            {/* Top Sleek Studio Header */}
            <header className="shrink-0 z-40 bg-white/95 backdrop-blur-xl border border-gray-200/80 py-2.5 px-4 sm:px-6 mb-3 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/forms')}
                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition cursor-pointer"
                        title="Back to Forms"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateFormHeader('title', e.target.value)}
                                className="font-bold text-gray-900 text-base sm:text-lg focus:outline-none focus:bg-gray-50 px-1.5 py-0.5 rounded-lg border border-transparent focus:border-gray-300 transition max-w-[280px] sm:max-w-md truncate"
                                placeholder="Form Name..."
                            />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5B22] uppercase tracking-wider">
                                {id ? 'Editing' : 'New Form'}
                            </span>
                        </div>
                        {formData.slug && (
                            <p className="text-[11px] font-mono text-gray-400 pl-1.5">
                                /form/{formData.slug}
                            </p>
                        )}
                    </div>
                </div>

                {/* Studio Navigation Tabs */}
                <div className="flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/80 overflow-x-auto self-center md:self-auto">
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'builder' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Layers size={14} className={activeTab === 'builder' ? 'text-[#FF5B22]' : ''} />
                        Questions ({formData.questions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('design')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'design' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Palette size={14} className={activeTab === 'design' ? 'text-[#FF5B22]' : ''} />
                        Theme & Studio
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'settings' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <SettingsIcon size={14} className={activeTab === 'settings' ? 'text-[#FF5B22]' : ''} />
                        Settings & Flow
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Eye size={14} className={activeTab === 'preview' ? 'text-[#FF5B22]' : ''} />
                        Live Simulator
                    </button>
                </div>

                {/* Right Action Bar */}
                <div className="flex items-center gap-2 justify-end">
                    {publicUrl && (
                        <button
                            onClick={copyPublicUrl}
                            className="p-2 text-gray-600 hover:text-[#FF5B22] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                            title="Copy Public Link"
                        >
                            <Share2 size={16} />
                        </button>
                    )}

                    {/* Status Pill */}
                    <button
                        onClick={() => updateFormHeader('isActive', !formData.isActive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            formData.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {formData.isActive ? 'Accepting Responses' : 'Form Paused'}
                    </button>

                    <button
                        onClick={saveForm}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#FF5B22] hover:bg-[#EA580C] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loading ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </header>

            {/* TAB 1: FORM BUILDER */}
            {activeTab === 'builder' && (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
                    {/* Left Independently Scrollable & Fixed Tool Palette Sidebar */}
                    <div className="lg:col-span-4 h-full overflow-y-auto pr-1.5 space-y-3.5 pb-8">
                        {/* Categorized Elements Palette */}
                        <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-2xs space-y-3.5">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-[#FF5B22]" />
                                    Elements Palette
                                </h3>
                                <span className="text-[10px] text-gray-400 font-bold">{ALL_QUESTION_TYPES.length} Tools</span>
                            </div>

                            {QUESTION_CATEGORIES.map((cat, cIdx) => (
                                <div key={cIdx} className="space-y-1.5">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 pl-1">
                                        {cat.category}
                                    </div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {cat.types.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => addQuestion(type.id)}
                                                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-orange-50/70 border border-transparent hover:border-orange-200 text-left transition group cursor-pointer"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-orange-100 group-hover:text-[#FF5B22] text-gray-600 flex items-center justify-center shrink-0 transition">
                                                        <Icon size={15} />
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <div className="text-xs font-bold text-gray-800 group-hover:text-[#FF5B22] truncate">{type.label}</div>
                                                        <div className="text-[10px] text-gray-400 truncate">{type.desc}</div>
                                                    </div>
                                                    <Plus size={13} className="text-gray-300 group-hover:text-[#FF5B22] shrink-0" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CRM Lead Auto-Mapping Info */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 text-xs space-y-2">
                            <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                                <Zap size={14} className="text-blue-600" />
                                Instant CRM Sync
                            </h4>
                            <p className="text-blue-700 text-[11px] leading-relaxed">
                                Questions marked with <span className="font-bold">Student Name</span>, <span className="font-bold">Lead Phone</span>, or <span className="font-bold">Lead Email</span> automatically create new leads into your CRM pipeline on form submission.
                            </p>
                        </div>
                    </div>

                    {/* Center Main Question Stream (Independently Scrollable) */}
                    <div className="lg:col-span-8 h-full overflow-y-auto pr-1.5 pb-20 space-y-4 min-w-0">
                        {/* Form Welcome Header Card */}
                        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs relative overflow-hidden space-y-4">
                            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: formData.theme?.primaryColor || '#FF5B22' }}></div>
                            
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    className="w-full text-2xl font-black text-gray-900 placeholder:text-gray-300 focus:outline-none border-b border-transparent focus:border-gray-200 py-1 transition"
                                    placeholder="Enter Form Title..."
                                    value={formData.title}
                                    onChange={(e) => updateFormHeader('title', e.target.value)}
                                />

                                <textarea
                                    className="w-full text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none border-b border-transparent focus:border-gray-200 py-1 resize-none transition"
                                    placeholder="Add welcoming description or instructions for your students/leads..."
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => updateFormHeader('description', e.target.value)}
                                />
                            </div>

                            {/* Header Banner Carousel Section */}
                            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <Image size={14} className="text-[#FF5B22]" />
                                        Header Banners Carousel
                                    </span>
                                    <span className="text-[11px] text-gray-400">Upload promotional banners displayed at the top</span>
                                </div>
                                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-gray-700 hover:text-[#FF5B22] text-xs font-bold cursor-pointer transition">
                                    <Upload size={13} />
                                    <span>Upload Banner(s)</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleBannerUpload} />
                                </label>
                            </div>

                            {formData.images?.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                                            <img src={img} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeBanner(idx)}
                                                className="absolute top-1.5 right-1.5 bg-gray-900/80 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                                title="Remove Banner"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4">
                            {formData.questions.map((q, qIndex) => {
                                const isExpanded = expandedQuestionId === (q.id || qIndex);
                                const qTypeObj = ALL_QUESTION_TYPES.find(t => t.id === q.type) || ALL_QUESTION_TYPES[0];
                                const TypeIcon = qTypeObj.icon;

                                if (q.type === 'section_header') {
                                    return (
                                        <div
                                            key={q.id || qIndex}
                                            className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/80 rounded-2xl border-2 border-orange-200 p-4 shadow-2xs flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <SplitSquareVertical size={18} className="text-[#FF5B22] shrink-0" />
                                                <input
                                                    type="text"
                                                    value={q.questionText}
                                                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                                    placeholder="Section Header Title..."
                                                    className="w-full font-black text-sm text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-[#FF5B22]"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => moveQuestion(qIndex, 'up')}
                                                    disabled={qIndex === 0}
                                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-white cursor-pointer"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => moveQuestion(qIndex, 'down')}
                                                    disabled={qIndex === formData.questions.length - 1}
                                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-white cursor-pointer"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button
                                                    onClick={() => removeQuestion(qIndex)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={q.id || qIndex}
                                        className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs ${
                                            q.isActive === false ? 'opacity-60 bg-gray-50/50 border-dashed border-gray-300' :
                                            isExpanded ? 'border-[#FF5B22] ring-2 ring-orange-500/10' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Question Card Header */}
                                        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-gray-100/80 bg-gray-50/40 rounded-t-2xl">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="w-7 h-7 rounded-xl bg-orange-100/80 text-[#FF5B22] text-xs font-black flex items-center justify-center shrink-0">
                                                    {qIndex + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        className="w-full font-bold text-sm text-gray-900 focus:outline-none focus:bg-white px-2 py-1 rounded-lg border border-transparent focus:border-gray-300 transition"
                                                        placeholder="Type question here..."
                                                        value={q.questionText}
                                                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Type selector & Card Tools */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <select
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                    className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FF5B22] cursor-pointer"
                                                >
                                                    {ALL_QUESTION_TYPES.map(t => (
                                                        <option key={t.id} value={t.id}>{t.label}</option>
                                                    ))}
                                                </select>

                                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
                                                    <button
                                                        onClick={() => moveQuestion(qIndex, 'up')}
                                                        disabled={qIndex === 0}
                                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                                                        title="Move Up"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveQuestion(qIndex, 'down')}
                                                        disabled={qIndex === formData.questions.length - 1}
                                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                                                        title="Move Down"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => duplicateQuestion(qIndex)}
                                                    className="p-1.5 text-gray-400 hover:text-[#FF5B22] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                                                    title="Duplicate Question"
                                                >
                                                    <Copy size={15} />
                                                </button>

                                                <button
                                                    onClick={() => removeQuestion(qIndex)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                                    title="Delete Question"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Question Card Body */}
                                        <div className="p-4 sm:p-5 space-y-4">
                                            {/* MCQ / Checkbox / Dropdown / Course Select Option Manager */}
                                            {['multiple_choice', 'checkbox', 'dropdown', 'course_select'].includes(q.type) && (
                                                <div className="space-y-2.5">
                                                    <div className="text-xs font-bold text-gray-600 flex items-center justify-between">
                                                        <span>Answer Choices ({q.options?.length || 0})</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(q.options || []).map((opt, oIdx) => (
                                                            <div key={oIdx} className="flex items-center gap-2 group">
                                                                <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                                                                    {oIdx + 1}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(qIndex, oIdx, e.target.value)}
                                                                    className="flex-1 text-xs font-medium text-gray-800 bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF5B22] transition"
                                                                    placeholder={`Option ${oIdx + 1}`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addConditionalQuestion(qIndex, opt)}
                                                                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1.5 rounded-lg font-bold border border-blue-100 opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center gap-1 shrink-0"
                                                                    title="Add child question when this option is selected"
                                                                >
                                                                    <Plus size={12} /> Follow-up
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeOption(qIndex, oIdx)}
                                                                    disabled={q.options.length <= 1}
                                                                    className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-0 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addOption(qIndex)}
                                                        className="text-xs font-bold text-[#FF5B22] hover:text-[#EA580C] flex items-center gap-1.5 pt-1 cursor-pointer"
                                                    >
                                                        <PlusCircle size={14} /> Add Another Choice
                                                    </button>
                                                </div>
                                            )}

                                            {/* Rating Previews */}
                                            {q.type === 'rating' && (
                                                <div className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                                                    <div className="flex items-center gap-1 text-amber-400">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={20} fill="#FBBF24" />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-semibold text-amber-900 ml-2">Interactive 5-star rating scale</span>
                                                </div>
                                            )}

                                            {q.type === 'scale_10' && (
                                                <div className="flex items-center gap-1 p-3 bg-purple-50/60 rounded-xl border border-purple-100 overflow-x-auto">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                        <span key={num} className="w-7 h-7 rounded-lg bg-white border border-purple-200 text-purple-800 font-black text-xs flex items-center justify-center">
                                                            {num}
                                                        </span>
                                                    ))}
                                                    <span className="text-xs font-semibold text-purple-900 ml-2">NPS 1-10 Scale</span>
                                                </div>
                                            )}

                                            {q.type === 'range_slider' && (
                                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                                                    <SlidersHorizontal size={16} />
                                                    <span>Interactive range & budget slider (₹0 - ₹2,00,000+)</span>
                                                </div>
                                            )}

                                            {q.type === 'consent' && (
                                                <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <CheckCheck size={16} className="text-emerald-600" />
                                                    <span>Includes checkbox for WhatsApp admission updates & Terms acceptance.</span>
                                                </div>
                                            )}

                                            {/* Question Footer: Lead Mapping & Logic Badges */}
                                            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                                {/* Left: CRM Mapping Pills */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-bold text-gray-400">CRM Auto-Map:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'isStudentName', !q.isStudentName)}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                            q.isStudentName ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        👤 Lead Name
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'isPrimaryPhone', !q.isPrimaryPhone)}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                            q.isPrimaryPhone ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        📞 Lead Phone
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'isPrimaryEmail', !q.isPrimaryEmail)}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                            q.isPrimaryEmail ? 'bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-400/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        ✉️ Lead Email
                                                    </button>
                                                </div>

                                                {/* Right: Required & Active toggles */}
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={q.required || false}
                                                            onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                                            className="w-4 h-4 rounded text-[#FF5B22] focus:ring-[#FF5B22] border-gray-300 cursor-pointer"
                                                        />
                                                        <span>Required</span>
                                                    </label>

                                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={q.isActive !== false}
                                                            onChange={(e) => updateQuestion(qIndex, 'isActive', e.target.checked)}
                                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                                        />
                                                        <span>Visible</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Branching Logic Indicator */}
                                            {q.logic?.targetQuestionId && (
                                                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        ⚡ Shows conditionally when parent choice is <b>"{q.logic.targetValue}"</b>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'logic', {})}
                                                        className="text-blue-600 hover:text-red-600 text-[11px] font-bold cursor-pointer"
                                                    >
                                                        Remove Logic
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Add Question Button */}
                        <button
                            type="button"
                            onClick={() => addQuestion('short_answer')}
                            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-[#FF5B22] hover:bg-orange-50/40 rounded-2xl text-gray-600 hover:text-[#FF5B22] font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <PlusCircle size={18} />
                            <span>Add New Question</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 2: THEME & DESIGN STUDIO */}
            {activeTab === 'design' && (
                <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-20 space-y-6">
                    {/* Top Presets Showcase with Filter Pills */}
                    <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#FF5B22] flex items-center justify-center">
                                        <Wand2 size={18} />
                                    </div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">
                                        Visual Theme Presets
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5B22] px-2.5 py-0.5 rounded-full">
                                        10 Presets
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Pick a pre-configured harmonious visual identity or fine-tune custom typography, colors, and shadows below.
                                </p>
                            </div>

                            {/* Preset Filter Tabs */}
                            <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
                                {[
                                    { id: 'all', label: 'All Presets' },
                                    { id: 'popular', label: '🚀 High Conversion' },
                                    { id: 'dark', label: '🌙 Dark Mode' },
                                    { id: 'luxury', label: '👑 Premier & Luxury' },
                                    { id: 'minimal', label: '🌿 Clean Minimal' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setThemeFilter(tab.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                                            themeFilter === tab.id
                                                ? 'bg-white text-gray-900 shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {THEME_PRESETS
                                .filter(preset => themeFilter === 'all' || preset.category === themeFilter)
                                .map((preset) => {
                                    const isSelected = formData.theme?.preset === preset.id;
                                    return (
                                        <div
                                            key={preset.id}
                                            onClick={() => applyThemePreset(preset)}
                                            className={`group p-4 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
                                                isSelected 
                                                    ? 'border-[#FF5B22] bg-orange-50/20 shadow-md ring-2 ring-orange-500/20' 
                                                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-gray-900 line-clamp-1">{preset.name}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        isSelected ? 'bg-orange-100 text-[#FF5B22]' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {preset.badge}
                                                    </span>
                                                </div>

                                                {/* Realistic Micro-Form Preview Illustration */}
                                                <div 
                                                    className="rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs space-y-2.5 transition group-hover:scale-[1.02]"
                                                    style={{ backgroundColor: preset.bg }}
                                                >
                                                    {/* Mini Header Card */}
                                                    <div 
                                                        className="rounded-xl p-2 border border-gray-200/70 shadow-2xs space-y-1"
                                                        style={{ backgroundColor: preset.card }}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: preset.primary }}></div>
                                                            <div className="h-1.5 w-14 bg-gray-300/80 rounded-full"></div>
                                                        </div>
                                                        <div className="h-1 w-20 bg-gray-200 rounded-full"></div>
                                                    </div>

                                                    {/* Mini Question Field Card */}
                                                    <div 
                                                        className="rounded-xl p-2 border border-gray-200/70 shadow-2xs space-y-1.5"
                                                        style={{ backgroundColor: preset.card }}
                                                    >
                                                        <div className="h-1.5 w-16 bg-gray-300/80 rounded-full"></div>
                                                        <div className="h-4 bg-gray-100/70 rounded-lg border border-gray-200/60 flex items-center px-1.5">
                                                            <div className="h-1 w-8 bg-gray-300/60 rounded-full"></div>
                                                        </div>
                                                    </div>

                                                    {/* Mini Submit Button */}
                                                    <div 
                                                        className="w-full py-1.5 rounded-lg text-center font-bold text-[9px] text-white shadow-xs transition"
                                                        style={{ backgroundColor: preset.primary }}
                                                    >
                                                        Submit Response
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                                                        {preset.tag}
                                                    </span>
                                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mt-1.5">{preset.desc}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-4 h-4 rounded-full border border-gray-200 shadow-2xs" style={{ backgroundColor: preset.primary }} title="Primary Accent"></div>
                                                    <div className="w-4 h-4 rounded-full border border-gray-200 shadow-2xs" style={{ backgroundColor: preset.bg }} title="Background Tint"></div>
                                                    <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">{preset.primary}</span>
                                                </div>
                                                {isSelected ? (
                                                    <span className="text-[11px] font-bold text-[#FF5B22] flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-lg">
                                                        <Check size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-900 transition">Apply</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Studio Customization Grid & Live Inspector */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Custom Controls (8 cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Form Presentation Architecture & Layout Engine */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                        <LayoutTemplate size={16} className="text-[#FF5B22]" />
                                        Form Presentation Architecture & Canvas Layout
                                    </h4>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5B22] px-2.5 py-0.5 rounded-full">
                                        Layout Engine
                                    </span>
                                </div>

                                {/* 1. Screen Composition & Page Layout */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-gray-700 block">Screen Presentation & Composition</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[
                                            { 
                                                id: 'center-floating', 
                                                label: 'Centered Canvas', 
                                                desc: 'Floating centered box with ambient background (Standard)',
                                                badge: 'Default'
                                            },
                                            { 
                                                id: 'split-left', 
                                                label: 'Split: Left Hero', 
                                                desc: 'Marketing hero banner on left, form on right (High Conversion)',
                                                badge: 'Split Screen'
                                            },
                                            { 
                                                id: 'split-right', 
                                                label: 'Split: Right Hero', 
                                                desc: 'Form on left, marketing hero banner on right',
                                                badge: 'Split Screen'
                                            },
                                            { 
                                                id: 'fullscreen-flow', 
                                                label: 'Full-Screen Flow', 
                                                desc: 'Edge-to-edge full width modern page layout',
                                                badge: 'Full Page'
                                            },
                                        ].map(item => {
                                            const isSelected = (formData.theme?.screenLayout || 'center-floating') === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => updateTheme('screenLayout', item.id)}
                                                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                                                        isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-gray-900">{item.label}</span>
                                                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-1 leading-snug">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 1.1 Side Hero Configuration Studio (visible when split screen is selected) */}
                                {(formData.theme?.screenLayout === 'split-left' || formData.theme?.screenLayout === 'split-right') && (
                                    <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-200/80 space-y-4 animate-fadeIn">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                                                <Sparkles size={14} className="text-[#FF5B22]" />
                                                Side Screen Hero Studio (Marketing & Social Proof)
                                            </h5>
                                            <span className="text-[9px] font-bold bg-orange-100 text-[#FF5B22] px-2 py-0.5 rounded-full">
                                                Side Hero Customizer
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-700 block mb-1">Hero Pill Badge</label>
                                                <input
                                                    type="text"
                                                    value={formData.theme?.sideHero?.badgeText || '⚡ Limited Seats Available'}
                                                    onChange={(e) => updateSideHero('badgeText', e.target.value)}
                                                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                                    placeholder="e.g. ⚡ Limited Seats Available"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-gray-700 block mb-1">Hero Main Headline</label>
                                                <input
                                                    type="text"
                                                    value={formData.theme?.sideHero?.title || ''}
                                                    onChange={(e) => updateSideHero('title', e.target.value)}
                                                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                                    placeholder={formData.title || 'Admissions & Enrollment'}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block mb-1">Hero Subtitle / Value Pitch</label>
                                            <textarea
                                                rows={2}
                                                value={formData.theme?.sideHero?.subtitle || ''}
                                                onChange={(e) => updateSideHero('subtitle', e.target.value)}
                                                className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22] resize-none"
                                                placeholder={formData.description || 'Fill out the simple form to connect with our dedicated team.'}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-700 block mb-1">Hero Graphic / Photo URL</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={formData.theme?.sideHero?.imageUrl || ''}
                                                        onChange={(e) => updateSideHero('imageUrl', e.target.value)}
                                                        className="flex-1 text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                                        placeholder="https://... or upload"
                                                    />
                                                    <label className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-700 text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1">
                                                        <Upload size={12} />
                                                        <span>Upload</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleSideHeroImageUpload} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-gray-700 block mb-1">Social Proof / Testimonial Quote</label>
                                                <input
                                                    type="text"
                                                    value={formData.theme?.sideHero?.testimonialQuote || ''}
                                                    onChange={(e) => {
                                                        updateSideHero('testimonialQuote', e.target.value);
                                                        updateSideHero('showTestimonial', !!e.target.value);
                                                    }}
                                                    className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                                    placeholder="e.g. Best coaching experience! - AIR 45"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Form Presentation Style */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-700 block">Form Presentation Style</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { 
                                                id: 'unified-card', 
                                                label: 'Unified Cohesive Card', 
                                                desc: 'Single sleek continuous container with clean dividers (Recommended)',
                                                badge: 'Modern'
                                            },
                                            { 
                                                id: 'minimal-cards', 
                                                label: 'Modular Floating Cards', 
                                                desc: 'Independent floating cards per question with subtle elevation',
                                                badge: 'Modular'
                                            },
                                            { 
                                                id: 'linear-doc', 
                                                label: 'Linear Document Flow', 
                                                desc: 'Ultra-minimal Notion/Linear style flat layout with hairline lines',
                                                badge: 'Clean'
                                            },
                                        ].map(item => {
                                            const isSelected = (formData.theme?.layoutMode || 'unified-card') === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => updateTheme('layoutMode', item.id)}
                                                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                                                        isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-gray-900">{item.label}</span>
                                                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-1 leading-snug">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Alignment & Dimensions Controls */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    {/* Top Row: Header Alignment & Typography Scale (2 Columns) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Header Alignment */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 block">Header Alignment</label>
                                            <div className="grid grid-cols-2 gap-1 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/50">
                                                {[
                                                    { id: 'left', label: 'Left Aligned' },
                                                    { id: 'center', label: 'Center Aligned' },
                                                ].map(a => (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        onClick={() => updateTheme('headerAlignment', a.id)}
                                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                                                            (formData.theme?.headerAlignment || 'left') === a.id
                                                                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {a.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Font Scaling */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 block">Font Scale Size</label>
                                            <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/50">
                                                {[
                                                    { id: 'compact', label: 'Compact' },
                                                    { id: 'normal', label: 'Balanced' },
                                                    { id: 'large', label: 'Large' },
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        type="button"
                                                        onClick={() => updateTheme('fontScale', f.id)}
                                                        className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                                                            (formData.theme?.fontScale || 'normal') === f.id
                                                                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Canvas Width, Density, Numbering Style (3 Columns) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Form Container Width */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 block">Canvas Width</label>
                                            <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/50">
                                                {[
                                                    { id: 'compact', label: 'Compact' },
                                                    { id: 'standard', label: 'Standard' },
                                                    { id: 'wide', label: 'Wide' },
                                                ].map(w => (
                                                    <button
                                                        key={w.id}
                                                        type="button"
                                                        onClick={() => updateTheme('formWidth', w.id)}
                                                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer truncate ${
                                                            (formData.theme?.formWidth || 'standard') === w.id
                                                                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {w.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Form Density */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 block">Vertical Density</label>
                                            <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/50">
                                                {[
                                                    { id: 'compact', label: 'Dense' },
                                                    { id: 'balanced', label: 'Balanced' },
                                                    { id: 'spacious', label: 'Airy' },
                                                ].map(d => (
                                                    <button
                                                        key={d.id}
                                                        type="button"
                                                        onClick={() => updateTheme('formDensity', d.id)}
                                                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer truncate ${
                                                            (formData.theme?.formDensity || 'balanced') === d.id
                                                                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {d.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Question Numbering */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 block">Numbering</label>
                                            <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-2xl border border-gray-200/50">
                                                {[
                                                    { id: 'badge', label: '1, 2, 3' },
                                                    { id: 'dot', label: 'Dot •' },
                                                    { id: 'hidden', label: 'None' },
                                                ].map(n => (
                                                    <button
                                                        key={n.id}
                                                        type="button"
                                                        onClick={() => updateTheme('numberingStyle', n.id)}
                                                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer truncate ${
                                                            (formData.theme?.numberingStyle || 'badge') === n.id
                                                                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                                                                : 'text-gray-500 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {n.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Color Studio & 1-Click Luxury Swatches */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#FF5B22]" />
                                        Curated Luxury Accent Palette
                                    </h4>
                                    <span className="text-[11px] font-mono text-gray-400 font-bold uppercase">{formData.theme?.primaryColor || '#2563EB'}</span>
                                </div>

                                {/* 1-Click Quick Palette Swatches */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600">1-Click Instant Color Switch</label>
                                    <div className="flex items-center flex-wrap gap-2.5 pt-1">
                                        {[
                                            { color: '#FF5B22', name: 'Coral Flame' },
                                            { color: '#2563EB', name: 'Royal Blue' },
                                            { color: '#4F46E5', name: 'Indigo Glow' },
                                            { color: '#059669', name: 'Emerald Mint' },
                                            { color: '#0284C7', name: 'Neon Sky Cyan' },
                                            { color: '#7C3AED', name: 'Cosmic Violet' },
                                            { color: '#E11D48', name: 'Sunset Rose' },
                                            { color: '#D97706', name: 'Amber Gold' },
                                            { color: '#F43F5E', name: 'Ruby Crimson' },
                                            { color: '#0D9488', name: 'Deep Teal' },
                                            { color: '#0F172A', name: 'Slate Midnight' },
                                            { color: '#18181B', name: 'Obsidian Jet' }
                                        ].map(swatch => (
                                            <button
                                                key={swatch.color}
                                                type="button"
                                                onClick={() => updateTheme('primaryColor', swatch.color)}
                                                className={`w-9 h-9 rounded-2xl transition transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs border-2 ${
                                                    formData.theme?.primaryColor === swatch.color ? 'border-gray-900 ring-2 ring-gray-400/40 scale-105' : 'border-white'
                                                }`}
                                                style={{ backgroundColor: swatch.color }}
                                                title={swatch.name}
                                            >
                                                {formData.theme?.primaryColor === swatch.color && <Check size={16} className="text-white drop-shadow-sm" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Primary Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.theme?.primaryColor || '#2563EB'}
                                                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                                                className="w-11 h-11 rounded-2xl border border-gray-200 cursor-pointer p-0.5 shrink-0"
                                            />
                                            <input
                                                type="text"
                                                value={formData.theme?.primaryColor || '#2563EB'}
                                                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                                                className="flex-1 font-mono text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl uppercase font-bold text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Background Canvas Tint</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.theme?.backgroundColor || '#F8FAFC'}
                                                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                                                className="w-11 h-11 rounded-2xl border border-gray-200 cursor-pointer p-0.5 shrink-0"
                                            />
                                            <input
                                                type="text"
                                                value={formData.theme?.backgroundColor || '#F8FAFC'}
                                                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                                                className="flex-1 font-mono text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl uppercase font-bold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Atmosphere & Pattern Engine */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <Layout size={16} className="text-[#FF5B22]" />
                                    Background Atmosphere & Pattern Engine
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'clean', label: 'Clean Smooth', desc: 'Pure minimal solid canvas' },
                                        { id: 'subtle-grid', label: 'Dot Matrix Grid', desc: 'Modern tech subtle graph grid' },
                                        { id: 'mesh-gradient', label: 'Ambient Aura Mesh', desc: 'Fluid colorful glowing backdrop' },
                                        { id: 'glass-blur', label: 'Frosted Glass', desc: 'Aero translucent backdrop effect' },
                                    ].map(item => {
                                        const isSelected = (formData.theme?.bgPattern || 'subtle-grid') === item.id;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => updateTheme('bgPattern', item.id)}
                                                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                                                    isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="text-xs font-black text-gray-900">{item.label}</div>
                                                <div className="text-[10px] text-gray-500 mt-1 leading-snug">{item.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Typography & Font Engine */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <Type size={16} className="text-[#FF5B22]" />
                                    Typography & Font Family
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'inter', name: 'Inter', badge: 'Default SaaS', sample: 'Modern, Crisp & Balanced' },
                                        { id: 'plus-jakarta', name: 'Plus Jakarta Sans', badge: 'Trendy Tech', sample: 'Startups & Modern EdTech' },
                                        { id: 'outfit', name: 'Outfit', badge: 'Geometric Bold', sample: 'High Energy & High Impact' },
                                        { id: 'space-grotesk', name: 'Space Grotesk', badge: 'Cyber Modern', sample: 'Engineering & Coding Vibe' },
                                        { id: 'playfair', name: 'Playfair Display', badge: 'Editorial Serif', sample: 'Luxury, Coaching & Premier' },
                                    ].map(font => {
                                        const isSelected = (formData.theme?.fontFamily || 'inter') === font.id;
                                        return (
                                            <div
                                                key={font.id}
                                                onClick={() => updateTheme('fontFamily', font.id)}
                                                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                                                    isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-gray-900">{font.name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{font.badge}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1 italic">{font.sample}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Card Geometry & 3D Elevation */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={16} className="text-[#FF5B22]" />
                                    Card Geometry & Surface Elevation
                                </h4>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-600 block">Corner Radius Curvature</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'rounded-3xl', label: 'iOS Pill (28px)', sub: 'Ultra Modern Curve' },
                                            { id: 'rounded-2xl', label: 'SaaS Standard (18px)', sub: 'Balanced Modern' },
                                            { id: 'rounded-xl', label: 'Classic Box (12px)', sub: 'Subtle Curvature' },
                                            { id: 'rounded-md', label: 'Sharp Minimal (6px)', sub: 'Sharp Tech Aesthetic' },
                                        ].map(item => {
                                            const isSelected = (formData.theme?.cardStyle || 'rounded-3xl') === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => updateTheme('cardStyle', item.id)}
                                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition ${
                                                        isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="text-xs font-bold text-gray-900">{item.label}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-600 block">Elevation & Shadow Style</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'soft-glow', label: 'Soft 3D Float', sub: 'Deep diffuse ambient shadow' },
                                            { id: 'glass', label: 'Frosted Glass', sub: 'Translucent glassmorphism' },
                                            { id: 'minimal', label: 'Clean Minimal', sub: 'Subtle boundary border' },
                                            { id: 'sharp-border', label: 'High Contrast', sub: 'Solid neo-modern border' },
                                        ].map(item => {
                                            const isSelected = (formData.theme?.cardElevation || 'soft-glow') === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => updateTheme('cardElevation', item.id)}
                                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition ${
                                                        isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="text-xs font-bold text-gray-900">{item.label}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Button & CTA Studio */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <Zap size={16} className="text-[#FF5B22]" />
                                    Submit Button & CTA Studio
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'gradient-glow', label: 'Gradient Shimmer Glow', sub: 'Luminous accent with hover lift' },
                                        { id: 'solid-vibrant', label: 'Solid Flat Vibrant', sub: 'Clean high-contrast flat color' },
                                        { id: 'pill', label: 'Full Rounded Pill', sub: 'Curved capsule button style' },
                                    ].map(btn => {
                                        const isSelected = (formData.theme?.buttonStyle || 'gradient-glow') === btn.id;
                                        return (
                                            <div
                                                key={btn.id}
                                                onClick={() => updateTheme('buttonStyle', btn.id)}
                                                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                                                    isSelected ? 'border-[#FF5B22] bg-orange-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-gray-900">{btn.label}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">{btn.sub}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Quick CTA text suggestions */}
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <label className="text-xs font-bold text-gray-600 block">Suggested High-Conversion CTA Copy</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'Submit Response',
                                            'Book Free Consultation',
                                            'Register for Scholarship',
                                            'Claim Free Trial Demo',
                                            'Enroll Today'
                                        ].map(cta => (
                                            <button
                                                key={cta}
                                                type="button"
                                                onClick={() => updateBranding('submitButtonText', cta)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                    formData.branding?.submitButtonText === cta
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'bg-gray-50 hover:bg-orange-50 text-gray-700 border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                {cta}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Brand Details & Logo */}
                            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#FF5B22]" />
                                    Brand Identity & Header Information
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Company / Academy Name</label>
                                        <input
                                            type="text"
                                            value={formData.branding?.companyName || ''}
                                            onChange={(e) => updateBranding('companyName', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                            placeholder="e.g. Testly Academy"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Tagline / Subtext</label>
                                        <input
                                            type="text"
                                            value={formData.branding?.tagline || ''}
                                            onChange={(e) => updateBranding('tagline', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                            placeholder="e.g. Empowering Next Generation Achievers"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 items-center">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Brand Logo</label>
                                        <div className="flex items-center gap-3">
                                            {formData.branding?.logoUrl ? (
                                                <div className="relative group/logo">
                                                    <div className="w-12 h-12 rounded-2xl border border-gray-200 overflow-hidden bg-white p-1 shrink-0 shadow-2xs">
                                                        <img src={formData.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBranding('logoUrl', '')}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-red-600"
                                                        title="Remove Logo"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                                    <Image size={20} />
                                                </div>
                                            )}
                                            <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 text-gray-700 hover:text-[#FF5B22] text-xs font-bold cursor-pointer transition">
                                                <Upload size={14} />
                                                <span>Upload Logo</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Custom Submit Button Text</label>
                                        <input
                                            type="text"
                                            value={formData.branding?.submitButtonText || 'Submit Response'}
                                            onChange={(e) => updateBranding('submitButtonText', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                            placeholder="e.g. Book Free Consultation"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Live Interactive Theme Inspector (4 cols) */}
                        <div className="lg:col-span-4 space-y-3 sticky top-0">
                            <div className="flex items-center justify-between pl-1">
                                <div className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                    <Eye size={14} className="text-[#FF5B22]" />
                                    Live Studio Inspector
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setThemeInspectorDevice('desktop')}
                                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            themeInspectorDevice === 'desktop' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                        title="Desktop Preview"
                                    >
                                        <Monitor size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setThemeInspectorDevice('mobile')}
                                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            themeInspectorDevice === 'mobile' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                        title="Mobile View"
                                    >
                                        <Smartphone size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Simulated Canvas with dynamic Background Pattern */}
                            <div 
                                className={`p-4 sm:p-5 border border-gray-200/80 shadow-md transition-all duration-300 overflow-hidden ${
                                    themeInspectorDevice === 'mobile' 
                                        ? 'max-w-[320px] mx-auto rounded-[36px] ring-8 ring-gray-900/10' 
                                        : 'rounded-3xl'
                                }`}
                                style={{ 
                                    backgroundColor: formData.theme?.backgroundColor || '#F8FAFC',
                                    ...(formData.theme?.bgPattern === 'subtle-grid' ? {
                                        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                                        backgroundSize: '16px 16px',
                                    } : formData.theme?.bgPattern === 'mesh-gradient' ? {
                                        backgroundImage: `radial-gradient(at 10% 10%, ${formData.theme?.primaryColor || '#2563EB'}18 0px, transparent 50%), radial-gradient(at 90% 90%, ${formData.theme?.primaryColor || '#2563EB'}12 0px, transparent 50%)`,
                                    } : {})
                                }}
                            >
                                {(() => {
                                    const primaryColor = formData.theme?.primaryColor || '#2563EB';
                                    const layoutMode = formData.theme?.layoutMode || 'unified-card';
                                    const screenLayout = formData.theme?.screenLayout || 'center-floating';
                                    const headerAlignment = formData.theme?.headerAlignment || 'left';
                                    const fontScale = formData.theme?.fontScale || 'normal';
                                    const formDensity = formData.theme?.formDensity || 'balanced';
                                    const numberingStyle = formData.theme?.numberingStyle || 'badge';
                                    const cardStyle = formData.theme?.cardStyle || 'rounded-3xl';
                                    const cardElevation = formData.theme?.cardElevation || 'soft-glow';
                                    const isPillButton = formData.theme?.buttonStyle === 'pill';

                                    // Dynamic Elevation & Border Style
                                    const elevationClass = cardElevation === 'glass'
                                        ? 'bg-white/80 backdrop-blur-md border border-white/60 shadow-lg'
                                        : cardElevation === 'minimal'
                                        ? 'bg-white border border-gray-200/80 shadow-none'
                                        : cardElevation === 'sharp-border'
                                        ? 'bg-white border-2 border-gray-900 shadow-md'
                                        : 'bg-white border border-gray-200/80 shadow-md';

                                    // Dynamic Font Sizes
                                    const titleSize = fontScale === 'compact' ? 'text-xs' : fontScale === 'large' ? 'text-base' : 'text-sm';
                                    const labelSize = fontScale === 'compact' ? 'text-[10px]' : fontScale === 'large' ? 'text-xs' : 'text-[11px]';
                                    const inputPadding = fontScale === 'compact' ? 'py-1.5 px-2.5 text-[11px]' : fontScale === 'large' ? 'py-3 px-3.5 text-xs' : 'py-2 px-3 text-xs';

                                    // Dynamic Density Spacing
                                    const densitySpace = formDensity === 'compact' ? 'space-y-2' : formDensity === 'spacious' ? 'space-y-4' : 'space-y-3';

                                    // Render Header Block
                                    const renderInspectorHeader = () => (
                                        <div className={`space-y-2 flex flex-col ${headerAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                {formData.branding?.logoUrl ? (
                                                    <img src={formData.branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-xl border border-gray-100 p-0.5 bg-white shadow-2xs" />
                                                ) : (
                                                    <div 
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-xs"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {formData.title?.charAt(0) || 'F'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-[11px] font-black text-gray-900 truncate max-w-[160px]">
                                                        {formData.branding?.companyName || 'Admissions Desk'}
                                                    </div>
                                                    <div className="text-[9px] font-semibold truncate max-w-[160px]" style={{ color: primaryColor }}>
                                                        {formData.branding?.tagline || 'Interactive Theme Preview'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-1">
                                                <h5 className={`${titleSize} font-black text-gray-950 truncate`}>{formData.title || 'Untitled Form'}</h5>
                                                <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                                                    {formData.description || 'Welcome! Please fill out the details below.'}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    // Render Fields Block
                                    const renderInspectorFields = () => (
                                        <div className={densitySpace}>
                                            {/* Field 1: Full Name */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    {numberingStyle !== 'hidden' && (
                                                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                                                            {numberingStyle === 'dot' ? '•' : '1.'}
                                                        </span>
                                                    )}
                                                    <span className={`${labelSize} font-bold text-gray-800`}>Full Name *</span>
                                                </div>
                                                <div className={`w-full bg-gray-50/80 rounded-xl border border-gray-200 text-gray-400 flex items-center justify-between ${inputPadding}`}>
                                                    <span>John Doe</span>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                                </div>
                                            </div>

                                            {/* Field 2: Phone */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    {numberingStyle !== 'hidden' && (
                                                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                                                            {numberingStyle === 'dot' ? '•' : '2.'}
                                                        </span>
                                                    )}
                                                    <span className={`${labelSize} font-bold text-gray-800`}>WhatsApp Number *</span>
                                                </div>
                                                <div className={`w-full bg-gray-50/80 rounded-xl border border-gray-200 text-gray-700 font-bold flex items-center gap-1.5 ${inputPadding}`}>
                                                    <span className="text-[9px] bg-gray-200 px-1 py-0.5 rounded text-gray-700 font-mono">+91</span>
                                                    <span className="text-gray-400 font-normal">98765 43210</span>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <div 
                                                className={`w-full py-2.5 font-bold text-xs text-white text-center shadow-md transition transform active:scale-98 cursor-pointer ${
                                                    isPillButton ? 'rounded-full' : 'rounded-xl'
                                                }`}
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {formData.branding?.submitButtonText || 'Submit Response'}
                                            </div>
                                        </div>
                                    );

                                    // Render Side Hero (for split screen modes)
                                    const renderInspectorSideHero = () => (
                                        <div className={`p-3 bg-white/90 backdrop-blur-xs border border-gray-200 rounded-2xl space-y-2 shadow-2xs`}>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5B22]">
                                                <Sparkles size={10} /> {formData.theme?.sideHero?.badgeText || '⚡ High Value'}
                                            </span>
                                            <h6 className="text-xs font-black text-gray-900 leading-tight">
                                                {formData.theme?.sideHero?.title || formData.title || 'Official Admissions'}
                                            </h6>
                                            <p className="text-[9px] text-gray-500 line-clamp-2">
                                                {formData.theme?.sideHero?.subtitle || 'Get dedicated counseling support.'}
                                            </p>
                                            <div className="space-y-1 pt-1 text-[9px] font-bold text-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <Check size={10} className="text-emerald-600" />
                                                    <span>Instant confirmation</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Check size={10} className="text-emerald-600" />
                                                    <span>Direct counselor callback</span>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div className="space-y-3">
                                            {/* Split-Screen Left/Right layout indicator */}
                                            {(screenLayout === 'split-left' || screenLayout === 'split-right') && (
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    {screenLayout === 'split-left' ? (
                                                        <>
                                                            {renderInspectorSideHero()}
                                                            <div className="text-[9px] text-gray-400 flex items-center justify-center border border-dashed border-gray-300 rounded-2xl p-2 text-center">
                                                                Split Screen Hero Layout
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-[9px] text-gray-400 flex items-center justify-center border border-dashed border-gray-300 rounded-2xl p-2 text-center">
                                                                Split Screen Hero Layout
                                                            </div>
                                                            {renderInspectorSideHero()}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Main Layout Presentation */}
                                            {layoutMode === 'unified-card' ? (
                                                /* UNIFIED CONTINUOUS CARD */
                                                <div className={`${elevationClass} ${cardStyle} p-4 sm:p-5 space-y-4`}>
                                                    {renderInspectorHeader()}
                                                    <div className="pt-2 border-t border-gray-100">
                                                        {renderInspectorFields()}
                                                    </div>
                                                </div>
                                            ) : layoutMode === 'linear-doc' ? (
                                                /* LINEAR DOCUMENT FLOW (BORDERLESS MINIMAL PAPER) */
                                                <div className={`bg-white/95 border border-gray-200/50 shadow-2xs ${cardStyle} p-4 sm:p-5 space-y-4`}>
                                                    {renderInspectorHeader()}
                                                    <div className="pt-3 border-t border-gray-100">
                                                        {renderInspectorFields()}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* MODULAR FLOATING CARDS */
                                                <div className="space-y-2.5">
                                                    <div className={`${elevationClass} ${cardStyle} p-4`}>
                                                        {renderInspectorHeader()}
                                                    </div>
                                                    <div className={`${elevationClass} ${cardStyle} p-4`}>
                                                        {renderInspectorFields()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Theme Specs Pill Summary */}
                                            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] font-bold text-gray-400">
                                                <span>Layout: {layoutMode}</span>
                                                <span>Scale: {fontScale}</span>
                                                <span>Radius: {cardStyle}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: SETTINGS & WORKFLOWS */}
            {activeTab === 'settings' && (
                <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-20 space-y-6">
                    {/* Custom Slug & Public URL */}
                    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Share2 size={16} className="text-[#FF5B22]" />
                                    Custom URL Slug & Link Sharing
                                </h3>
                                <p className="text-xs text-gray-500">Assign a friendly short URL for your marketing campaigns & WhatsApp ads.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-2.5 rounded-xl border border-gray-200 shrink-0">
                                {window.location.origin}/form/
                            </span>
                            <input
                                type="text"
                                value={formData.slug || ''}
                                onChange={(e) => updateFormHeader('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                                placeholder="admissions-2026"
                                className="flex-1 font-mono text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                            />
                        </div>
                    </div>

                    {/* Verification & Payment Gateway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OTP Verification & Email */}
                        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-600" />
                                Security & Lead Verification
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50/70 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.settings?.verifyPhone || false}
                                        onChange={(e) => updateSettings('verifyPhone', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded text-[#FF5B22] focus:ring-[#FF5B22] border-gray-300 cursor-pointer"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Phone OTP Verification</div>
                                        <div className="text-[11px] text-gray-500">Send real-time 4-digit SMS OTP to verify lead phone before saving response.</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50/70 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.settings?.collectEmail || false}
                                        onChange={(e) => updateSettings('collectEmail', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded text-[#FF5B22] focus:ring-[#FF5B22] border-gray-300 cursor-pointer"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Always Require Email</div>
                                        <div className="text-[11px] text-gray-500">Ensures email address is mandatorily captured for email marketing.</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Payment Collection */}
                        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={16} className="text-blue-600" />
                                Razorpay Payment Collection
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50/70 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.settings?.collectPayment || false}
                                        onChange={(e) => updateSettings('collectPayment', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded text-[#FF5B22] focus:ring-[#FF5B22] border-gray-300 cursor-pointer"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Collect Registration / Application Fee</div>
                                        <div className="text-[11px] text-gray-500">Integrates Razorpay checkout directly upon form submission.</div>
                                    </div>
                                </label>

                                {formData.settings?.collectPayment && (
                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-700 block mb-1">Fee Amount</label>
                                                <input
                                                    type="number"
                                                    value={formData.settings?.paymentAmount || 0}
                                                    onChange={(e) => updateSettings('paymentAmount', Number(e.target.value))}
                                                    className="w-full text-xs font-bold px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                                                    placeholder="500"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-xs font-bold text-gray-700 block mb-1">Currency</label>
                                                <select
                                                    value={formData.settings?.currency || 'INR'}
                                                    onChange={(e) => updateSettings('currency', e.target.value)}
                                                    className="w-full text-xs font-bold px-2 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none"
                                                >
                                                    <option value="INR">INR (₹)</option>
                                                    <option value="USD">USD ($)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thank You Screen Customizer */}
                    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles size={16} className="text-[#FF5B22]" />
                            Thank You & Confirmation Screen
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Success Heading</label>
                                <input
                                    type="text"
                                    value={formData.settings?.thankYou?.title || 'Thank You!'}
                                    onChange={(e) => updateThankYou('title', e.target.value)}
                                    className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">Success Message / Instructions</label>
                                <input
                                    type="text"
                                    value={formData.settings?.thankYou?.message || ''}
                                    onChange={(e) => updateThankYou('message', e.target.value)}
                                    className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5B22]"
                                    placeholder="Your submission has been received..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: LIVE DEVICE SIMULATOR */}
            {activeTab === 'preview' && (
                <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-20 space-y-4">
                    {/* Device Selector */}
                    <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-2xl border border-gray-200/80 w-fit mx-auto">
                        <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Monitor size={15} />
                            Desktop (100%)
                        </button>
                        <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                previewDevice === 'tablet' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Tablet size={15} />
                            Tablet iPad
                        </button>
                        <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Smartphone size={15} />
                            Mobile iPhone
                        </button>
                    </div>

                    {/* Frame Container */}
                    <div className="flex justify-center transition-all">
                        <div
                            className={`bg-white rounded-3xl border-4 border-gray-800 shadow-2xl overflow-hidden transition-all duration-300 ${
                                previewDevice === 'mobile' ? 'w-[375px] min-h-[667px]' :
                                previewDevice === 'tablet' ? 'w-[768px] min-h-[800px]' :
                                'w-full max-w-4xl min-h-[600px]'
                            }`}
                        >
                            {/* Device Frame Top Bar */}
                            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between text-gray-400 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                </div>
                                <span className="truncate max-w-[200px]">{formData.title} • Live Preview</span>
                                <span>100%</span>
                            </div>

                            {/* Simulated Interactive Form View */}
                            <div className="p-2 sm:p-6 overflow-y-auto max-h-[750px]">
                                <FormView
                                    previewFormData={formData}
                                    showHeader={true}
                                    showFooter={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
