import { useMemo, useState } from "react";
import { formatDate } from "../lib/utils";
import { ArrowLeft, Check, ClipboardList, Eye, X, Calendar } from "lucide-react";
import { APPLICATION_TABS } from "../lib/application";

const ApplicationOpportunityDetail = ({
  opportunity,
  onBack,
  onApprove,
  onReject,
  onViewVolunteer,
}) => {
  const [activeTab, setActiveTab] = useState("All");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const applications = opportunity?.applications || [];

  const countByStatus = (apps, status) =>
    status === "All"
      ? apps.length
      : apps.filter((a) => a.status === status).length;

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
  const spotsRemaining = Math.max((opportunity?.capacity || 0) - approvedCount, 0);

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
          <h1>{opportunity?.title}</h1>
          <span className="app-detail-subtitle">
            {formatDate(opportunity?.eventDate)} · Application deadline{" "}
            {formatDate(opportunity?.deadline)}
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
            {approvedCount} / {opportunity?.capacity || 0}
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
              {visibleApplications.map((app, index) => {
                const appId = app.id || app._id || `app-${index}`;
                return (
                  <tr key={appId}>
                    <td>
                      <div className="app-volunteer-cell">
                        <span className="app-volunteer-avatar">
                          {app.volunteerInitials || app.volunteerName?.[0] || "V"}
                        </span>
                        <strong>{app.volunteerName || "Volunteer"}</strong>
                      </div>
                    </td>
                    <td>{formatDate(app.submittedOn || app.createdAt)}</td>
                    <td>
                      <span
                        className={`organisation-status ${app.status?.toLowerCase()}`}
                      >
                        <span className="organisation-status-dot" />
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="app-view-details-btn"
                        disabled={!app.volunteerId}
                        onClick={() => onViewVolunteer(app.volunteerId)}
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
                            onClick={() => handleApprove(appId)}
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
                );
              })}
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
              <h2>{reviewTarget.volunteerName || "Volunteer Details"}</h2>
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
                  reviewTarget.skills.map((skill, index) => {
                    const label = typeof skill === "string" ? skill : skill.name || skill.label;
                    return (
                      <span className="organisation-skill-tag" key={skill._id || `${label}-${index}`}>
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="app-modal-empty">No skills listed</span>
                )}
              </div>

              <p className="app-modal-label">Availability</p>
              <div className="organisation-availability-list" style={{ marginBottom: "20px" }}>
                {reviewTarget.availability?.length ? (
                  reviewTarget.availability.map((slot, index) => {
                    const day = slot.day || slot.dayOfWeek || "Day";
                    const time = slot.time || slot.timeSlot || "Time";
                    return (
                      <span
                        className="organisation-availability-slot"
                        key={slot._id || `${day}-${time}-${index}`}
                      >
                        <Calendar size={13} />
                        {day} · {time}
                        {slot.preference && (
                          <span
                            className={`organisation-availability-pref ${slot.preference}`}
                          >
                            {slot.preference}
                          </span>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="app-modal-empty">
                    No availability provided
                  </span>
                )}
              </div>

              {isDecided && (
                <span
                  className={`organisation-status ${reviewTarget.status?.toLowerCase()}`}
                >
                  <span className="organisation-status-dot" />
                  Already {reviewTarget.status?.toLowerCase()}
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
                        handleApprove(reviewTarget.id || reviewTarget._id)
                      }
                    >
                      <Check size={16} /> {isSubmittingDecision ? "Approving..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="organisation-modal-reject-btn"
                      disabled={isSubmittingDecision}
                      onClick={() => handleReject(reviewTarget.id || reviewTarget._id, rejectionReason.trim())}
                    >
                      <X size={16} /> {isSubmittingDecision ? "Confirm rejection" : "Confirm rejection"}
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
                        handleReject(reviewTarget.id || reviewTarget._id, rejectionReason.trim())
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

export default ApplicationOpportunityDetail;
