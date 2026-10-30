import axiosClient from "./axios_client";

export const getOffers = async () => {
    const response = await axiosClient.get("/lead-management/offers");
    return response.data;
};

export const createOffer = async (offerData) => {
    const response = await axiosClient.post("/lead-management/offers", offerData);
    return response.data;
};

export const deleteOffer = async (offerId) => {
    const response = await axiosClient.delete(`/lead-management/offers/${offerId}`);
    return response.data;
};

