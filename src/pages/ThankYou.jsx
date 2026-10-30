import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Phone, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ThankYou = () => {
    const location = useLocation();
    const thankYouData = location.state?.thankYou || {};

    const title = thankYouData.title || "Thank You!";
    const message = thankYouData.message || "We've received your information and our expert counselors will get in touch with you shortly.";
    const buttons = thankYouData.buttons || [];
    const isForm = thankYouData.isFormSubmission;

    const getButtonStyles = (style) => {
        switch (style) {
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30';
            case 'secondary':
                return 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg shadow-gray-500/30';
            case 'outline':
                return 'bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700';
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex items-center justify-center">
            <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-emerald-50 rounded-4xl p-8 md:p-12 border border-emerald-100 shadow-xl"
                >
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                        {title}
                    </h2>

                    <div className="space-y-4 text-lg leading-relaxed text-gray-600 mb-10 whitespace-pre-wrap">
                        {message}
                    </div>

                    <div className={`grid grid-cols-1 ${buttons.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
                        {buttons.length > 0 ? (
                            buttons.map((btn, idx) => {
                                const isExternal = btn.url && (btn.url.startsWith('http') || btn.url.startsWith('https'));
                                const buttonClass = `flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${getButtonStyles(btn.style)}`;

                                if (isExternal) {
                                    return (
                                        <a key={idx} href={btn.url} className={buttonClass}>
                                            {btn.text}
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    );
                                }
                                return (
                                    <Link key={idx} to={btn.url || '/'} className={buttonClass}>
                                        {btn.text}
                                    </Link>
                                );
                            })
                        ) : !isForm && (
                            <>
                                <Link
                                    to="/"
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30"
                                >
                                    <Home className="w-5 h-5" />
                                    Back to Home
                                </Link>
                                <Link
                                    to="/contact-us"
                                    className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 px-6 py-4 rounded-xl font-bold transition-all"
                                >
                                    <Phone className="w-5 h-5" />
                                    Contact Us
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Next Steps - Only show if no custom buttons provided and NOT a form submission (default site-wide state) */}
                {buttons.length === 0 && !isForm && (
                    <div className="mt-16 text-left">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 border-l-4 border-blue-600 pl-4">
                            What's Next?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="text-blue-600 font-bold text-2xl mb-2">01</div>
                                <h4 className="font-bold text-gray-900 mb-2">Counselor Call</h4>
                                <p className="text-sm text-gray-600 wrap-break-word">Our team will call you to understand your requirements.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="text-blue-600 font-bold text-2xl mb-2">02</div>
                                <h4 className="font-bold text-gray-900 mb-2">Centre Visit</h4>
                                <p className="text-sm text-gray-600 wrap-break-word">Schedule a visit to our Indraprashta Industrial Area centre.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="text-blue-600 font-bold text-2xl mb-2">03</div>
                                <h4 className="font-bold text-gray-900 mb-2">Start Learning</h4>
                                <p className="text-sm text-gray-600 wrap-break-word">Join the batches and start your preparation with Top Educators.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThankYou;
