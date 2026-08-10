import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Undo2,
  Calendar,
  MapPin,
} from "lucide-react";
import { useApplicationStore } from "../../store/useApplicationStore";
import { formatOpportunityDate, formatOpportunityTimeRange, getOrganisationName } from "../../lib/opportunity";
import { APPLICARION_TAB_STATUS_LABELS, APPLICATION_TABS } from "../../lib/application";
import { getInitials } from "../../lib/utils";

const STATUS_META = {
  Pending: { icon: Clock, className: "status-pending" },
  Approved: { icon: CheckCircle2, className: "status-approved" },
  Rejected: { icon: XCircle, className: "status-rejected" },
  Withdrawn: { icon: Undo2, className: "status-withdrawn" },
};

const mapApplicationToViewModel = (application) => {
  const opportunity = application.opportunityId || {};
  const orgName = getOrganisationName(opportunity);

  return {
    id: application._id,
    orgInitials: getInitials(orgName),
    orgName,
    title: opportunity.title || "Opportunity unavailable",
    date: formatOpportunityDate(opportunity.startAt),
    time: formatOpportunityTimeRange(opportunity.startAt, opportunity.endAt),
    submittedOn: application.createdAt,
    status: APPLICARION_TAB_STATUS_LABELS[application.status] || application.status,
    // ✅ Look for rejectionReason or rejectionMessage from DB
    rejectionMessage:
      application.rejectionReason ||
      application.rejectionMessage ||
      "No reason was provided.",
  };
};

