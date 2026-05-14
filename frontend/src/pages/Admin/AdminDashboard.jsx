import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminStore } from "../../store/useAdminStore";
import AdminHomepage from "./AdminHomepage";
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
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;