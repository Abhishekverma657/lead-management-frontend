import axiosClient from "./axios_client";

export const getAllLeads = async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    
    // Append all defined filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            params.append(key, filters[key]);
        }
    });

    const response = await axiosClient.get(`/lead-management/leads?${params.toString()}`);
    return response.data;
};

export const getLeadSources = async () => {
    const response = await axiosClient.get("/lead-management/sources");
    return response.data;
};

export const bulkAssignLeads = async (data) => {
    const response = await axiosClient.post("/lead-management/bulk-assign", data);
    return response.data;
};

export const bulkUpdateLeads = async (data) => {
    const response = await axiosClient.post("/lead-management/bulk-update", data);
    return response.data;
};

export const requestPayment = async (data) => {
    const response = await axiosClient.post("/lead-management/payments/request", data);
    return response.data;
};

export const recordManualPayment = async (data) => {
    const response = await axiosClient.post('/lead-management/payments/manual', data);
    return response.data;
};

export const syncPayments = async (leadId) => {
    const response = await axiosClient.post('/lead-management/payments/sync', { leadId });
    return response.data;
};

export const getDailyActivityReport = async (staffIdOrParams, date) => {
    try {
        let params = {};
        if (typeof staffIdOrParams === 'object' && staffIdOrParams !== null) {
            params = staffIdOrParams;
        } else {
            params = { staffId: staffIdOrParams, date };
        }
        const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        const res = await axiosClient.get(`/lead-management/reports/daily-activity?${qs}`);
        return res.data;
    } catch (err) { return handleError(err); }
};

export const getDailySummaryReport = async (dateOrParams) => {
    try {
        let params = {};
        if (typeof dateOrParams === 'object' && dateOrParams !== null) {
            params = dateOrParams;
        } else if (dateOrParams) {
            params = { date: dateOrParams };
        }
        const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        const res = await axiosClient.get(`/lead-management/reports/daily-summary?${qs}`);
        return res.data;
    } catch (err) { return handleError(err); }
};

export const exportLeadsData = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosClient.get(`/lead-management/reports/export?${params}`);
    return response.data;
};

export const importLeads = async (formData) => {
    const response = await axiosClient.post("/lead-management/leads/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const createLead = async (leadData) => {
    const response = await axiosClient.post("/lead-management/leads", leadData);
    return response.data;
};

export const updateLeadStatus = async (leadId, status, remarks) => {
    const response = await axiosClient.put(`/lead-management/leads/${leadId}`, { status, remarks });
    return response.data;
};

export const updateLead = async (leadId, updateData) => {
    const response = await axiosClient.put(`/lead-management/leads/${leadId}`, updateData);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await axiosClient.post("/lead-management/tasks", taskData);
    return response.data;
};

export const getTasks = async () => {
    const response = await axiosClient.get("/lead-management/tasks");
    return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
    const response = await axiosClient.put(`/lead-management/tasks/${taskId}`, { status });
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axiosClient.delete(`/lead-management/tasks/${taskId}`);
    return response.data;
};

export const getLeadUsers = async () => {
    const response = await axiosClient.get("/lead-management/lead-users");
    return response.data;
};

export const updateLeadUser = async (userId, updateData) => {
    const response = await axiosClient.put(`/lead-management/lead-users/${userId}`, updateData);
    return response.data;
};

export const getLeadUserHistory = async (userId) => {
    const response = await axiosClient.get(`/lead-management/lead-users/${userId}/history`);
    return response.data;
};

export const assignReward = async (userId, rewardData) => {
    const response = await axiosClient.post(`/lead-management/lead-users/${userId}/reward`, rewardData);
    return response.data;
};

export const logCallApi = async (leadId, callData) => {
    const response = await axiosClient.post(`/lead-management/leads/${leadId}/call-log`, callData);
    return response.data;
};
