import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OrganisationHomepage from "./OrganisationHomepage";
import OrganisationProfile from "./OrganisationProfile";
import EditOrganisationProfile from "./EditOrganisationProfile";
import EditOpportunity from "./EditOpportunity";

import "./Organisation.css";



const OrganisationDashboard = () => {
  const { sidebarCollapsed } = useOrganisationStore();
  const location = useLocation();
  const flushPages = [
    "/organisation-dashboard/profile",
    "/organisation-dashboard/edit-organisation-profile",
    "/organisation-dashboard/edit-opportunity"
  ];
  const isFlushPage = flushPages.some(page => location.pathname.startsWith(page));

  return (
    <div className="organisation-dashboard">
      <OrganisationSidebar />
      <main
        className={`organisation-content${sidebarCollapsed ? " sidebar-collapsed" : ""}${isFlushPage ? " organisation-content-flush" : ""}`}
      >
        <Routes>
          <Route path="/" element={<OrganisationHomepage />} />
          <Route path="profile" element={<OrganisationProfile />} />
          <Route path="edit-organisation-profile" element={<EditOrganisationProfile />} />
          <Route path="edit-opportunity/:id" element={<EditOpportunity />} />
          <Route path="*" element={<Navigate to="/organisation-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default OrganisationDashboard
