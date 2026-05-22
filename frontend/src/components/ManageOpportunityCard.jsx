import React from "react";
import { Eye } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  if (status === "active") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "closed") return "closed";
  return "pending";
};

const ManageOpportunityCard = ({ opportunity, onPreview }) => {
  const categoryText = opportunity.category?.length
    ? opportunity.category.join(", ")
    : "Other";
  const displayDate = formatDate(
    opportunity.startAt || opportunity.publishedAt || opportunity.createdAt,
  );
  const statusClass = getStatusClass(opportunity.status);

  return (
    <div className="admin-volunteer-card admin-opportunity-card">
      {/* Header [OpportunityName by OrganisationName] */}
      <div className="admin-opportunity-card-info">
        <h3 className="admin-opportunity-card-title">
          {opportunity.title}{" "}
          <span className="admin-opportunity-card-org">
            by {opportunity.organisationId?.name || opportunity.organisationId}
          </span>
        </h3>
      </div>

      {/* Category */}
      <div className="admin-opportunity-card-column">
        <span className="admin-opportunity-card-meta-label">
          Category
        </span>
        <span className="admin-opportunity-card-meta-value">
          {categoryText}
        </span>
      </div>

      {/* Location */}
      <div className="admin-opportunity-card-column">
        <span className="admin-opportunity-card-meta-label">
          Location
        </span>
        <span className="admin-opportunity-card-meta-value">
          {opportunity.location}
        </span>
      </div>

      {/* Date */}
      <span className="admin-volunteer-card-date">
        {displayDate}
      </span>

      {/* Status */}
      <span className={`admin-status ${statusClass}`}>
        <span className="admin-status-dot" />
        {opportunity.status}
      </span>

      {/* Preview button */}
      <button
        className="admin-volunteer-card-manage"
        title="Preview opportunity"
        aria-label="Preview opportunity"
        onClick={() => onPreview?.(opportunity)}
      >
        <Eye size={16} />
      </button>
    </div>
  );
};

export default ManageOpportunityCard;
