import React, { useState, useMemo } from "react";
import { Search, AlertCircle, ArrowUpDown } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import ManageOrganisationCard from "../../components/ManageOrganisationCard";
import PreviewOrganisation from "../../components/PreviewOrganisation";

// approvalStatus filter
const APPROVAL_STATUSES = ["All", "approved", "pending", "rejected"];

const ManageOrganisation = () => {
  // search by organisation name or email
  const [searchTerm, setSearchTerm] = useState("");
  // filter by approvalStatus, createdAt
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState("descending");

  // organisation of the admin clicked on a ManageOrganisationCard "manage button"
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);

  const { getAllOrganisations } = useAdminStore();

  const organisations = getAllOrganisations();

  // filtering functions
  const filteredOrganisations = useMemo(() => {
    let result = organisations;

    // search by name or email
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(term) ||
          org.email.toLowerCase().includes(term),
      );
    }

    // filter by approvalStatus
    if (approvalStatusFilter !== "All") {
      result = result.filter(
        (org) => org.approvalStatus === approvalStatusFilter,
      );
    }

    // sort by createdAt
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "descending" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [searchTerm, approvalStatusFilter, sortDirection, organisations]);

  return (
    <div className="admin-page">
      {/* Manage organisation header */}
      <div className="admin-page-header">
        <h1>Manage Organisations</h1>
        <p>View, edit, and manage all registered organisations.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          {/* search bar */}
          <div className="admin-table-search-wrapper">
            <Search size={16} className="admin-table-search-icon" />
            <input
              type="text"
              className="admin-table-search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* filter approval status */}
          <select
            className="admin-table-select"
            value={approvalStatusFilter}
            onChange={(e) => setApprovalStatusFilter(e.target.value)}
          >
            {APPROVAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All Statuses"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* sort date direction */}
          <button
            className="admin-table-sort-btn"
            onClick={() =>
              setSortDirection((direction) =>
                direction === "descending" ? "ascending" : "descending",
              )
            }
            title={`Sort by date created (${sortDirection})`}
          >
            <ArrowUpDown size={16} />
            <span>
              {sortDirection === "descending" ? "Newest First" : "Oldest First"}
            </span>
          </button>

          {/* clear all filter button */}
          <button
            className="admin-table-clear-btn"
            onClick={() => {
              setSearchTerm("");
              setApprovalStatusFilter("All");
              setSortDirection("descending");
            }}
          >
            Clear All
          </button>
        </div>

        {/* organisation cards */}
        {filteredOrganisations.length > 0 ? (
          <div className="admin-volunteer-card-list">
            {filteredOrganisations.map((organisation) => (
              <ManageOrganisationCard
                key={organisation._id}
                organisation={organisation}
                onManage={setSelectedOrganisation}
              />
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <AlertCircle className="admin-empty-icon" />
            <h3>No organisations found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* PreviewOrganisation popup after admin clicked on "manage button" of ManageOrganisationCard */}
      {selectedOrganisation && (
        <PreviewOrganisation
          organisation={selectedOrganisation}
          onClose={() => setSelectedOrganisation(null)}
        />
      )}
    </div>
  );
};

export default ManageOrganisation;
