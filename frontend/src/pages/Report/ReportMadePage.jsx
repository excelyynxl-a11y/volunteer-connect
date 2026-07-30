import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowBigLeft } from "lucide-react";
import { useReportStore } from "../../store/useReportStore";
import { formatDate } from "../../lib/utils";

const ReportMadePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId } = useParams();
  const { previousReports } = useReportStore();

  const report =
    location.state?.report ||
    previousReports.find((r) => r._id === reportId);

  const handleBack = () => {
    navigate("/volunteer-dashboard/report");
  };

  const status = report?.status?.toLowerCase() || "pending";

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
              {report.opportunityViolationType || "Uncategorised"}
            </span>
            <h2>{report.title || "Untitled report"}</h2>
          </div>
          <span className={`report-card-status ${status}`}>
            {report.status || "Pending"}
          </span>
        </div>

        {/* report date submitted and status */}
        <div className="report-made-detail">
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
              {report.status || "Pending"}
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
