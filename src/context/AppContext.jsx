import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axios_client";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined" && stored !== "null") {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));

  // Fetch fresh user profile & tenant branding on mount
  useEffect(() => {
    if (token) {
      axiosClient.get("/auth/me")
        .then((res) => {
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        });
    }
  }, [token]);

  // Save to localStorage whenever user/token changes
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [user, token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  return (
    <AppContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export const getToken = () => localStorage.getItem("authToken");
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};