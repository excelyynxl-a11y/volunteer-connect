import React from "react";
import { Search, AlertCircle } from "lucide-react";

const ManageReport = () => {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Reports</h1>
        <p>Review and resolve user-submitted reports.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <input
            type="text"
            className="admin-table-search"
            placeholder="Search reports..."
          />
        </div>
        <div className="admin-empty">
          <AlertCircle className="admin-empty-icon" />
          <h3>No reports found</h3>
          <p>Reported content will appear here for review.</p>
        </div>
      </div>
    </div>
  );
};

export default ManageReport;
