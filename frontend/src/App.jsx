import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import VolunteerDashboard from "./pages/Volunteer/VolunteerDashboard";
import VolunteerOpportunities from "./pages/VolunteerOpportunities/VolunteerOpportunities";
import OrganisationDashboard from "./pages/Organisation/OrganisationDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Login from "./pages/Auth/Login";
import Navbar from "./components/Navbar";
import Vision from "./pages/Vision/Vision";
import Mission from "./pages/Mission/Mission";
import AboutUs from "./pages/AboutUs/AboutUs";
import Pending from "./pages/Auth/Pending";

const App = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/sign-up"].includes(location.pathname);

  return (
    <div>
      {/* <Navbar /> */}
      <Routes>
        {/* landing page route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/vision" element={<Vision />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/opportunities" element={<VolunteerOpportunities />} />

        {/* authentication and account creation route */}
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pending-approval" element={<Pending />} />

        {/* volunteer route */}
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />

        {/* organisation route */}
        <Route
          path="/organisation-dashboard"
          element={<OrganisationDashboard />}
        />

        {/* admin route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
