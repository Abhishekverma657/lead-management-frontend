import axiosClient from "./axios_client";

export const createStaff = async (staffData) => {
    const response = await axiosClient.post("/auth/staff", staffData);
    return response.data;
};

export const getStaff = async () => {
    const response = await axiosClient.get("/auth/staff");
    return response.data;
};

export const updateStaff = async (staffId, updateData) => {
    const response = await axiosClient.put(`/auth/staff/${staffId}`, updateData);
    return response.data;
};

export const deleteStaff = async (staffId) => {
    const response = await axiosClient.delete(`/auth/staff/${staffId}`);
    return response.data;
};
