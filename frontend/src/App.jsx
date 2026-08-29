import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import VolunteerDashboard from "./pages/Volunteer/VolunteerDashboard";
import OrganisationDashboard from "./pages/Organisation/OrganisationDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Login from "./pages/Auth/Login";
import LoggingOut from "./pages/Auth/LoggingOut";
import Pending from "./pages/Auth/Pending";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./store/useAuthStore";
import {
  GuestRoute,
  ProtectedRoute,
  RoleRoute,
} from "./components/AuthRoutes";

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="app-shell">
      <Toaster />
      <ErrorBoundary>
      <Routes>
        {/* landing page route */}
        <Route path='/' element={<LandingPage />} />

        {/* authentication and account creation route */}
        <Route element={<GuestRoute />}>
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
        </Route>
        <Route path='/logging-out' element={<LoggingOut />} />
        <Route path="/pending-approval" element={<Pending />} />

        <Route element={<ProtectedRoute />}>
          {/* volunteer route */}
          <Route element={<RoleRoute allowedRoles={["volunteer"]} />}>
            <Route path='/volunteer-dashboard/*' element={<VolunteerDashboard />} />
          </Route>

          {/* organisation route */}
          <Route element={<RoleRoute allowedRoles={["organisation"]} />}>
            <Route path='/organisation-dashboard/*' element={<OrganisationDashboard />} />
          </Route>

          {/* admin route */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
