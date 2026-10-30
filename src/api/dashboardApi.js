import axiosClient from "./axios_client";

export const getDashboardData = async (counselorId = null) => {
    const url = counselorId 
        ? `/lead-management/dashboard?counselorId=${counselorId}` 
        : "/lead-management/dashboard";
    const response = await axiosClient.get(url);
    return response.data;
};
