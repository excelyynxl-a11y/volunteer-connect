import React from 'react';
import './OpportunityCard.css';
import { formatDate, formatTime } from '../lib/utils';

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
        <div>{formatDate(startAt)} - {formatDate(endAt)}</div>
        <div>{formatTime(startAt)} - {formatTime(endAt)}</div>
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
