import { FileText } from "lucide-react";
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getOrganisationName,
} from "../lib/opportunity";

const ConfirmApplicationModal = ({
  opportunity,
  onCancel,
  onConfirm,
  isSubmitting,
}) => {
  if (!opportunity) return null;

  const displayDate = formatOpportunityDate(opportunity.startAt);
  const displayTime = formatOpportunityTimeRange(
    opportunity.startAt,
    opportunity.endAt
  );
  const organisationName = getOrganisationName(opportunity);

  return (
    <div className="application-modal-overlay" onClick={onCancel}>
      <div
        className="application-modal confirm-apply-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="application-modal-icon confirm-apply-icon">
          <FileText size={24} />
        </div>

        <h2>Confirm your application</h2>
        <p className="application-modal-subtitle">
          Please confirm that you want to apply for this opportunity. The
          organisation will be able to review your public profile and resume.
        </p>

        <div className="application-modal-card">
          <strong>{opportunity.title}</strong>
          <span>
            {[organisationName, displayDate, displayTime]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>

        <div className="application-modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-apply"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Applying..." : "Confirm & Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApplicationModal;