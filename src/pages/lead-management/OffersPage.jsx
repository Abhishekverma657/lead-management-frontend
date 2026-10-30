import React, { useState, useEffect } from "react";
import { LucideTag, LucidePlus, LucideCalendar, LucideTrash2, LucideSparkles, LucideImage, LucideLayers, LucideAlertCircle } from "lucide-react";
import CreateOfferModal from "./CreateOfferModal";
import { createOffer, getOffers, deleteOffer } from "../../api/offerApi";
import toast from "react-hot-toast";

const OfferCard = ({ offer, onDelete }) => {
    const [imageError, setImageError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasValidImage = Boolean(
        offer.image && 
        typeof offer.image === 'string' && 
        offer.image.trim() !== '' && 
        offer.image !== 'null' && 
        offer.image !== 'undefined' && 
        offer.image !== '[object Object]' &&
        !imageError
    );

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete offer "${offer.title}"?`)) return;
        setIsDeleting(true);
        try {
            await onDelete(offer._id);
        } finally {
            setIsDeleting(false);
        }
    };

    const bannerBg = offer.bannerColor || '#FF5B22';

    return (
        <div className="relative overflow-hidden bg-white border border-gray-200/80 hover:border-orange-200 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
            
            {/* Header / Banner Area */}
            {hasValidImage ? (
                <div className="h-44 w-full overflow-hidden relative bg-slate-900">
                    <img 
                        src={offer.image} 
                        alt="" 
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3">
                        <span className="text-[11px] font-bold px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-gray-800 uppercase tracking-wider shadow-sm">
                            {offer.offerType || offer.type || "Discount"}
                        </span>
                    </div>
                </div>
            ) : (
                <div 
                    className="h-28 w-full p-4 relative flex items-start justify-between overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${bannerBg}, ${bannerBg}dd, #1e293b)`
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs">
                        <LucideTag size={20} />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-gray-900 uppercase tracking-wider shadow-xs">
                        {offer.offerType || offer.type || "Discount"}
                    </span>
                </div>
            )}

            {/* Card Body */}
            <div className="p-5.5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-[#FF5B22] transition-colors">
                            {offer.title}
                        </h3>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {offer.description || "No description provided."}
                    </p>

                    {/* Target Roles Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {(offer.targetRoles && offer.targetRoles.length > 0) ? (
                            offer.targetRoles.map((role, idx) => (
                                <span key={idx} className="text-[10px] font-bold px-2.5 py-0.5 bg-orange-50 text-[#FF5B22] border border-orange-200/60 rounded-full uppercase tracking-wider">
                                    {role === 'all' ? '🌍 Everyone' : role.replace('_', ' ')}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                                🌍 Everyone
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <LucideCalendar size={13} className="text-gray-400" />
                        <span>
                            {offer.validTill ? `Valid till: ${new Date(offer.validTill).toLocaleDateString()}` : "No Expiry"}
                        </span>
                    </div>

                    <button 
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Offer"
                    >
                        <LucideTrash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function OffersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await getOffers();
            if (res.success) {
                setOffers(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch offers:", error);
            toast.error("Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOffer = async (formData) => {
        try {
            const res = await createOffer(formData);
            if (res.success) {
                toast.success("Offer published successfully!");
                fetchOffers();
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create offer");
        }
    };

    const handleDeleteOffer = async (offerId) => {
        try {
            const res = await deleteOffer(offerId);
            if (res.success) {
                toast.success("Offer deleted successfully");
                setOffers(prev => prev.filter(o => o._id !== offerId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete offer");
        }
    };

    return (
        <>
            <CreateOfferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOffer}
            />

            <div className="p-4 lg:p-6 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Active Offers & Incentives</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage promotional discounts, referral rewards and student fee waivers</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all cursor-pointer"
                    >
                        <LucidePlus size={16} />
                        Create New Offer
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xs space-y-4 p-5 animate-pulse">
                                    <div className="h-28 w-full bg-slate-100 rounded-2xl"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="h-3 w-full bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </>
                    ) : offers.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5B22] flex items-center justify-center mx-auto">
                                <LucideTag size={24} />
                            </div>
                            <h3 className="text-base font-bold text-gray-800">No active offers</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                You haven't created any promotional offers yet. Click 'Create New Offer' to launch your first campaign.
                            </p>
                        </div>
                    ) : (
                        offers.map((offer) => (
                            <OfferCard 
                                key={offer._id} 
                                offer={offer} 
                                onDelete={handleDeleteOffer} 
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
