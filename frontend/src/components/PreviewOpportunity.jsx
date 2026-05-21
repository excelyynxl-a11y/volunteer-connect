import React from "react";
import { X } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status) => {
  if (status === "active") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "closed") return "closed";
  return "pending";
};

const PreviewOpportunity = ({ opportunity, onClose }) => {
  const statusClass = getStatusClass(opportunity.status);
  const categories = opportunity.category?.length
    ? opportunity.category
    : ["Other"];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{opportunity.title}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
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

          <div className="admin-profile-field">
            <label>Location</label>
            <span>{opportunity.location || "—"}</span>
          </div>

          <div className="admin-profile-field">
            <label>Start</label>
            <span>{formatDateTime(opportunity.startAt)}</span>
          </div>

          <div className="admin-profile-field">
            <label>End</label>
            <span>{formatDateTime(opportunity.endAt)}</span>
          </div>

          <div className="admin-profile-field">
            <label>Application Deadline</label>
            <span>{formatDateTime(opportunity.applicationDeadline)}</span>
          </div>

          <div className="admin-profile-field">
            <label>Max Volunteers</label>
            <span>{opportunity.maxVolunteers ?? "—"}</span>
          </div>

          <div className="admin-profile-field">
            <label>Approved Volunteers</label>
            <span>{opportunity.approvedVolunteersCount ?? "—"}</span>
          </div>

          <div className="admin-profile-field">
            <label>Details</label>
            <span className="admin-opportunity-details">
              {opportunity.details || "—"}
            </span>
          </div>

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
