import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate } from "../lib/utils";

const ReportMadeCard = ({ report }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = report?.status?.toLowerCase() || "pending";

  // ReportMadeCard is a shared component across all 3 users: Admin, Volunteer, Organisation
  const basePath = location.pathname.startsWith("/organisation-dashboard")
    ? "/organisation-dashboard"
    : "/volunteer-dashboard";

  const violationType =
    report?.userViolationType || report?.opportunityViolationType;

  // reported target: opportunity (for volunteer reports) or volunteer (for organisation reports)
  const targetLabel = report?.reportType === "UserViolation"
    ? "Reported Volunteer"
    : "Reported Opportunity";
  const targetName =
    report?.reportedUserId?.name || report?.reportedOpportunityId?.title;

  const handleClick = () => {
    navigate(`${basePath}/report/${report?._id}`, {
      state: { report },
    });
  };

  return (
    <div className="report-made-card" onClick={handleClick}>
      <div className="report-made-card-main">
        <span className="report-made-card-category">
          {violationType || "Uncategorised"}
        </span>
        <h3 className="report-made-card-title">
          {report?.title || "Untitled report"}
        </h3>
        {targetName && (
          <span className="report-made-card-target">
            {targetLabel}: {targetName}
          </span>
        )}
        <div className="report-made-card-meta">
          <span className="report-made-card-date">
            {formatDate(report?.createdAt)}
          </span>
          <span className={`report-card-status ${status}`}>
            {report?.status || "Pending"}
          </span>
        </div>
      </div>
      <ChevronRight className="report-made-card-chevron" />
    </div>
  );
};

export default ReportMadeCard;
