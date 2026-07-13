import React, { useEffect } from "react";
import { X } from "lucide-react";
import {
  formatOpportunityDateTime,
  getOpportunityStatusClass,
  getOrganisationName,
} from "../lib/opportunity";

const PreviewOpportunity = ({ opportunity, onClose }) => {
  const statusClass = getOpportunityStatusClass(opportunity.status);
  const categories = opportunity.category?.length
    ? opportunity.category
    : ["Other"];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-opportunity-preview-title"
      onClick={onClose}
    >
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 id="admin-opportunity-preview-title">{opportunity.title}</h2>
          <button
            className="admin-modal-close"
            aria-label="Close opportunity preview"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Status */}
          <div className="admin-profile-field">
            <label>Status</label>
            {opportunity.status ? (
              <span className={`admin-status ${statusClass}`}>
                <span className="admin-status-dot" />
                {opportunity.status}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>

          {/* Organised by */}
          <div className="admin-profile-field">
            <label>Organised by</label>
            <span>{getOrganisationName(opportunity)}</span>
          </div>

          {/* Category */}
          <div className="admin-profile-field">
            <label>Category</label>
            <div className="admin-skill-tags">
              {categories.map((category) => (
                <span key={category} className="admin-skill-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="admin-profile-field">
            <label>Location</label>
            <span>{opportunity.location || "—"}</span>
          </div>

          {/* Start date */}
          <div className="admin-profile-field">
            <label>Start</label>
            <span>{formatOpportunityDateTime(opportunity.startAt, "—")}</span>
          </div>

          {/* End date */}
          <div className="admin-profile-field">
            <label>End</label>
            <span>{formatOpportunityDateTime(opportunity.endAt, "—")}</span>
          </div>

          {/* Application deadline */}
          <div className="admin-profile-field">
            <label>Application Deadline</label>
            <span>{formatOpportunityDateTime(opportunity.applicationDeadline, "—")}</span>
          </div>

          {/* Max volunteer */}
          <div className="admin-profile-field">
            <label>Max Volunteers</label>
            <span>{opportunity.maxVolunteers ?? "—"}</span>
          </div>

          {/* Approved volunteer */}
          <div className="admin-profile-field">
            <label>Approved Volunteers</label>
            <span>{opportunity.approvedVolunteersCount ?? "—"}</span>
          </div>

          {/* Details */}
          <div className="admin-profile-field">
            <label>Details</label>
            <span className="admin-opportunity-details">
              {opportunity.details || "—"}
            </span>
          </div>

          {/* Images */}
          <div className="admin-profile-field">
            <label>Images</label>
            {opportunity.images?.length ? (
              <div className="admin-opportunity-image-list">
                {opportunity.images.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt={`Opportunity image ${index + 1}`}
                    className="admin-opportunity-image"
                  />
                ))}
              </div>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewOpportunity;
