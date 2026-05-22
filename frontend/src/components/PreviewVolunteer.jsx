import React from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useAdminStore } from "../store/useAdminStore";

const PreviewVolunteer = ({ 
  volunteer, 
  onClose, 
}) => {

  const { approveUserAccount, rejectUserAccount } = useAdminStore();

  const statusClass =
    volunteer.approvalStatus === "approved"
      ? "active"
      : volunteer.approvalStatus === "pending"
        ? "pending"
        : "suspended";

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const initials = volunteer.name
    ? volunteer.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "?";

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Volunteer header */}
        <div className="admin-modal-header">

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* volunteer avatar */}
            <div className="admin-volunteer-card-avatar">
              {volunteer.avatar ? (
                <img src={volunteer.avatar} alt={`${volunteer.name} avatar`} />
              ) : (
                <span className="admin-volunteer-card-initials">{initials}</span>
              )}
            </div>

            {/* volunteer name */}
            <h2>
              {volunteer.name}
            </h2>
          </div>

          {/* close button */}
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">

          {/* volunteer email */}
          <div className="admin-profile-field">
            <label>
              Email
            </label>
            <span>
              {volunteer.email}
            </span>
          </div>

          {/* volunteer approval status */}
          <div className="admin-profile-field">
            <label>
              Approval Status
            </label>
            <span className={`admin-status ${statusClass}`}>
              <span className="admin-status-dot" />
              {volunteer.approvalStatus}
            </span>
          </div>

          {/* volunteer age group */}
          <div className="admin-profile-field">
            <label>
              Age Group
            </label>
            <span>
              {volunteer.ageGroup}
            </span>
          </div>

          {/* volunteer biodata */}
          <div className="admin-profile-field">
            <label>
              Biodata
            </label>
            <span>
              {volunteer.biodata || "—"}
            </span>
          </div>

          {/* volunteer skills */}
          <div className="admin-profile-field">
            <label>
              Skills
            </label>
            <div className="admin-skill-tags">
              {volunteer.skills.length > 0 ? (
                volunteer.skills.map((skill) => (
                  <span key={skill} className="admin-skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <span>—</span>
              )}
            </div>
          </div>

          {/* volunteer availability */}
          <div className="admin-profile-field">
            <label>
              Availability
            </label>
            {volunteer.availability.length > 0 ? (
              <div className="admin-availability-list">
                {volunteer.availability.map((slot, i) => (
                  <span key={i} className="admin-availability-slot">
                    {slot.dayOfWeek} {slot.startTime}–{slot.endTime}
                    <span className={`admin-availability-pref ${slot.preference}`}>
                      {slot.preference}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span>—</span>
            )}
          </div>

          {/* volunteer resume */}
          <div className="admin-profile-field">
            <label>
              Resume
            </label>
            <span>
              {volunteer.resume ? (
                <a
                  href={volunteer.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-modal-resume-btn"
                >
                  View Resume
                </a>
              ) : (
                "—"
              )}
            </span>
          </div>

          {/* account created */}
          <div className="admin-profile-field">
            <label>
              Account Created
            </label>
            <span>
              {formatDate(volunteer.createdAt)}
            </span>
          </div>

          {/* last updated */}
          <div className="admin-profile-field">
            <label>
              Last Updated
            </label>
            <span>
              {formatDate(volunteer.updatedAt)}
            </span>
          </div>
        </div>

        {/* approve / reject action buttons */}
        <div className="admin-modal-footer">
          <button
            className="admin-modal-approve-btn"
            disabled={volunteer.approvalStatus === "approved"}
            onClick={() => approveUserAccount(volunteer._id, onClose)}
          >
            <CheckCircle size={16} />
            Approve
          </button>
          <button
            className="admin-modal-reject-btn"
            disabled={volunteer.approvalStatus === "rejected"}
            onClick={() => rejectUserAccount(volunteer._id, onClose)}
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreviewVolunteer;
