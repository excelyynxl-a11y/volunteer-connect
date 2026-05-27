import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import VolunteerDashboard from "./pages/Volunteer/VolunteerDashboard";
import OrganisationDashboard from "./pages/Organisation/OrganisationDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Login from "./pages/Auth/Login";
import LoggingOut from "./pages/Auth/LoggingOut";
import Pending from "./pages/Auth/Pending";
import { Toaster } from "react-hot-toast";  
import LoadingPage from "./pages/LoadingPage/LoadingPage";
import { useAuthStore } from "./store/useAuthStore";
import CreateOpportunityPage from "./pages/Organisation/CreateOpportunityPage";

const App = () => {
  
  return (
    <div className="app-shell">
      <Toaster />
      <Routes>
        {/* landing page route */}
        <Route path='/' element={<LandingPage />} />

        {/* authentication and account creation route */}
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logging-out' element={<LoggingOut />} />
        <Route path="/pending-approval" element={<Pending />} />

        {/* volunteer route */}
        <Route path='/volunteer-dashboard/*' element={<VolunteerDashboard />} />

        {/* organisation route */}
        <Route path='/organisation-dashboard/*' element={<OrganisationDashboard />} />

        {/* admin route */}
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />

        {/* catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
};

export default App;
