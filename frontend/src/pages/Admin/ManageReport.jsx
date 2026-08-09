import React, { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown, Loader2 } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import ReportMadeCard from "../../components/ReportMadeCard";

const STATUS_OPTIONS = ["All", "Pending", "Investigating", "Resolved", "Dismissed"];
const REPORT_TYPE_OPTIONS = ["All", "UserViolation", "OpportunityViolation"];

const ManageReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reportTypeFilter, setReportTypeFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState("descending");

  const { getAllReports, isReportsLoading, reports } = useAdminStore();

  useEffect(() => {
    getAllReports();
  }, [getAllReports]);

  const filteredReports = useMemo(() => {
    let result = reports;

    // search by title, violation type, or target name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(term) ||
          r.userViolationType?.toLowerCase().includes(term) ||
          r.opportunityViolationType?.toLowerCase().includes(term) ||
          r.reportedUserId?.name?.toLowerCase().includes(term) ||
          r.reportedOpportunityId?.title?.toLowerCase().includes(term)
      );
    }

    // filter by status
    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // filter by report type
    if (reportTypeFilter !== "All") {
      result = result.filter((r) => r.reportType === reportTypeFilter);
    }

    // sort by createdAt
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === "descending" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [searchTerm, statusFilter, reportTypeFilter, sortDirection, reports]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setReportTypeFilter("All");
    setSortDirection("descending");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    reportTypeFilter !== "All" ||
    sortDirection !== "descending";

  return (
    <div className="admin-page">
      {/* manage report header */}
      <div className="admin-page-header">
        <h1>Manage Reports</h1>
        <p>Review and resolve user-submitted reports.</p>
      </div>

      <div className="admin-table-wrapper">
        {isReportsLoading ? (
          <div className="admin-loading">
            <Loader2 className="admin-loading-spinner" />
          </div>
        ) : (
          <>
            {/* search and filter toolbar */}
            <div className="admin-table-toolbar">
              {/* search bar */}
              <div className="admin-table-search-wrapper">
                <Search size={16} className="admin-table-search-icon" />
                <input
                  type="text"
                  className="admin-table-search"
                  placeholder="Search by title, type, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* filter by report status */}
              <select
                className="admin-table-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s}
                  </option>
                ))}
              </select>

              {/* filter by report type */}
              <select
                className="admin-table-select"
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
              >
                {REPORT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === "All"
                      ? "All Types"
                      : t === "UserViolation"
                        ? "User Violation"
                        : "Opportunity Violation"}
                  </option>
                ))}
              </select>

              {/* sort date direction */}
              <button
                className="admin-table-sort-btn"
                onClick={() =>
                  setSortDirection((d) =>
                    d === "descending" ? "ascending" : "descending"
                  )
                }
                title={`Sort by date submitted (${sortDirection})`}
              >
                <ArrowUpDown size={16} />
                <span>
                  {sortDirection === "descending" ? "Newest First" : "Oldest First"}
                </span>
              </button>

              {/* clear all filters button */}
              {hasActiveFilters && (
                <button
                  className="admin-table-clear-btn"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* report cards */}
            {filteredReports.length === 0 ? (
              <div className="volunteer-report-empty">
                {reports.length === 0
                  ? "No reports have been submitted yet."
                  : "No reports match your current filters."}
              </div>
            ) : (
              <div className="admin-report-card-list">
                {filteredReports.map((report) => (
                  <ReportMadeCard key={report._id} report={report} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageReport;
