import axios from "axios";
import axiosClient from "./axios_client";

const publicClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api',
    headers: {
        "Content-Type": "application/json",
    },
});

export const getForms = async () => {
    const response = await axiosClient.get('/forms');
    return response.data;
};

export const getFormById = async (id) => {
    // Uses axiosClient (sends token if admin, no token if public).
    // Backend route /:id is now public, so this works for both.
    const response = await axiosClient.get(`/forms/${id}`);
    return response.data;
};

export const getFormBySlug = async (slug) => {
    // Public fetch for form rendering
    const response = await publicClient.get(`/forms/slug/${slug}`);
    return response.data;
};

export const createForm = async (data) => {
    const response = await axiosClient.post('/forms', data);
    return response.data;
};

export const updateForm = async (id, data) => {
    const response = await axiosClient.put(`/forms/${id}`, data);
    return response.data;
};

export const deleteForm = async (id) => {
    const response = await axiosClient.delete(`/forms/${id}`);
    return response.data;
};

export const submitResponse = async (data) => {
    // Form submission is public
    const response = await publicClient.post('/forms/submit', data);
    return response.data;
};

export const getFormResponses = async (id) => {
    const response = await axiosClient.get(`/forms/${id}/responses`);
    return response.data;
};

export const syncFormFields = async (id, data) => {
    const response = await axiosClient.put(`/forms/${id}/sync-fields`, data);
    return response.data;
};

export const uploadFormImages = async (base64Images) => {
    const response = await axiosClient.post('/forms/upload-images', { images: base64Images });
    return response.data;
};

export const uploadFile = async (base64File) => {
    // File upload might be from public form
    const response = await publicClient.post('/forms/upload-file', { file: base64File });
    return response.data;
};

export const createPaymentOrder = async (amount, currency = 'INR') => {
    const response = await publicClient.post('/forms/payment/order', { amount, currency });
    return response.data;
};

export const sendOtp = async (phone) => {
    const response = await publicClient.post('/otp/send', { phone });
    return response.data;
};

export const verifyOtp = async (phone, otp) => {
    const response = await publicClient.post('/otp/verify', { phone, otp });
    return response.data;
};

export const updateResponseVerification = async (id, status) => {
    const response = await axiosClient.patch(`/forms/responses/${id}/verification`, { status });
    return response.data;
};

export const updateResponsePayment = async (id, paymentDetails) => {
    const response = await publicClient.post(`/forms/responses/${id}/payment`, { paymentDetails });
    return response.data;
};

export const addResponseRemark = async (id, data) => {
    const response = await axiosClient.post(`/forms/responses/${id}/remarks`, data);
    return response.data;
};
