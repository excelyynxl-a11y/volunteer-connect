import React from 'react';
import './OpportunityCard.css';

const OpportunityCard = ({
    title,
    detail,
    fixedDate,
    timeFrame,
    status,
    showActionButtons
}) => {
  const displayStatus = status || "Active";
  const statusClass = displayStatus.toLowerCase();

  return (
    <div className="event-card">
      <div className={`event-tag status-${statusClass}`}>{displayStatus}</div>
      <h5>{title}</h5>
      <p>{detail}</p>
      <div className="item-sub">
        {fixedDate} - {timeFrame}
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
