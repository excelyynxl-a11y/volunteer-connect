import React from 'react';
import './OpportunityCard.css';
import { formatDate, formatTime } from '../lib/utils';
import { Eye, Edit2 } from 'lucide-react';

const OpportunityCard = ({
    _id,
    title,
    details,
    location,
    category,
    startAt,
    endAt,
    status,
    onEdit, // For organisation
    onView,
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
        <div><strong>Location:</strong> {location}</div>
        <div><strong>Date:</strong> {formatDate(startAt)} - {formatDate(endAt)}</div>
        <div><strong>Time:</strong> {formatTime(startAt)} - {formatTime(endAt)}</div>
      </div>

      {showActionButtons && (
        <div className="item-actions">
           <button className="action-btn view" onClick={() => onView?.(_id)}>
             <Eye size={16} /> View
           </button>
           
           {/* ONLY shows if onEdit is passed (Organisation view) */}
           {onEdit && (
             <button className="action-btn edit" onClick={() => onEdit(_id)}>
               <Edit2 size={16} /> Edit
             </button>
           )}
        </div>
      )}
    </div>
  );
}

export default OpportunityCard
