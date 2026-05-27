import React from 'react';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import './OpportunityCard.css';

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, '-');

const formatDate = (dateValue) => {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue));
};

const formatTime = (dateValue) => {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(dateValue))
    .toLowerCase();
};

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
}) => {
  const isModelOpportunity = Boolean(opportunity);
  const displayStatus = opportunity?.status || status || "Active";
  const statusClass = getStatusClass(displayStatus);
  const displayTitle = opportunity?.title || title;
  const displayDetails = opportunity?.details || detail;
  const displayLocation = opportunity?.location;
  
  const displayDate = opportunity?.startAt 
    ? formatDate(opportunity.startAt) 
    : fixedDate;
    
  const displayTime = opportunity?.startAt && opportunity?.endAt
    ? `${formatTime(opportunity.startAt)} - ${formatTime(opportunity.endAt)}`
    : timeFrame;

  const displayOrganisationName = opportunity?.organisationId?.name;
  
  const spotsRemaining = isModelOpportunity
    ? Math.max((opportunity.maxVolunteers || 0) - (opportunity.approvedVolunteersCount || 0), 0)
    : null;
    
  const displayActions = actions || (showActionButtons ? ['view', 'edit'] : []);

  return (
    <div className={`event-card opportunity-card-${variant}`}>
      <div className="event-card-header">
        {showStatus && (
          <div className="header-left">
            <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
          </div>
        )}
        
        {opportunity?.category && opportunity.category.length > 0 && (
          <div className="header-right">
            <div className="categories-container">
              {opportunity.category.map((cat, index) => (
                <div key={index} className="event-category-tag">{cat}</div>
              ))}
            </div>
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
                Apply before {formatDate(opportunity.applicationDeadline)}
              </span>
            )}
          </>
        ) : (
          `${displayDate} - ${displayTime}`
        )}
      </div>

      {displayActions.length > 0 && (
        <div className="item-actions">
          {displayActions.map((action) => (
            <button 
              className={`action-btn ${action}`} 
              key={action} 
              type="button" 
              onClick={() => onAction && onAction(action, opportunity?._id || opportunity)}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityCard;