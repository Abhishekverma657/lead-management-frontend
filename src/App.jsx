import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import LandingPage from "./pages/LandingPage";
import ThankYou from "./pages/ThankYou";

// Super Admin Layout & Portal
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";

// Forms Pages
import FormsList from "./pages/forms/FormsList";
import FormBuilder from "./pages/forms/FormBuilder";
import FormView from "./pages/forms/FormView";
import FormResponses from "./pages/forms/FormResponses";

// Lead Management Pages
import LeadManagementLayout from "./pages/lead-management/LeadManagementLayout";
import LeadDashboard from "./pages/lead-management/LeadDashboard";
import AllLeadsPage from "./pages/lead-management/AllLeadsPage";
import StaffReportsPage from "./pages/lead-management/StaffReportsPage";
import OffersPage from "./pages/lead-management/OffersPage";
import StaffPage from "./pages/lead-management/StaffPage";
import TasksPage from "./pages/lead-management/TasksPage";
import MobileUsersPage from "./pages/lead-management/MobileUsersPage";
import LiveTelephonyWallboard from "./pages/lead-management/LiveTelephonyWallboard";

// Profile Page
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Public Form Rendering & Thank You */}
          <Route path="/forms/view/:id" element={<FormView />} />
          <Route path="/forms/view/:id/thank-you" element={<ThankYou />} />
          <Route path="/form/:slug" element={<FormView />} />
          <Route path="/form/:slug/thank-you" element={<ThankYou />} />
          <Route path="/admin/form/:slug" element={<FormView />} />
          <Route path="/admin/forms/view/:id" element={<FormView />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Super Admin Master Portal */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard tab="overview" />} />
            <Route path="overview" element={<SuperAdminDashboard tab="overview" />} />
            <Route path="tenants" element={<SuperAdminDashboard tab="tenants" />} />
            <Route path="branding" element={<SuperAdminDashboard tab="branding" />} />
            <Route path="platform-apis" element={<SuperAdminDashboard tab="platform_apis" />} />
          </Route>

          {/* Admin Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            {/* Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />

            {/* Forms Management */}
            <Route path="/forms" element={<FormsList />} />
            <Route path="/forms/create" element={<FormBuilder />} />
            <Route path="/forms/edit/:id" element={<FormBuilder />} />
            <Route path="/forms/responses/:id" element={<FormResponses />} />

            {/* Lead Management CRM */}
            <Route path="/lead-management" element={<LeadManagementLayout />}>
              <Route index element={<LeadDashboard />} />
              <Route path="dashboard" element={<LeadDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="leads" element={<AllLeadsPage key="all-leads" isFocusToday={false} />} />
              <Route path="focus-today" element={<AllLeadsPage key="focus-today" isFocusToday={true} />} />
              <Route path="staff-reports" element={<StaffReportsPage />} />
              <Route path="wallboard" element={<LiveTelephonyWallboard />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="rewards" element={<MobileUsersPage />} />
            </Route>

            {/* Compatibility Aliases for /admin/... paths */}
            <Route path="/admin/forms" element={<FormsList />} />
            <Route path="/admin/forms/create" element={<FormBuilder />} />
            <Route path="/admin/forms/edit/:id" element={<FormBuilder />} />
            <Route path="/admin/forms/responses/:id" element={<FormResponses />} />
            <Route path="/admin/lead-management" element={<LeadManagementLayout />}>
              <Route index element={<LeadDashboard />} />
              <Route path="dashboard" element={<LeadDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="leads" element={<AllLeadsPage key="admin-all-leads" isFocusToday={false} />} />
              <Route path="focus-today" element={<AllLeadsPage key="admin-focus-today" isFocusToday={true} />} />
              <Route path="staff-reports" element={<StaffReportsPage />} />
              <Route path="wallboard" element={<LiveTelephonyWallboard />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="rewards" element={<MobileUsersPage />} />
            </Route>
          </Route>

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
