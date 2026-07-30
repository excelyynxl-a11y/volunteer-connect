import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate } from "../lib/utils";

const ReportMadeCard = ({ report }) => {
  const navigate = useNavigate();
  const status = report?.status?.toLowerCase() || "pending";

  const handleClick = () => {
    navigate(`/volunteer-dashboard/report/${report?._id}`, {
      state: { report },
    });
  };

  return (
    <div className="report-made-card" onClick={handleClick}>
      <div className="report-made-card-main">
        <span className="report-made-card-category">
          {report?.opportunityViolationType || "Uncategorised"}
        </span>
        <h3 className="report-made-card-title">
          {report?.title || "Untitled report"}
        </h3>
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
