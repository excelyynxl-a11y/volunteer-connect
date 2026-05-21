import React, { useMemo, useState } from "react";
import { ArrowUpDown, AlertCircle, Search } from "lucide-react";
import ManageOpportunityCard from "../../components/ManageOpportunityCard";
import PreviewOpportunity from "../../components/PreviewOpportunity";
import { useAdminStore } from "../../store/useAdminStore";

const STATUS_OPTIONS = ["All", "active", "completed", "closed", "cancelled"];

const ManageOpportunity = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState("descending");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { getAllOpportunities } = useAdminStore();
  const opportunities = getAllOpportunities();

  const filteredOpportunities = useMemo(() => {
    let result = opportunities;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((opportunity) => {
        const categoryText = (opportunity.category || []).join(" ");

        return (
          opportunity.title?.toLowerCase().includes(term) ||
          opportunity.location?.toLowerCase().includes(term) ||
          categoryText.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (opportunity) => opportunity.status === statusFilter,
      );
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.startAt || a.publishedAt || a.createdAt);
      const dateB = new Date(b.startAt || b.publishedAt || b.createdAt);
      return sortDirection === "descending" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [opportunities, searchTerm, sortDirection, statusFilter]);

  const handlePreview = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  return (
    <div className="admin-page">
      {/* Manage opportunity header */}
      <div className="admin-page-header">
        <h1>Manage Opportunities</h1>
        <p>View all opportunities created by organisation.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-search-wrapper">
            <Search size={16} className="admin-table-search-icon" />
            <input
              type="text"
              className="admin-table-search"
              placeholder="Search by title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="admin-table-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All Statuses"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button
            className="admin-table-sort-btn"
            onClick={() =>
              setSortDirection((direction) =>
                direction === "descending" ? "ascending" : "descending",
              )
            }
            title={`Sort by date (${sortDirection})`}
          >
            <ArrowUpDown size={16} />
            <span>
              {sortDirection === "descending" ? "Newest First" : "Oldest First"}
            </span>
          </button>
          <button
            className="admin-table-clear-btn"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setSortDirection("descending");
            }}
          >
            Clear All
          </button>
        </div>
        {filteredOpportunities.length > 0 ? (
          <div className="admin-volunteer-card-list admin-opportunity-card-list">
            {filteredOpportunities.map((opportunity) => (
              <ManageOpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <AlertCircle className="admin-empty-icon" />
            <h3>No opportunities found</h3>
            <p>Opportunity records will appear here once available.</p>
          </div>
        )}
      </div>
      {selectedOpportunity && (
        <PreviewOpportunity
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
};

export default ManageOpportunity;
