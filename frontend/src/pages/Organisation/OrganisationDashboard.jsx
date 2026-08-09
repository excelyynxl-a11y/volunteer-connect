import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OrganisationHomepage from "./OrganisationHomepage";
import OrganisationProfile from "./OrganisationProfile";
import EditOrganisationProfile from "./EditOrganisationProfile";
import EditOpportunity from "./EditOpportunity";

import CreateOpportunityPage from "./CreateOpportunityPage";
import "./Organisation.css";
import OrganisationOpportunity from "./OrganisationOpportunity";
import OrganisationApplication from "./OrganisationApplication";
import OrganisationReport from "./OrganisationReport";
import ReportMadePage from "../Report/ReportMadePage";
import ViewOpportunity from "./ViewOpportunity";
import PublicVolunteerProfile from "../Volunteer/PublicVolunteerProfile";
import VolunteerMessages from "../Volunteer/VolunteerMessages";



const OrganisationDashboard = () => {
  const { sidebarCollapsed } = useOrganisationStore();
  const location = useLocation();
  const flushPages = [
    "/organisation-dashboard/profile",
    "/organisation-dashboard/edit-organisation-profile",
    "/organisation-dashboard/edit-opportunity",
    "/organisation-dashboard/applications/volunteers",
  ];
  const isFlushPage = flushPages.some(page => location.pathname.startsWith(page));
  const isMessagesPage = location.pathname === "/organisation-dashboard/messages";

  return (
    <div className="organisation-dashboard">
      <OrganisationSidebar />
      <main
        className={`organisation-content${sidebarCollapsed ? " sidebar-collapsed" : ""}${isFlushPage ? " organisation-content-flush" : ""}${isMessagesPage ? " organisation-content-messages" : ""}`}
      >
        <Routes>
          <Route path="/" element={<OrganisationHomepage />} />
          <Route path="opportunities" element={<OrganisationOpportunity />} />
          <Route path="applications" element={<OrganisationApplication />} />
          <Route path="applications/volunteers/:volunteerId" element={<PublicVolunteerProfile />} />
          <Route path="followers" element={<OrganisationFollowers />} />
          <Route path="messages" element={<VolunteerMessages />} />
          <Route path="report" element={<OrganisationReport />} />
          <Route path="report/:reportId" element={<ReportMadePage />} />
          <Route path="edit-opportunity/:id" element={<EditOpportunity />} />
          <Route path="view-opportunity/:id" element={<ViewOpportunity />} />
          <Route path="create-opportunity"element={<CreateOpportunityPage />}/>
          <Route path="profile" element={<OrganisationProfile />} />
          <Route path="edit-organisation-profile" element={<EditOrganisationProfile />} />
          <Route path="*" element={<Navigate to="/organisation-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default OrganisationDashboard
