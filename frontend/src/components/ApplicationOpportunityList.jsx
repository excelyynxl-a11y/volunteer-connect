import { useMemo, useState } from "react";
import { formatDate } from "../lib/utils";
import { ArrowRight, ClipboardList, Search } from "lucide-react";

// application management
const ApplicationOpportunityList = ({ opportunities, onManage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active opportunities");
  const [sortOrder, setSortOrder] = useState("newest");

  const visibleOpportunities = useMemo(() => {
    let list = [...opportunities];

    if (statusFilter === "Active opportunities") {
      list = list.filter((o) => o.status === "Active");
    } else if (statusFilter === "Closed opportunities") {
      list = list.filter((o) => o.status === "Closed");
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((o) => o.title.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      const diff = new Date(a.eventDate) - new Date(b.eventDate);
      return sortOrder === "newest" ? -diff : diff;
    });

    return list;
  }, [opportunities, searchTerm, statusFilter, sortOrder]);

  const countByStatus = (applications, status) =>
  status === "All"
    ? applications.length
    : applications.filter((a) => a.status === status).length;


  return (
    <div className="organisation-page">
      <div className="organisation-page-header">
        <h1>Application Management</h1>
        <p>Choose an opportunity to review its volunteer applications.</p>
      </div>

      <div className="organisation-table-wrapper">
        <div className="organisation-table-toolbar">
          <div className="organisation-table-search-wrapper">
            <Search size={16} className="organisation-table-search-icon" />
            <input
              type="text"
              className="organisation-table-search"
              placeholder="Search opportunities"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="organisation-table-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Active opportunities</option>
            <option>Closed opportunities</option>
            <option>All opportunities</option>
          </select>

          <select
            className="organisation-table-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {visibleOpportunities.length === 0 ? (
          <div className="organisation-empty">
            <ClipboardList className="organisation-empty-icon" />
            <h3>No opportunities found</h3>
            <p>Try a different search term or filter.</p>
          </div>
        ) : (
          <table className="organisation-table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Event date</th>
                <th>Deadline</th>
                <th>Pending</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleOpportunities.map((opp) => {
                const pendingCount = countByStatus(opp.applications, "Pending");
                const approvedCount = countByStatus(
                  opp.applications,
                  "Approved"
                );

                return (
                  <tr key={opp.id}>
                    <td>
                      <strong>{opp.title}</strong>
                      <br />
                      <span style={{ color: "#9a8268", fontSize: "13px" }}>
                        {opp.category} · {opp.location}
                      </span>
                    </td>
                    <td>{formatDate(opp.eventDate)}</td>
                    <td>{formatDate(opp.deadline)}</td>
                    <td>
                      {pendingCount > 0 ? (
                        <span className="app-pending-badge">
                          <span className="organisation-status-dot" />
                          {pendingCount} pending
                        </span>
                      ) : (
                        <span style={{ color: "#bfc4c8" }}>None</span>
                      )}
                    </td>
                    <td>
                      {approvedCount} / {opp.capacity} approved
                    </td>
                    <td>
                      <button
                        type="button"
                        className="app-manage-btn"
                        onClick={() => onManage(opp.id)}
                      >
                        <ArrowRight size={14} /> Manage Applications
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicationOpportunityList;