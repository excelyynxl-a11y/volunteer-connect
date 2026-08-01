import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Eye,
  ClipboardList,
  Calendar,
} from "lucide-react";

const DEFAULT_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Community Food Drive Helper",
    category: "Community",
    location: "Selangor",
    status: "Active",
    eventDate: "2026-06-04",
    deadline: "2026-06-02",
    capacity: 25,
    applications: [
      {
        id: "app-1",
        volunteerName: "Alicia Tan",
        volunteerInitials: "AT",
        submittedOn: "2026-05-29",
        status: "Pending",
        skills: ["First Aid", "Logistics"],
        availability: [
          { day: "Saturday", time: "9:00 am – 2:00 pm", preference: "preferred" },
        ],
      },
      {
        id: "app-2",
        volunteerName: "Jason Lee",
        volunteerInitials: "JL",
        submittedOn: "2026-05-29",
        status: "Pending",
        skills: ["Driving", "Heavy Lifting"],
        availability: [
          { day: "Saturday", time: "9:00 am – 2:00 pm", preference: "available" },
        ],
      },
      {
        id: "app-3",
        volunteerName: "Nur Maya",
        volunteerInitials: "NM",
        submittedOn: "2026-05-28",
        status: "Approved",
        skills: ["Public Speaking"],
        availability: [
          { day: "Saturday", time: "9:00 am – 2:00 pm", preference: "available" },
        ],
      },
      {
        id: "app-4",
        volunteerName: "Rachel Wong",
        volunteerInitials: "RW",
        submittedOn: "2026-05-27",
        status: "Rejected",
        rejectionMessage:
          "We received more applications than available spaces for this slot.",
        skills: ["Photography"],
        availability: [
          { day: "Sunday", time: "9:00 am – 1:00 pm", preference: "available" },
        ],
      },
      {
        id: "app-5",
        volunteerName: "Amir Rahman",
        volunteerInitials: "AR",
        submittedOn: "2026-05-26",
        status: "Withdrawn",
        skills: ["Cooking"],
        availability: [
          { day: "Saturday", time: "9:00 am – 2:00 pm", preference: "available" },
        ],
      },
    ],
  },
  {
    id: "opp-2",
    title: "Family Support Packing Day",
    category: "Community",
    location: "Selangor",
    status: "Active",
    eventDate: "2026-06-14",
    deadline: "2026-06-11",
    capacity: 22,
    applications: [
      {
        id: "app-6",
        volunteerName: "Wei Ling",
        volunteerInitials: "WL",
        submittedOn: "2026-06-01",
        status: "Pending",
        skills: ["Packing", "Organisation"],
        availability: [
          { day: "Sunday", time: "10:00 am – 2:00 pm", preference: "preferred" },
        ],
      },
      {
        id: "app-7",
        volunteerName: "Farid Aziz",
        volunteerInitials: "FA",
        submittedOn: "2026-06-02",
        status: "Pending",
        skills: ["Driving"],
        availability: [
          { day: "Sunday", time: "10:00 am – 2:00 pm", preference: "available" },
        ],
      },
    ],
  },
  {
    id: "opp-3",
    title: "Neighbourhood Meal Service",
    category: "Community",
    location: "Selangor",
    status: "Active",
    eventDate: "2026-06-20",
    deadline: "2026-06-17",
    capacity: 14,
    applications: [
      {
        id: "app-8",
        volunteerName: "Siti Aminah",
        volunteerInitials: "SA",
        submittedOn: "2026-06-05",
        status: "Pending",
        skills: ["Cooking", "Serving"],
        availability: [
          { day: "Saturday", time: "5:00 pm – 8:00 pm", preference: "preferred" },
        ],
      },
    ],
  },
  {
    id: "opp-4",
    title: "Closed Food Bank Inventory",
    category: "Community",
    location: "Selangor",
    status: "Closed",
    eventDate: "2026-05-21",
    deadline: "2026-05-18",
    capacity: 5,
    applications: [
      {
        id: "app-9",
        volunteerName: "Tan Wei Jie",
        volunteerInitials: "TW",
        submittedOn: "2026-05-10",
        status: "Approved",
        skills: ["Inventory Management"],
        availability: [
          { day: "Thursday", time: "1:00 pm – 5:00 pm", preference: "available" },
        ],
      },
    ],
  },
];

