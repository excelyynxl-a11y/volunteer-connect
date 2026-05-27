import React, { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown, X, Inbox } from "lucide-react";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import OpportunityCard from "../../components/OpportunityCard";
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
  const { allMyOpportunities, getAllMyOpportunities } = useOrganisationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getAllMyOpportunities();
  }, [getAllMyOpportunities]);

  const opportunities = useMemo(() => {
    const raw = allMyOpportunities?.data ?? allMyOpportunities;
    return Array.isArray(raw) ? raw : [];
  }, [allMyOpportunities]);

  const hasActiveFilters = searchQuery || statusFilter || timeFilter !== "all";

  const filtered = useMemo(() => {
    let result = [...opportunities];

    // Search filter
    if (searchQuery.trim()) {
      const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter((opp) => {
        const text = [
          opp.title,
          opp.detail,
          opp.details,
          opp.location,
          opp.requirements,
          ...(Array.isArray(opp.category) ? opp.category : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return terms.every((term) => text.includes(term));
      });
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
          const date = new Date(opp.createdAt || opp.startAt);
          return date >= cutoff;
        });
      }
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.startAt || a.createdAt || 0);
      const dateB = new Date(b.startAt || b.createdAt || 0);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [opportunities, searchQuery, statusFilter, timeFilter, sortAsc]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTimeFilter("all");
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
              type="text"
              className="organisation-table-search"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="organisation-table-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
          >
            <ArrowUpDown size={14} />
            {sortAsc ? "Oldest first" : "Newest first"}
          </button>

          <button
              type="button"
              className="organisation-table-clear-btn"
              onClick={clearAllFilters}
            >
              <X size={14} />
              Clear all
          </button>
        </div>

        <div className="org-opp-list">
          {filtered.length > 0 ? (
            filtered.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                showActionButtons
                actions={["view", "edit"]}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationOpportunity;