import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import VolunteerHomepage from "./VolunteerHomepage";
import VolunteerProfile from "./VolunteerProfile";
import EditVolunteerProfile from "./EditVolunteerProfile";

import "./Volunteer.css";

const VolunteerDashboard = () => {
  const { sidebarCollapsed } = useVolunteerStore();
  const location = useLocation();
  const flushPages = [
    "/volunteer-dashboard",
    "/volunteer-dashboard/profile",
    "/volunteer-dashboard/edit-profile",
  ];
  const isFlushPage = flushPages.includes(location.pathname);

  return (
    <div className="volunteer-dashboard">
      <VolunteerSidebar />
      <main
        className={`volunteer-content${sidebarCollapsed ? " sidebar-collapsed" : ""}${isFlushPage ? " volunteer-content-flush" : ""}`}
      >
        <Routes>
          <Route path="/" element={<VolunteerHomepage />} />
          <Route path="profile" element={<VolunteerProfile />} />
          <Route path="edit-profile" element={<EditVolunteerProfile />} />
          <Route path="*" element={<Navigate to="/volunteer-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