const TABS = ["All", "Pending", "Approved", "Rejected", "Withdrawn"];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const countByStatus = (applications, status) =>
  status === "All"
    ? applications.length
    : applications.filter((a) => a.status === status).length;

/* ------------------------------------------------------------------ */
/* Opportunity list — "Application Management"                        */
/* ------------------------------------------------------------------ */
const OpportunityListView = ({ opportunities, onManage }) => {
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

/* Per-opportunity applications detail                                 */
const OpportunityDetailView = ({ opportunity, onBack, onDecision }) => {
  const [applications, setApplications] = useState(opportunity.applications);
  const [activeTab, setActiveTab] = useState("All");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    setApplications(opportunity.applications);
    setActiveTab("All");
  }, [opportunity]);

  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach((tab) => {
      counts[tab] = countByStatus(applications, tab);
    });
    return counts;
  }, [applications]);

  const visibleApplications = useMemo(() => {
    if (activeTab === "All") return applications;
    return applications.filter((a) => a.status === activeTab);
  }, [applications, activeTab]);

  const approvedCount = countByStatus(applications, "Approved");
  const pendingCount = countByStatus(applications, "Pending");
  const spotsRemaining = Math.max(opportunity.capacity - approvedCount, 0);

  const openReview = (app) => {
    setReviewTarget(app);
    setRejectMode(false);
    setRejectionReason("");
  };

  const closeReview = () => {
    setReviewTarget(null);
    setRejectMode(false);
    setRejectionReason("");
  };

  const applyDecision = (id, status, reason) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, rejectionMessage: reason || a.rejectionMessage }
          : a
      )
    );
    onDecision?.(opportunity.id, id, status, reason);
    closeReview();
  };

  const isDecided = reviewTarget && reviewTarget.status !== "Pending";

  return (
    <div className="organisation-page">
      <div className="app-detail-header">
        <div>
          <p className="app-detail-eyebrow">Opportunity applications</p>
          <h1>{opportunity.title}</h1>
          <span className="app-detail-subtitle">
            {formatDate(opportunity.eventDate)} · Application deadline{" "}
            {formatDate(opportunity.deadline)}
          </span>
        </div>
        <button type="button" className="app-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Opportunities
        </button>
      </div>

      <div className="app-detail-stats">
        <div className="app-detail-stat-card">
          <span>Pending applications</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="app-detail-stat-card">
          <span>Approved volunteers</span>
          <strong>
            {approvedCount} / {opportunity.capacity}
          </strong>
        </div>
        <div className="app-detail-stat-card">
          <span>Spots remaining</span>
          <strong>{spotsRemaining}</strong>
        </div>
      </div>

      <div className="organisation-table-wrapper">
        <div className="app-status-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`app-status-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} {tabCounts[tab]}
            </button>
          ))}
        </div>

        {visibleApplications.length === 0 ? (
          <div className="organisation-empty">
            <ClipboardList className="organisation-empty-icon" />
            <h3>No applications here yet</h3>
            <p>Nothing matches this status for this opportunity.</p>
          </div>
        ) : (
          <table className="organisation-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Profile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="app-volunteer-cell">
                      <span className="app-volunteer-avatar">
                        {app.volunteerInitials}
                      </span>
                      <strong>{app.volunteerName}</strong>
                    </div>
                  </td>
                  <td>{formatDate(app.submittedOn)}</td>
                  <td>
                    <span
                      className={`organisation-status ${app.status.toLowerCase()}`}
                    >
                      <span className="organisation-status-dot" />
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="app-view-details-btn"
                      onClick={() => openReview(app)}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                  <td>
                    {app.status === "Pending" ? (
                      <div className="app-row-actions">
                        <button
                          type="button"
                          className="app-approve-btn"
                          onClick={() => applyDecision(app.id, "Approved")}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          className="app-reject-btn"
                          onClick={() => openReview({ ...app, __reject: true })}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="app-decision-recorded">
                        Decision recorded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {reviewTarget && (
        <div className="organisation-modal-overlay" onClick={closeReview}>
          <div
            className="organisation-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="organisation-modal-header">
              <h2>{reviewTarget.volunteerName}</h2>
              <button
                type="button"
                className="organisation-modal-close"
                onClick={closeReview}
              >
                <X size={18} />
              </button>
            </div>

            <div className="organisation-modal-body">
              <p className="app-modal-label">Skills</p>
              <div className="organisation-skill-tags" style={{ marginBottom: "20px" }}>
                {reviewTarget.skills?.length ? (
                  reviewTarget.skills.map((skill) => (
                    <span className="organisation-skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="app-modal-empty">No skills listed</span>
                )}
              </div>

              <p className="app-modal-label">Availability</p>
              <div className="organisation-availability-list" style={{ marginBottom: "20px" }}>
                {reviewTarget.availability?.length ? (
                  reviewTarget.availability.map((slot) => (
                    <span
                      className="organisation-availability-slot"
                      key={`${slot.day}-${slot.time}`}
                    >
                      <Calendar size={13} />
                      {slot.day} · {slot.time}
                      <span
                        className={`organisation-availability-pref ${slot.preference}`}
                      >
                        {slot.preference}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="app-modal-empty">
                    No availability provided
                  </span>
                )}
              </div>

              {isDecided && (
                <span
                  className={`organisation-status ${reviewTarget.status.toLowerCase()}`}
                >
                  <span className="organisation-status-dot" />
                  Already {reviewTarget.status.toLowerCase()}
                </span>
              )}

              {isDecided && reviewTarget.rejectionMessage && (
                <p className="app-modal-reason">
                  Reason sent: “{reviewTarget.rejectionMessage}”
                </p>
              )}

              {!isDecided && (reviewTarget.__reject || rejectMode) && (
                <div>
                  <p className="app-modal-label">
                    Reason for rejection (optional)
                  </p>
                  <textarea
                    className="app-modal-textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Let the volunteer know why this application wasn't successful..."
                  />
                </div>
              )}
            </div>

            {!isDecided && (
              <div className="organisation-modal-footer">
                {!(reviewTarget.__reject || rejectMode) ? (
                  <>
                    <button
                      type="button"
                      className="organisation-modal-approve-btn"
                      onClick={() =>
                        applyDecision(reviewTarget.id, "Approved")
                      }
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      type="button"
                      className="organisation-modal-reject-btn"
                      onClick={() => setRejectMode(true)}
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="organisation-table-clear-btn"
                      onClick={() => {
                        setRejectMode(false);
                        setReviewTarget((prev) =>
                          prev ? { ...prev, __reject: false } : prev
                        );
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="organisation-modal-reject-btn"
                      onClick={() =>
                        applyDecision(
                          reviewTarget.id,
                          "Rejected",
                          rejectionReason.trim()
                        )
                      }
                    >
                      <X size={16} /> Confirm rejection
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* Top-level: switches between list view and detail view              */

const OrganisationApplication = ({
  opportunities: opportunitiesProp,
  onDecision,
}) => {
  const [opportunities, setOpportunities] = useState(
    opportunitiesProp ?? DEFAULT_OPPORTUNITIES
  );
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (opportunitiesProp) {
      setOpportunities(opportunitiesProp);
    }
  }, [opportunitiesProp]);

  const selectedOpportunity = opportunities.find((o) => o.id === selectedId);

  const handleDecision = (opportunityId, applicationId, status, reason) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id !== opportunityId
          ? opp
          : {
              ...opp,
              applications: opp.applications.map((a) =>
                a.id === applicationId
                  ? {
                      ...a,
                      status,
                      rejectionMessage: reason || a.rejectionMessage,
                    }
                  : a
              ),
            }
      )
    );
    onDecision?.(opportunityId, applicationId, status, reason);
  };

  if (selectedOpportunity) {
    return (
      <OpportunityDetailView
        opportunity={selectedOpportunity}
        onBack={() => setSelectedId(null)}
        onDecision={handleDecision}
      />
    );
  }

  return (
    <OpportunityListView
      opportunities={opportunities}
      onManage={(id) => setSelectedId(id)}
    />
  );
};

export default OrganisationApplication;