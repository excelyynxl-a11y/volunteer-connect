import React from "react";
import { CalendarDays, Clock, MapPin, Users, X } from "lucide-react";
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getOrganisationName,
  getRequirementItems,
  getSpotsRemaining,
} from "../lib/opportunityUtils";

const OpportunityDetailModal = ({ opportunity, onClose }) => {
  if (!opportunity) return null;

  const requirementItems = getRequirementItems(opportunity.requirements);

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

        <div className="opportunity-detail-header">
          <div>
            <span className="opportunity-detail-eyebrow">
              {opportunity.category?.[0] || "Opportunity"}
            </span>
            <h2 id="opportunity-detail-title">{opportunity.title}</h2>
            <p>{getOrganisationName(opportunity)}</p>
          </div>

          <button className="apply-volunteer-button" type="button">
            Apply As Volunteer
          </button>
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
          <div className="opportunity-detail-box">
            <p>{opportunity.details || "Details will be shared soon."}</p>
          </div>
        </section>

        <section className="opportunity-detail-section">
          <h3>Volunteer Requirements</h3>
          <div className="opportunity-requirements-box">
            {requirementItems.length > 0 ? (
              <ul>
                {requirementItems.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p>No specific requirements listed.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OpportunityDetailModal;
