import React, { useMemo, useState } from "react";
import { ArrowUpDown, AlertCircle, Search } from "lucide-react";
import ManageOpportunityCard from "../../components/ManageOpportunityCard";
import PreviewOpportunity from "../../components/PreviewOpportunity";
import { useAdminStore } from "../../store/useAdminStore";
import { useEffect } from "react";

const STATUS_OPTIONS = ["All", "active", "completed", "closed", "cancelled"];
const CATEGORY_OPTIONS = [
  "All",
  "Environment",
  "Education",
  "Health",
  "Community",
  "Animal Welfare",
  "Elderly Care",
  "Disability Support",
  "Event Support",
  "Fundraising",
  "Other",
];
const DATE_FILTER_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Past Day", value: "day" },
  { label: "Past Week", value: "week" },
  { label: "Past Month", value: "month" },
];

const ManageOpportunity = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("descending");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { getAllOpportunities, isOpportunitiesLoading, opportunities } = useAdminStore();
  
  useEffect(() => {
      getAllOpportunities()
  }, [getAllOpportunities]); 

  // filter functions
  const filteredOpportunities = useMemo(() => {
    let result = opportunities;
    console.log(opportunities);
    
    console.log(result);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((opportunity) => {
        return (
          opportunity.title?.toLowerCase().includes(term) ||
          opportunity.location?.toLowerCase().includes(term) ||
          opportunity.organisationId?.name?.toLowerCase().includes(term)
        );
      });
    }

    if (categoryFilter !== "All") {
      result = result.filter((opportunity) => {
        const categories = opportunity.category || [];
        if (categoryFilter === "Other") {
          return categories.length === 0 || categories.includes("Other");
        }

        return categories.includes(categoryFilter);
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (opportunity) => opportunity.status === statusFilter,
      );
    }

    if (dateFilter !== "all") {
      const now = Date.now();
      const daysAgo = dateFilter === "day" ? 1 : dateFilter === "week" ? 7 : 30;
      const cutoff = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      result = result.filter((opportunity) => {
        const publishedAt = opportunity.publishedAt || opportunity.createdAt;
        if (!publishedAt) return false;
        return new Date(publishedAt) >= cutoff;
      });
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.startAt || a.publishedAt || a.createdAt);
      const dateB = new Date(b.startAt || b.publishedAt || b.createdAt);
      return sortDirection === "descending" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [
    opportunities,
    searchTerm,
    sortDirection,
    statusFilter,
    categoryFilter,
    dateFilter,
  ]);

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

          {/* Search bar */}
          <div className="admin-table-search-wrapper">
            <Search size={16} className="admin-table-search-icon" />
            <input
              type="text"
              className="admin-table-search"
              placeholder="Search by title or location or org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* filter by category */}
          <select
            className="admin-table-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* filter by status */}
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

          {/* filter by last past 24 hrs, past week, past month, all time */}
          <select
            className="admin-table-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            {DATE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            title={`Sort by date (${sortDirection})`}
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
              setStatusFilter("All");
              setCategoryFilter("All");
              setDateFilter("all");
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
