import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpDown,
  Inbox,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OpportunityCard from "../../components/OpportunityCard";
import {
  getOpportunityPublishedTimestamp,
  getOpportunitySortTimestamp,
  opportunityMatchesSearch,
} from "../../lib/opportunity";
import "./Organisation.css";
import "../../components/OpportunityCard.css";

const STATUS_OPTIONS = ["active", "closed", "cancelled", "completed"];
const TIME_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Past 24h" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
];

const OrganisationOpportunity = () => {
  const navigate = useNavigate();
  const {
    allMyOpportunities,
    getAllMyOpportunities,
    isOpportunitiesLoading,
    opportunitiesError,
  } = useOrganisationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getAllMyOpportunities();
  }, [getAllMyOpportunities]);

  const opportunities = useMemo(
    () => (Array.isArray(allMyOpportunities) ? allMyOpportunities : []),
    [allMyOpportunities],
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter || timeFilter !== "all",
  );

  const filtered = useMemo(() => {
    let result = [...opportunities];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((opportunity) =>
        opportunityMatchesSearch(opportunity, searchQuery),
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(
        (opp) => (opp.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      let cutoff;
      switch (timeFilter) {
        case "24h":
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = null;
      }
      if (cutoff) {
        result = result.filter((opp) => {
          const publishedAt = getOpportunityPublishedTimestamp(opp);
          return publishedAt >= cutoff.getTime();
        });
      }
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = getOpportunitySortTimestamp(a);
      const dateB = getOpportunitySortTimestamp(b);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [opportunities, searchQuery, statusFilter, timeFilter, sortAsc]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTimeFilter("all");
    setSortAsc(false);
  };

  return (
    <div className="organisation-page">
      <header className="organisation-page-header">
        <h1>Opportunities</h1>
        <p>View and manage all your posted opportunities</p>
      </header>

      <div className="organisation-table-wrapper">
        <div className="organisation-table-toolbar">
          <div className="organisation-table-search-wrapper">
            <Search size={16} className="organisation-table-search-icon" />
            <input
              type="search"
              className="organisation-table-search"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search organisation opportunities"
            />
          </div>

          <select
            className="organisation-table-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter opportunities by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="organisation-table-select"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            aria-label="Filter opportunities by publish time"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="organisation-table-sort-btn"
            onClick={() => setSortAsc((prev) => !prev)}
            aria-label={`Sort opportunities by event date: ${
              sortAsc ? "oldest first" : "newest first"
            }`}
          >
            <ArrowUpDown size={14} />
            {sortAsc ? "Oldest first" : "Newest first"}
          </button>

          {hasActiveFilters || sortAsc ? (
            <button
              type="button"
              className="organisation-table-clear-btn"
              onClick={clearAllFilters}
            >
              <X size={14} />
              Clear all
            </button>
          ) : null}
        </div>

        <div className="org-opp-list">
          {isOpportunitiesLoading ? (
            <div className="organisation-empty">
              <Loader2 size={40} className="organisation-empty-icon" />
              <h3>Loading opportunities</h3>
              <p>Please wait while your postings are loaded.</p>
            </div>
          ) : opportunitiesError ? (
            <div className="organisation-empty" role="alert">
              <AlertCircle size={40} className="organisation-empty-icon" />
              <h3>Unable to load opportunities</h3>
              <p>{opportunitiesError}</p>
              <div className="organisation-empty-actions">
                <button type="button" onClick={getAllMyOpportunities}>
                  Try again
                </button>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                showActionButtons
                actions={["view", "edit"]}
                onAction={(type, id) => {
                    if (type === 'edit') {
                      navigate(`/organisation-dashboard/edit-opportunity/${id}`);
                    }
                    if (type === 'view') {
                      navigate(`/organisation-dashboard/view-opportunity/${id}`);
                    }
                  }
                }
              />
            ))
          ) : (
            <div className="organisation-empty">
              <Inbox size={40} className="organisation-empty-icon" />
              <h3>No opportunities found</h3>
              <p>
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "You haven't posted any opportunities yet"}
              </p>
              {!hasActiveFilters && (
                <div className="organisation-empty-actions">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/organisation-dashboard/create-opportunity")
                    }
                  >
                    <Plus size={16} /> Create opportunity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationOpportunity;
