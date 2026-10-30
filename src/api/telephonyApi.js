import axiosClient from "./axios_client";

/**
 * Initiates Click-to-Call via Airtel IQ / Vonage VBC
 * @param {Object} data
 * @param {string} data.leadId - Lead ID
 * @param {string} [data.toPhoneNumber] - Customer number
 * @param {string} [data.fromExtension] - Agent extension
 */
export const initiateCallApi = async (data) => {
    const response = await axiosClient.post("/telephony/call", data);
    return response.data;
};

/**
 * Fetches all available provisioned extensions from Airtel IQ
 */
export const getExtensionsApi = async () => {
    const response = await axiosClient.get("/telephony/extensions");
    return response.data;
};

/**
 * Fetches call recordings list
 */
export const getRecordingsApi = async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const response = await axiosClient.get(`/telephony/recordings?${searchParams}`);
    return response.data;
};

/**
 * Gets direct audio streaming URL for a recording ID
 */
export const getAudioStreamUrl = (recordingId) => {
    const baseURL = axiosClient.defaults.baseURL || "/api";
    return `${baseURL}/telephony/recordings/${recordingId}/audio`;
};

/**
 * Syncs latest call recording for a specific lead
 * @param {string} leadId
 * @param {Object} [options]
 * @param {string} [options.callId]
 * @param {string|number} [options.minTimestamp]
 */
export const syncLeadRecordingApi = async (leadId, options = {}) => {
    const response = await axiosClient.post(`/telephony/leads/${leadId}/sync-recording`, options);
    return response.data;
};

/**
 * Fetches CDR Call Logs
 */
export const getTelephonyLogsApi = async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const response = await axiosClient.get(`/telephony/logs?${searchParams}`);
    return response.data;
};

/**
 * Checks active call status
 */
export const getCallStatusApi = async (callId) => {
    const response = await axiosClient.get(`/telephony/calls/${callId}/status`);
    return response.data;
};

/**
 * Hangs up active call
 */
export const hangupCallApi = async (callId) => {
    const response = await axiosClient.post(`/telephony/calls/${callId}/hangup`);
    return response.data;
};

/**
 * Fetches real-time telephony live wallboard, metrics, and agent states
 */
export const getLiveWallboardApi = async () => {
    const response = await axiosClient.get("/telephony/wallboard");
    return response.data;
};

/**
 * Fetches call history and analytics for a specific extension
 */
export const getExtensionHistoryApi = async (extension, params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const response = await axiosClient.get(`/telephony/extensions/${extension}/history?${searchParams}`);
    return response.data;
};



