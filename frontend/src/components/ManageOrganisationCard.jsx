import React from "react";
import { Edit } from "lucide-react";

const ManageOrganisationCard = ({ organisation, onManage }) => {
  const initials = organisation.name
    ? organisation.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "?";

  const statusClass =
    organisation.approvalStatus === "approved"
      ? "active"
      : organisation.approvalStatus === "pending"
        ? "pending"
        : "suspended";

  return (
    <div className="admin-volunteer-card">
      <div className="admin-volunteer-card-avatar">
        {organisation.avatar ? (
          <img src={organisation.avatar} alt={`${organisation.name} avatar`} />
        ) : (
          <span className="admin-volunteer-card-initials">{initials}</span>
        )}
      </div>

      <div className="admin-volunteer-card-info">
        <h3 className="admin-volunteer-card-name">{organisation.name}</h3>
        <span className="admin-volunteer-card-email">{organisation.email}</span>
      </div>

      <span className="admin-volunteer-card-date">
        {new Date(organisation.createdAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>

      <span className={`admin-status ${statusClass}`}>
        <span className="admin-status-dot" />
        {organisation.approvalStatus}
      </span>

      {/* TODO: link to PreviewOrganisation page when created */}
      <button
        className="admin-volunteer-card-manage"
        title="Manage organisation"
        onClick={() => onManage?.(organisation)}
      >
        <Edit size={16} />
      </button>
    </div>
  );
};

export default ManageOrganisationCard;
