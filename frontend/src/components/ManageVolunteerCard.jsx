import React from "react";
import { Edit } from "lucide-react";

const ManageVolunteerCard = ({ volunteer, onManage }) => {
  const initials = volunteer.name
    ? volunteer.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "?";

  const statusClass =
    volunteer.approvalStatus === "approved"
      ? "active"
      : volunteer.approvalStatus === "pending"
        ? "pending"
        : "suspended";

  return (
    <div className="admin-volunteer-card">
      <div className="admin-volunteer-card-avatar">
        {volunteer.avatar ? (
          <img src={volunteer.avatar} alt={`${volunteer.name} avatar`} />
        ) : (
          <span className="admin-volunteer-card-initials">{initials}</span>
        )}
      </div>

      <div className="admin-volunteer-card-info">
        <h3 className="admin-volunteer-card-name">{volunteer.name}</h3>
        <span className="admin-volunteer-card-email">{volunteer.email}</span>
      </div>

      <span className="admin-volunteer-card-age">{volunteer.ageGroup}</span>

      <span className="admin-volunteer-card-date">
        {new Date(volunteer.createdAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>

      <span className={`admin-status ${statusClass}`}>
        <span className="admin-status-dot" />
        {volunteer.approvalStatus}
      </span>

      {/* TODO: link to PreviewVolunteer page when created */}
      <button
        className="admin-volunteer-card-manage"
        title="Manage volunteer"
        onClick={() => onManage?.(volunteer)}
      >
        <Edit size={16} />
      </button>
    </div>
  );
};

export default ManageVolunteerCard;
