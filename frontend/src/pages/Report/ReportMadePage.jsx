import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowBigLeft, Pencil } from "lucide-react";
import { useReportStore } from "../../store/useReportStore";
import { useAdminStore } from "../../store/useAdminStore";
import { reportStatus } from "../../lib/report";
import { formatDate } from "../../lib/utils";

const ReportMadePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId } = useParams();
  const { previousReports } = useReportStore();
  const { reports, updateReportStatus } = useAdminStore();

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);

  // read report from navigation state, fall back to store lookup by id
  const report =
    location.state?.report ||
    previousReports.find((r) => r._id === reportId) ||
    reports.find((r) => r._id === reportId);

  const basePath = location.pathname.startsWith("/admin-dashboard")
    ? "/admin-dashboard"
    : location.pathname.startsWith("/organisation-dashboard")
      ? "/organisation-dashboard"
      : "/volunteer-dashboard";

  const isAdmin = basePath === "/admin-dashboard";

  const handleBack = () => {
    const backPath = location.pathname.startsWith("/admin-dashboard")
      ? `${basePath}/manage-report`
      : `${basePath}/report`;
    navigate(backPath);
  };

  const currentStatus = localStatus || report?.status || "Pending";

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsEditingStatus(false);
      return;
    }
    const result = await updateReportStatus(report._id, newStatus);
    if (result.success) {
      setLocalStatus(newStatus);
    }
    setIsEditingStatus(false);
  };

  const status = currentStatus.toLowerCase();

  const violationType =
    report?.userViolationType || report?.opportunityViolationType;

  // reported target: opportunity (for volunteer reports) or volunteer (for organisation reports)
  const isUserViolation = report?.reportType === "UserViolation";
  const targetLabel = isUserViolation
    ? "Reported Volunteer"
    : "Reported Opportunity";
  const targetName =
    report?.reportedUserId?.name || report?.reportedOpportunityId?.title;

  if (!report) {
    return (
      <div className="report-made-page">
        <button className="report-made-back" onClick={handleBack}>
          <ArrowBigLeft /> Back
        </button>
        <div className="volunteer-report-empty">
          Report not found. It may have been removed.
        </div>
      </div>
    );
  }

  return (
    <div className="report-made-page">
      {/* back button */}
      <button className="report-made-back" onClick={handleBack}>
        <ArrowBigLeft /> Back
      </button>

      <section className="volunteer-report-panel">
        {/* report header */}
        <div className="report-made-page-header">
          <div>
            <span className="report-made-card-category">
              {violationType || "Uncategorised"}
            </span>
            <h2>{report.title || "Untitled report"}</h2>
          </div>
          <div className="report-made-status-group">
            <span className={`report-card-status ${status}`}>
              {currentStatus}
            </span>
            {isAdmin && (
              <div className="report-made-edit-wrapper">
                <button
                  className="report-made-edit-btn"
                  onClick={() => setIsEditingStatus((prev) => !prev)}
                  title="Edit report status"
                >
                  <Pencil size={14} />
                </button>
                {isEditingStatus && (
                  <div className="report-made-status-dropdown">
                    {reportStatus.map((s) => (
                      <button
                        key={s}
                        className={`report-made-status-option ${s === currentStatus ? "active" : ""}`}
                        onClick={() => handleStatusUpdate(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* report details */}
        <div className="report-made-detail">
          <div className="report-made-detail-row">
            <span className="report-made-detail-label">
              {targetLabel}
            </span>
            <span className="report-made-detail-value">
              {targetName || "N/A"}
            </span>
          </div>
          <div className="report-made-detail-row">
            <span className="report-made-detail-label">
              Date Submitted
            </span>
            <span className="report-made-detail-value">
              {formatDate(report.createdAt)}
            </span>
          </div>
          <div className="report-made-detail-row">
            <span className="report-made-detail-label">
              Status
            </span>
            <span className="report-made-detail-value">
              {currentStatus}
            </span>
          </div>
        </div>

        {/* report content */}
        <div className="report-made-content">
          <label className="volunteer-report-field-label">Report Details</label>
          <p className="report-made-content-text">
            {report.details || "No details provided."}
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReportMadePage;
