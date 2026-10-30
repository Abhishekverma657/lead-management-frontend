import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProtectedRoute = ({ children, permission }) => {
    const { user, token } = useAppContext();

    // If user or token is missing, redirect cleanly to /login
    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    // If user is SUB_ADMIN and specific permission required
    if (user.role === "SUB_ADMIN" && permission) {
        if (!user.permissions?.[permission]) {
            return <Navigate to="/lead-management/dashboard" replace />;
        }
    }

    // Return wrapped children or Outlet
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
