import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminStore } from "../../store/useAdminStore";
import AdminHomepage from "./AdminHomepage";
import ManageVolunteer from "./ManageVolunteer";
import ManageOrganisation from "./ManageOrganisation";
import ManageOpportunity from "./ManageOpportunity";
import ManageReport from "./ManageReport";
import ReportMadePage from "../Report/ReportMadePage";
import AdminAnalytics from "./AdminAnalytics";
import AdminProfile from "./AdminProfile";
import "./Admin.css";

const AdminDashboard = () => {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <main
        className={`admin-content${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
      >
        <Routes>
          <Route path="/" element={<AdminHomepage />} />
          <Route path="manage-volunteer" element={<ManageVolunteer />} />
          <Route path="manage-organisation" element={<ManageOrganisation />} />
          <Route path="manage-opportunity" element={<ManageOpportunity />} />
          <Route path="manage-report" element={<ManageReport />} />
          <Route path="manage-report/:reportId" element={<ReportMadePage />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;