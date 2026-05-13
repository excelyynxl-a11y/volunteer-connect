import React from "react";
import { Search, Plus, AlertCircle } from "lucide-react";

const ManageOrganisation = () => {
  return (
    <div className="admin-page">

      {/* Manage organisation header */}
      <div className="admin-page-header">
        <h1>
          Manage Organisations
        </h1>
        <p>
          View, edit, and manage all registered organisations.
        </p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <input
            type="text"
            className="admin-table-search"
            placeholder="Search volunteers..."
          />
          <button className="admin-table-btn">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="admin-empty">
          <AlertCircle className="admin-empty-icon" />
          <h3>No organisation found</h3>
          <p>Volunteer records will appear here once available.</p>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganisation;
