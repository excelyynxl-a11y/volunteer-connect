import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useAdminStore } from "../../store/useAdminStore";
import { Pencil } from "lucide-react";

const AdminProfile = () => {
  const { authUser, checkAuth } = useAuthStore();
  const { updateAdminProfile, isUpdating } = useAdminStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [newName, setNewName] = useState(authUser?.name || "");

  const handleUpdate = () => {
    // TODO: call updateAdminProfile from useAuthStore

  };

  const handleCancel = () => {
    setIsEditMode(false);
    setNewName(authUser?.name || "");
    setSelectedFile(null);
  };

  const avatarSrc = selectedFile
    ? URL.createObjectURL(selectedFile)
    : authUser?.avatar;

  return (
    <div className="admin-page">

      {/* admin profile header */}
      <div className="admin-page-header">
        <h1>
          Profile
        </h1>
        <p>
          Your admin account details.
        </p>
      </div>

      <div className="admin-profile-card">

        {/* admin avatar */}
        <div className="admin-profile-avatar">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Admin avatar"
              className="admin-profile-avatar-img"
            />
          ) : (
            authUser?.name?.charAt(0)?.toUpperCase() || "A"
          )}
        </div>

        {/* upload avatar */}
        {isEditMode && (
          <div className="admin-profile-field">
            <label>
              Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              className="admin-profile-file-input"
            />
          </div>
        )}

        {/* admin name - editable */}
        <div className="admin-profile-field">
          <label>
            Name
          </label>
          {isEditMode ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="admin-profile-input"
            />
          ) : (
            <span>{authUser?.name || "—"}</span>
          )}
        </div>

        {/* admin email - uneditable */}
        <div className="admin-profile-field">
          <label>Email</label>
          <span>{authUser?.email || "—"}</span>
        </div>

        {/* admin role - uneditable */}
        <div className="admin-profile-field">
          <label>
            Role
          </label>
          <span>
            Administrator
          </span>
        </div>

        {/* edit or [update and cancel button] */}
        {isEditMode ? (
          <div className="admin-profile-actions">
            <button
              className="admin-profile-update-btn"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
            <button
              className="admin-profile-cancel-btn"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="admin-profile-edit-btn"
            onClick={() => setIsEditMode(true)}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}

      </div>
    </div>
  );
};

export default AdminProfile;
