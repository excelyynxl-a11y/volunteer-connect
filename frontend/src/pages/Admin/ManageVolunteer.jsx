import React, { useState, useMemo, useCallback } from "react";
import { Search, AlertCircle, ArrowUpDown, Loader2 } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import ManageVolunteerCard from "../../components/ManageVolunteerCard";
import PreviewVolunteer from "../../components/PreviewVolunteer";
import { useEffect } from "react";

// ageGroup filter
const AGE_GROUPS = ["All", "21-30", "31-40", "41-50", "51-60", "60+"];

// approvalStatus filter
const APPROVAL_STATUSES = ["All", "approved", "pending", "rejected"];

const ManageVolunteer = () => {
  // search by volunteer name or email
  const [searchTerm, setSearchTerm] = useState("");
  // filter by approvalStatus, ageGroup, createdAt
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("All");
  const [ageGroupFilter, setAgeGroupFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState("descending");

  // volunteer of the admin clicked on a ManageVolunteerCard "manage button"
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const { getAllVolunteers, volunteers, isUsersLoading } = useAdminStore();

  useEffect(() => {
      getAllVolunteers()
    }, [getAllVolunteers]);

  // filtering functions
  const filteredVolunteers = useMemo(() => {
    let result = volunteers;

    // search by name or email
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          v.email.toLowerCase().includes(term),
      );
    }

    // filter by approvalStatus
    if (approvalStatusFilter !== "All") {
      result = result.filter((v) => v.approvalStatus === approvalStatusFilter);
    }

    // filter by ageGroup
    if (ageGroupFilter !== "All") {
      result = result.filter((v) => v.ageGroup === ageGroupFilter);
    }

    // sort by createdAt
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "descending" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [
    searchTerm,
    approvalStatusFilter,
    ageGroupFilter,
    sortDirection,
    volunteers,
  ]);

  return (
    <div className="admin-page">
      {/* Manage Volunteer header */}
      <div className="admin-page-header">
        <h1>Manage Volunteers</h1>
        <p>View, edit, and manage all registered volunteers.</p>
      </div>

      <div className="admin-table-wrapper">
        {isUsersLoading ? (
          <div className="admin-loading">
            <Loader2 className="admin-loading-spinner" />
          </div>
        ) : (
          <>
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
                {APPROVAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              {/* filter age group */}
              <select
                className="admin-table-select"
                value={ageGroupFilter}
                onChange={(e) => setAgeGroupFilter(e.target.value)}
              >
                {AGE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? "All Age Groups" : g}
                  </option>
                ))}
              </select>

              {/* sort date direction */}
              <button
                className="admin-table-sort-btn"
                onClick={() =>
                  setSortDirection((d) =>
                    d === "descending" ? "ascending" : "descending",
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
                  setAgeGroupFilter("All");
                  setSortDirection("descending");
                }}
              >
                Clear All
              </button>
            </div>

            {/* volunteer cards */}
            {filteredVolunteers.length > 0 ? (
              <div className="admin-volunteer-card-list admin-volunteer-scroll">
                {filteredVolunteers.map((volunteer) => (
                  <ManageVolunteerCard
                    key={volunteer._id}
                    volunteer={volunteer}
                    onManage={setSelectedVolunteer}
                  />
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <AlertCircle className="admin-empty-icon" />
                <h3>No volunteers found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PreviewVolunteer popup after admin clicked on "manage button" of ManageVolunteerCard */}
      {selectedVolunteer && (
        <PreviewVolunteer
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
        />
      )}
    </div>
  );
};

export default ManageVolunteer;
