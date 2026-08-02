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
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useApplicationStore } from "../../store/useApplicationStore";
import { formatDate, getInitials } from "../../lib/utils";
import { APPLICARION_TAB_STATUS_LABELS, APPLICATION_TABS } from "../../lib/application";

const countByStatus = (applications, status) =>
  status === "All"
    ? applications.length
    : applications.filter((a) => a.status === status).length;

const mapApplicationToViewModel = (application) => ({
  id: application._id,
  volunteerName: application.volunteerId?.name || "Unknown volunteer",
  volunteerInitials: getInitials(application.volunteerId?.name),
  submittedOn: application.createdAt,
  status: APPLICARION_TAB_STATUS_LABELS[application.status] || application.status,
  rejectionMessage: application.withdrawalReason || "",
  skills: application.volunteerId?.skills || [],
  availability: application.volunteerId?.availability || [],
});

const mapOpportunityToViewModel = (opportunity, applicationsForOpportunity) => ({
  id: opportunity._id,
  title: opportunity.title,
  category: Array.isArray(opportunity.category)
    ? opportunity.category.join(", ")
    : opportunity.category,
  location: opportunity.location,
  status:
    opportunity.status?.charAt(0).toUpperCase() + opportunity.status?.slice(1),
  eventDate: opportunity.startAt,
  deadline: opportunity.applicationDeadline,
  capacity: opportunity.maxVolunteers || 0,
  applications: applicationsForOpportunity.map(mapApplicationToViewModel),
});

// application management
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

const OpportunityDetailView = ({ opportunity, onBack, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const applications = opportunity.applications;

  const tabCounts = useMemo(() => {
    const counts = {};
    APPLICATION_TABS.forEach((tab) => {
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

  const handleApprove = async (applicationId) => {
    setIsSubmittingDecision(true);
    try {
      await onApprove(applicationId);
      closeReview();
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleReject = async (applicationId, reason) => {
    setIsSubmittingDecision(true);
    try {
      await onReject(applicationId, reason);
      closeReview();
    } finally {
      setIsSubmittingDecision(false);
    }
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
          {APPLICATION_TABS.map((tab) => (
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
                          disabled={isSubmittingDecision}
                          onClick={() => handleApprove(app.id)}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          className="app-reject-btn"
                          disabled={isSubmittingDecision}
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
                      disabled={isSubmittingDecision}
                      onClick={() =>
                        handleApprove(reviewTarget.id)
                      }
                    >
                      <Check size={16} /> {isSubmittingDecision ? "Approving..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="organisation-modal-reject-btn"
                      disabled={isSubmittingDecision}
                      onClick={() => handleReject(reviewTarget.id, rejectionReason.trim())}
                    >
                      <X size={16} /> {isSubmittingDecision ? "Rejecting..." : "Confirm rejection"}
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
                        handleReject(reviewTarget.id, rejectionReason.trim())
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

const OrganisationApplication = () => {
  const {
    allMyOpportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getMyOpportunities,
  } = useOrganisationStore();
  const {
    applications,
    isApplicationsLoading,
    applicationsError,
    getMyOrganisationApplications,
    approveApplication,
    rejectApplication,
  } = useApplicationStore();

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    getMyOpportunities();
    getMyOrganisationApplications();
  }, [getMyOpportunities, getMyOrganisationApplications]);

  const opportunityViewModels = useMemo(() => {
    return allMyOpportunities.map((opportunity) => {
      const applicationsForOpportunity = applications.filter(
        (application) => application.opportunityId?._id === opportunity._id
      );
      return mapOpportunityToViewModel(opportunity, applicationsForOpportunity);
    });
  }, [allMyOpportunities, applications]);

  const selectedOpportunity = opportunityViewModels.find(
    (o) => o.id === selectedId
  );

  const handleApprove = async (applicationId) => {
    await approveApplication(applicationId);
    await getMyOrganisationApplications();
  };

  const handleReject = async (applicationId, reason) => {
    await rejectApplication(applicationId, reason);
    await getMyOrganisationApplications();
  };

  if (opportunitiesError || applicationsError) {
    return (
      <div className="organisation-page">
        <p>{opportunitiesError || applicationsError}</p>
      </div>
    );
  }

  if (isOpportunitiesLoading || isApplicationsLoading) {
    return (
      <div className="organisation-page">
        <p>Loading opportunities...</p>
      </div>
    );
  }

  if (selectedOpportunity) {
    return (
      <OpportunityDetailView
        key={selectedOpportunity.id}
        opportunity={selectedOpportunity}
        onBack={() => setSelectedId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  return (
    <OpportunityListView
      opportunities={opportunityViewModels}
      onManage={(id) => setSelectedId(id)}
    />
  );
};

export default OrganisationApplication;