import React from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useAdminStore } from "../store/useAdminStore";

const PreviewOrganisation = ({ 
  organisation, 
  onClose 
}) => {
  const { approveUserAccount, rejectUserAccount } = useAdminStore();

  const statusClass =
    organisation.approvalStatus === "approved"
      ? "active"
      : organisation.approvalStatus === "pending"
        ? "pending"
        : "suspended";

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Organisation header */}
        <div className="admin-modal-header">
          {/* organisation name */}
          <h2>{organisation.name}</h2>

          {/* close button */}
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* organisation email */}
          <div className="admin-profile-field">
            <label>Email</label>
            <span>{organisation.email}</span>
          </div>

          {/* organisation approval status */}
          <div className="admin-profile-field">
            <label>Approval Status</label>
            <span className={`admin-status ${statusClass}`}>
              <span className="admin-status-dot" />
              {organisation.approvalStatus}
            </span>
          </div>

          {/* organisation biodata */}
          <div className="admin-profile-field">
            <label>Biodata</label>
            <span>{organisation.biodata || "—"}</span>
          </div>

          {/* account created */}
          <div className="admin-profile-field">
            <label>Account Created</label>
            <span>{formatDate(organisation.createdAt)}</span>
          </div>

          {/* last updated */}
          <div className="admin-profile-field">
            <label>Last Updated</label>
            <span>{formatDate(organisation.updatedAt)}</span>
          </div>
        </div>

        {/* approve / reject action buttons */}
        <div className="admin-modal-footer">
          <button
            className="admin-modal-approve-btn"
            disabled={organisation.approvalStatus === "approved"}
            onClick={() => approveUserAccount(organisation._id, onClose)}
          >
            <CheckCircle size={16} />
            Approve
          </button>
          <button
            className="admin-modal-reject-btn"
            disabled={organisation.approvalStatus === "rejected"}
            onClick={() => rejectUserAccount(organisation._id, onClose)}
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewOrganisation;
