import React from 'react';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getOpportunityStatusClass,
  getSpotsRemaining,
  APPLICATION_STATUS_LABELS,
  getApplicationDisplayStatus
} from '../lib/opportunity';
import './OpportunityCard.css';

const OpportunityCard = ({
  opportunity,
  title,
  detail,
  fixedDate,
  timeFrame,
  status,
  showActionButtons,
  showStatus = true,
  onAction,
  actions,
  variant = 'default',
  applicationStatus,
}) => {
  const isModelOpportunity = Boolean(opportunity);
  const displayStatus = opportunity?.status || status || "Active";
  const statusClass = getOpportunityStatusClass(displayStatus);
  const displayTitle = opportunity?.title || title;
  const displayDetails = opportunity?.details || detail;
  const displayLocation = opportunity?.location;
  
  const displayDate = opportunity?.startAt 
    ? formatOpportunityDate(opportunity.startAt)
    : fixedDate;
    
  const displayTime = opportunity?.startAt && opportunity?.endAt
    ? formatOpportunityTimeRange(opportunity.startAt, opportunity.endAt)
    : timeFrame;

  const displayOrganisationName = opportunity?.organisationId?.name;
  
  const spotsRemaining = isModelOpportunity
    ? getSpotsRemaining(opportunity)
    : null;
    
  const displayActions = actions || (showActionButtons ? ['view', 'edit'] : []);

  const { key: effectiveStatusKey, isLocked: isApplicationLocked } =
    getApplicationDisplayStatus(applicationStatus, spotsRemaining);

  return (
    <div className={`event-card opportunity-card-${variant}`}>
      <div className="event-card-header">
        <div className="header-left">
          {showStatus && (
            <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
          )}
          
          {(opportunity?.category && opportunity.category.length > 0 || (isModelOpportunity && effectiveStatusKey))&& (
              <div className="categories-container">
                {opportunity.category.map((cat) => (
                  <div key={cat} className="event-category-tag">{cat}</div>
                ))}
              </div>
          )}
        </div>
          {isModelOpportunity && effectiveStatusKey && (
            <div className={`application-status-badge status-${effectiveStatusKey}`}>
              {APPLICATION_STATUS_LABELS[effectiveStatusKey]}
            </div>
          )}
        </div>

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

            {opportunity?.applicationDeadline && (
              <span>
                <CalendarDays size={16} /> 
                Apply before {formatOpportunityDate(opportunity.applicationDeadline)}
              </span>
            )}
          </>
        ) : (
          `${displayDate} - ${displayTime}`
        )}
      </div>

      {(displayActions.length > 0 || variant === 'volunteer') && (
        <div className="item-actions">
          {/* 1. Render Organization/Standard Actions (View, Edit, Close) */}
          {displayActions.map((action) => (
            <button 
              className={`action-btn ${action}`} 
              key={action} 
              type="button" 
              onClick={() => onAction && onAction(action, opportunity?._id || opportunity)}
              aria-label={`${action} ${displayTitle || 'opportunity'}`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
          ))}

          {/* 2. Render Volunteer-Specific Actions (Apply, Status Badges) */}
          {variant === 'volunteer' && (
            isModelOpportunity && effectiveStatusKey ? (
              <button
                type="button"
                className={`action-btn status-btn status-btn-${effectiveStatusKey}`}
                disabled={isApplicationLocked}
                aria-label={`${APPLICATION_STATUS_LABELS[effectiveStatusKey]} for ${displayTitle || 'opportunity'}`}
              >
                {APPLICATION_STATUS_LABELS[effectiveStatusKey]}
              </button>
            ) : (
              <button
                type="button"
                className="action-btn apply-btn"
                onClick={() => onAction && onAction('apply', opportunity?._id || opportunity)}
                aria-label={`Apply for ${displayTitle || 'opportunity'}`}
              >
                Apply
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunityCard;
