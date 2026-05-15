import React from 'react';
import './OpportunityCard.css';

const OpportunityCard = ({
    _id,
    title,
    details,
    location,
    category,
    startAt,
    endAt,
    status,
    showActionButtons
}) => {
  const displayStatus = status || "Active";
  const statusClass = displayStatus.toLowerCase();

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  const dateStr = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(startDate);

  const startTimeStr = new Intl.DateTimeFormat('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(startDate);

  const endTimeStr = new Intl.DateTimeFormat('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(endDate);


  return (
    <div className="event-card">
      <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
      <div className="card-category-list">
        {category && Array.isArray(category) ? (
          category.map((cat) => (
            <span key={cat} className="card-category-chip">
              {cat}
            </span>
          ))
        ) : category ? (
          <span className="card-category-chip">{category}</span>
        ) : null}
      </div>
      <h5>{title}</h5>
      <p>{details}</p>
      <div className="item-sub">
        <div style={{ marginBottom: '4px' }}>{location}</div>
        <div>{dateStr}</div>
        <div>{startTimeStr} - {endTimeStr}</div>
      </div>

      {showActionButtons && (
        <div className="item-actions" style={{marginTop: '12px'}}>
           <button className="action-btn view">View</button>
        </div>
      )}
    </div>
  );
}

export default OpportunityCard