const VolunteerApplications = () => {
  const {
    applications,
    getMyApplications,
    withdrawApplication,
    isApplicationsLoading,
    applicationsError,
  } = useApplicationStore();

  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isWithdrawing, setIsWithdrawing] = useState(false); 

  const [detailsTarget, setDetailsTarget] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [reasonTarget, setReasonTarget] = useState(null);

  useEffect(() => {
    getMyApplications();
  }, [getMyApplications]);

  const viewModels = useMemo(
    () => applications.map(mapApplicationToViewModel),
    [applications]
  );

  const tabCounts = useMemo(() => {
    const counts = { All: viewModels.length };
    APPLICATION_TABS.slice(1).forEach((status) => {
      counts[status] = viewModels.filter((a) => a.status === status).length;
    });
    return counts;
  }, [viewModels]);

  const visibleApplications = useMemo(() => {
    let list = [...viewModels];

    if (activeTab !== "All") {
      list = list.filter((a) => a.status === activeTab);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.orgName.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => {
      const diff = new Date(a.submittedOn) - new Date(b.submittedOn);
      return sortOrder === "newest" ? -diff : diff;
    });

    return list;
  }, [viewModels, activeTab, searchTerm, sortOrder]);

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;

    setIsWithdrawing(true);
    try {
      await withdrawApplication(withdrawTarget.id);
      setWithdrawTarget(null);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="volunteer-application-page">
      {/* application header */}
      <section className="volunteer-application-hero">
        <div>
          <p>APPLICATIONS</p>
          <h1>My Applications</h1>
          <span>Track every application and manage eligible withdrawals.</span>
        </div>
      </section>

      <section className="volunteer-application-panel">
        {/* application history header */}
        <div className="volunteer-application-header">
          <div>
            <h2>Application History</h2>
            <p>
              Track all your opportunity applications and their current status.
            </p>
          </div>
        </div>

        {/* status tabs */}
        <div className="application-tabs">
          {APPLICATION_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`application-tab${
                activeTab === tab ? " active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span className="count-badge">{tabCounts[tab] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* search + sort toolbar */}
        <div className="application-toolbar">
          <label className="application-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search applications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <div className="application-sort">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* applications list */}
        {applicationsError ? (
          <div className="homepage-state-message">
            <p>{applicationsError}</p>
          </div>
        ) : isApplicationsLoading ? (
          <div className="homepage-state-message">
            <p>Loading applications...</p>
          </div>
        ) : visibleApplications.length === 0 ? (
          <div className="homepage-state-message">
            <p>No applications match this view yet.</p>
          </div>
        ) : (
          <div className="application-list">
            {visibleApplications.map((app) => {
              const meta = STATUS_META[app.status];
              const StatusIcon = meta.icon;

              return (
                <div className="application-row" key={app.id}>
                  <div className="application-avatar">{app.orgInitials}</div>

                  <div className="application-info">
                    <h3>{app.title}</h3>
                    <span>{app.orgName}</span>
                    <div className="application-meta">
                      <span>
                        <Calendar size={14} /> {app.date}
                      </span>
                      <span>
                        <MapPin size={14} /> {app.time}
                      </span>
                    </div>
                  </div>

                  <span className={`application-status-pill ${meta.className}`}>
                    <StatusIcon size={14} />
                    {app.status}
                  </span>

                  <div className="application-actions">
                    <button
                      type="button"
                      className="application-details-btn"
                      onClick={() => setDetailsTarget(app)}
                    >
                      Details
                    </button>

                    {app.status === "Pending" && (
                      <button
                        type="button"
                        className="application-withdraw-btn"
                        onClick={() => setWithdrawTarget(app)}
                      >
                        Withdraw
                      </button>
                    )}

                    {app.status === "Rejected" && (
                      <button
                        type="button"
                        className="application-reason-btn"
                        onClick={() => setReasonTarget(app)}
                      >
                        Reason
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* details modal */}
      {detailsTarget && (
        <div
          className="application-modal-overlay"
          onClick={() => setDetailsTarget(null)}
        >
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="application-modal-close"
              onClick={() => setDetailsTarget(null)}
            >
              <X size={18} />
            </button>

            <p className="application-modal-eyebrow">Application details</p>
            <h2>{detailsTarget.title}</h2>
            <p className="application-modal-subtitle">
              {detailsTarget.orgName}
            </p>

            <div className="application-modal-card">
              <strong>{detailsTarget.title}</strong>
              <span>
                {detailsTarget.orgName} · {detailsTarget.date} ·{" "}
                {detailsTarget.time}
              </span>
            </div>

            <div className="application-modal-meta-list">
              <span>
                <strong>Status</strong>
                {detailsTarget.status}
              </span>
              <span>
                <strong>Submitted on</strong>
                {new Date(detailsTarget.submittedOn).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>

            <div className="application-modal-actions">
              <button
                type="button"
                className="btn-close-green"
                onClick={() => setDetailsTarget(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* withdraw confirmation modal (Pending applications only) */}
      {withdrawTarget && (
        <div
          className="application-modal-overlay"
          onClick={() => setWithdrawTarget(null)}
        >
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-modal-icon warning">
              <AlertCircle size={24} />
            </div>

            <h2>Withdraw this application?</h2>
            <p className="application-modal-subtitle">
              You are withdrawing a pending application. It will no longer be
              considered by the organisation.
            </p>

            <div className="application-modal-card">
              <strong>{withdrawTarget.title}</strong>
              <span>
                {withdrawTarget.orgName} · {withdrawTarget.date} ·{" "}
                {withdrawTarget.time}
              </span>
            </div>

            <div className="application-modal-warning">
              After withdrawal, this application will remain in your history
              as Withdrawn.
            </div>

            <div className="application-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setWithdrawTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-withdraw-confirm"
                disabled={isWithdrawing}
                onClick={handleConfirmWithdraw}
              >
                <X size={16} /> {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* rejection reason modal */}
      {reasonTarget && (
        <div
          className="application-modal-overlay"
          onClick={() => setReasonTarget(null)}
        >
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="application-modal-close"
              onClick={() => setReasonTarget(null)}
            >
              <X size={18} />
            </button>

            <p className="application-modal-eyebrow rejected">
              Application rejected
            </p>
            <h2>Rejection reason</h2>

            <div className="application-modal-card">
              <strong>{reasonTarget.title}</strong>
              <span>
                {reasonTarget.orgName} · Submitted{" "}
                {new Date(reasonTarget.submittedOn).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>

            <div className="application-modal-message">
              <strong>Message from {reasonTarget.orgName}</strong>
              <p>{reasonTarget.rejectionMessage}</p>
            </div>

            <p className="application-modal-footer-note">
              This decision is final and the same opportunity cannot be
              applied for again.
            </p>

            <div className="application-modal-actions">
              <button
                type="button"
                className="btn-close-green"
                onClick={() => setReasonTarget(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerApplications;