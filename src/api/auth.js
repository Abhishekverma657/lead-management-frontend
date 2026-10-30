// Authentication API functions
import axiosClient from "./axios_client";

export const login = async (credentials) => {
  const response = await axiosClient.post("/auth/login", credentials);
  return response.data;
};

export const requestOtp = async (email, roleType) => {
  const response = await axiosClient.post("/otp/send-email", { email, roleType });
  return response.data;
};

export const loginWithOtp = async (email, otp, roleType) => {
  const response = await axiosClient.post("/auth/login-otp", { email, otp, roleType });
  return response.data;
};

export const changePasswordApi = async ({ oldPassword, newPassword }) => {
  const response = await axiosClient.post("/auth/change-password", { oldPassword, newPassword });
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await axiosClient.put("/auth/profile", profileData);
  return response.data;
};
