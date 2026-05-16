import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OrganisationHomepage from "./OrganisationHomepage";
import OrganisationProfile from "./OrganisationProfile";
import EditOrganisationProfile from "./EditOrganisationProfile";
import CreateOpportunityPage from "./CreateOpportunityPage";
import "./Organisation.css";



const OrganisationDashboard = () => {
  const { sidebarCollapsed } = useOrganisationStore();
  const location = useLocation();
  const flushPages = [
    "/organisation-dashboard/profile",
    "/organisation-dashboard/edit-organisation-profile",
  ];
  const isFlushPage = flushPages.includes(location.pathname);

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
          <Route path="create-opportunity"element={<CreateOpportunityPage />}/>
          <Route path="*" element={<Navigate to="/organisation-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default OrganisationDashboard
