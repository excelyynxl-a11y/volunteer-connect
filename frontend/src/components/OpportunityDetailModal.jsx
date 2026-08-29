import { Building2, CalendarDays, Clock, MapPin, Users, X } from "lucide-react";
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getOrganisationName,
  getRequirementItems,
  getSpotsRemaining,
  getApplyEligibility,
} from "../lib/opportunity";

import { 
  getApplicationDisplayStatus,
  APPLICATION_STATUS_LABELS,
  getApplicationBannerMessage,
} from "../lib/application";



const OpportunityDetailModal = ({ opportunity, onClose, onAction, volunteerAvailability = [], applicationStatus }) => {
  if (!opportunity) return null;

  const requirementItems = getRequirementItems(opportunity.requirements);

  const spotsRemaining = getSpotsRemaining(opportunity);
  const organisationName = getOrganisationName(opportunity);
  const organisationId =
    typeof opportunity.organisationId === "object"
      ? opportunity.organisationId?._id
      : opportunity.organisationId;

  const { key: effectiveStatusKey, isLocked } = getApplicationDisplayStatus(
    applicationStatus,
    spotsRemaining,
    opportunity.status,
    opportunity
  );

  const { canApply, reason } = getApplyEligibility(opportunity, volunteerAvailability);

  const bannerMessage = effectiveStatusKey 
  ? getApplicationBannerMessage(effectiveStatusKey, organisationName) 
  : null;
  
  return (
    <div
      className="opportunity-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opportunity-detail-title"
    >
      <div className="opportunity-detail-modal">
        <button
          className="opportunity-detail-close"
          type="button"
          aria-label="Close opportunity details"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="opportunity-detail-modal-scroll">
          <div className="opportunity-detail-header">
          <div>
            <span className="opportunity-detail-eyebrow">
              {opportunity.category?.[0] || "Opportunity"}
            </span>
            <h2 id="opportunity-detail-title">{opportunity.title}</h2>
            <div className="opportunity-organisation-row">
              <p>{organisationName}</p>
              <button
                type="button"
                className="view-organisation-button"
                disabled={!organisationId}
                onClick={() =>
                  onAction && onAction("view-organisation", organisationId)
                }
              >
                <Building2 size={16} />
                View organisation profile
              </button>
            </div>
          </div>

          <div className="opportunity-detail-apply-wrapper">
            {effectiveStatusKey ? (
              <button
                type="button"
                className={`apply-volunteer-button status-btn-${effectiveStatusKey}`}
                disabled={isLocked}
              >
                {APPLICATION_STATUS_LABELS[effectiveStatusKey]}
              </button>
            ) : (
              <>
              <button
                className="apply-volunteer-button"
                type="button"
                disabled={!canApply}
                onClick={() => onAction && onAction("apply", opportunity._id)}
              >
                Apply As Volunteer
              </button>
              {!canApply && (
                <p className="apply-disabled-reason">{reason}</p>
              )}
            </>
            )}
          </div>
        </div>

        <div className="opportunity-detail-meta">
          {opportunity.location && (
            <span>
              <MapPin size={17} />
              {opportunity.location}
            </span>
          )}
          <span>
            <CalendarDays size={17} />
            {formatOpportunityDate(opportunity.startAt) || "Date to be confirmed"}
          </span>
          <span>
            <Clock size={17} />
            {formatOpportunityTimeRange(
              opportunity.startAt,
              opportunity.endAt,
              "Time to be confirmed",
            )}
          </span>
          {opportunity.maxVolunteers !== undefined && (
            <span>
              <Users size={17} />
              {getSpotsRemaining(opportunity)} spots left
            </span>
          )}
        </div>

        <section className="opportunity-detail-section">
          <h3>Opportunity Details</h3>
          <div className="opportunity-detail-copy">
            <p>{opportunity.details || "Details will be shared soon."}</p>
          </div>
        </section>

        <section className="opportunity-detail-section">
          <h3>Volunteer Requirements</h3>
          {requirementItems.length > 0 ? (
            <ul className="opportunity-requirements-list">
              {requirementItems.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          ) : (
            <p className="opportunity-detail-muted">No specific requirements listed.</p>
          )}
        </section>
        {bannerMessage && (
            <div className={`opportunity-status-banner status-banner-${effectiveStatusKey}`}>
              {bannerMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailModal;
