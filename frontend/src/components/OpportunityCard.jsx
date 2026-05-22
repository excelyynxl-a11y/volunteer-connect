import React from 'react';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getSpotsRemaining,
} from '../lib/opportunityUtils';
import './OpportunityCard.css';

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, '-');

const OpportunityCard = ({
  opportunity,
  title,
  detail,
  fixedDate,
  timeFrame,
  status,
  showActionButtons,
  showStatus = true,
  actions,
  onAction,
  variant = 'default',
}) => {
  const isModelOpportunity = Boolean(opportunity);
  const displayStatus = opportunity?.status || status || "Active";
  const statusClass = getStatusClass(displayStatus);
  const displayTitle = opportunity?.title || title;
  const displayDetails = opportunity?.details || opportunity?.detail || detail;
  const displayLocation = opportunity?.location;
  const displayDate = opportunity?.startAt
    ? formatOpportunityDate(opportunity.startAt)
    : opportunity?.fixedDate || fixedDate;
  const displayTime = opportunity?.startAt && opportunity?.endAt
    ? formatOpportunityTimeRange(opportunity.startAt, opportunity.endAt)
    : opportunity?.timeFrame || timeFrame;
  const displayCategory = opportunity?.category?.[0];
  const displayOrganisationName = opportunity?.organisationId?.name;
  const spotsRemaining =
    isModelOpportunity && opportunity?.maxVolunteers !== undefined
      ? getSpotsRemaining(opportunity)
      : null;
  const displayActions = actions || (showActionButtons ? ['view'] : []);

  return (
    <div className={`event-card opportunity-card-${variant}`}>
      {(showStatus || displayCategory) && (
        <div className="event-card-header">
          {showStatus && (
            <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
          )}
          {displayCategory && <div className="event-category-tag">{displayCategory}</div>}
        </div>
      )}

      <h5>{displayTitle}</h5>
      <p>{displayDetails}</p>

      {displayOrganisationName && (
        <strong className="event-organisation">{displayOrganisationName}</strong>
      )}

      <div className="item-sub">
        {isModelOpportunity ? (
          <>
            {displayLocation && (
              <span>
                <MapPin size={16} />
                {displayLocation}
              </span>
            )}
            {displayDate && (
              <span>
                <CalendarDays size={16} />
                {displayDate}
              </span>
            )}
            {displayTime && (
              <span>
                <Clock size={16} />
                {displayTime}
              </span>
            )}
            {spotsRemaining !== null && (
              <span>
                <Users size={16} />
                {spotsRemaining} spots left
              </span>
            )}
          </>
        ) : (
          `${displayDate} - ${displayTime}`
        )}
      </div>

      {opportunity?.applicationDeadline && (
        <div className="event-deadline">
          Apply before {formatOpportunityDate(opportunity.applicationDeadline)}
        </div>
      )}

      {displayActions.length > 0 && (
        <div className="item-actions">
          {displayActions.map((action) => (
            <button
              className={`action-btn ${action}`}
              key={action}
              type="button"
              onClick={() => onAction?.(action, opportunity)}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpportunityCard
