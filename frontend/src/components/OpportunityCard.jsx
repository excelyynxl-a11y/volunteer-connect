import React from 'react';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import './OpportunityCard.css';

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

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, '-');

const OpportunityCard = ({
    opportunity,
    title,
    detail,
    fixedDate,
    timeFrame,
    status,
    showActionButtons,
    actions,
    variant = 'default',
}) => {
  const isModelOpportunity = Boolean(opportunity);
  const displayStatus = opportunity?.status || status || "Active";
  const statusClass = getStatusClass(displayStatus);
  const displayTitle = opportunity?.title || title;
  const displayDetails = opportunity?.details || detail;
  const displayLocation = opportunity?.location;
  const displayDate = opportunity?.startAt ? formatDate(opportunity.startAt) : fixedDate;
  const displayTime = opportunity?.startAt && opportunity?.endAt
    ? `${formatTime(opportunity.startAt)} - ${formatTime(opportunity.endAt)}`
    : timeFrame;
  const displayCategory = opportunity?.category?.[0];
  const spotsRemaining = isModelOpportunity
    ? Math.max((opportunity.maxVolunteers || 0) - (opportunity.approvedVolunteersCount || 0), 0)
    : null;
  const displayActions = actions || (showActionButtons ? ['view'] : []);

  return (
    <div className={`event-card opportunity-card-${variant}`}>
      <div className="event-card-header">
        <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
        {displayCategory && <div className="event-category-tag">{displayCategory}</div>}
      </div>

      <h5>{displayTitle}</h5>
      <p>{displayDetails}</p>

      {opportunity?.organisationName && (
        <strong className="event-organisation">{opportunity.organisationName}</strong>
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
          Apply before {formatDate(opportunity.applicationDeadline)}
        </div>
      )}

      {displayActions.length > 0 && (
        <div className="item-actions">
          {displayActions.map((action) => (
            <button className={`action-btn ${action}`} key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpportunityCard
