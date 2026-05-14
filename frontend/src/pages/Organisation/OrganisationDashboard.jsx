import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OrganisationHomepage from "./OrganisationHomepage";
import OrganisationProfile from "./OrganisationProfile";
import EditOrganisationProfile from "./EditOrganisationProfile";

import "./Organisation.css";



const OrganisationDashboard = () => {
  const { sidebarCollapsed } = useOrganisationStore();

  return (
    <div className="organisation-dashboard">
      <OrganisationSidebar />
      <main
        className={`organisation-content${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
      >
        <Routes>
          <Route path="/" element={<OrganisationHomepage />} />
          <Route path="profile" element={<OrganisationProfile />} />
          <Route path="edit-organisation-profile" element={<EditOrganisationProfile />} />
          <Route path="*" element={<Navigate to="/organisation-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default OrganisationDashboard
