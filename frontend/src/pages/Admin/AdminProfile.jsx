import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useAdminStore } from "../../store/useAdminStore";
import { Mail, Pencil, Shield, User } from "lucide-react";

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
  const headerNameSource = isEditMode ? newName : authUser?.name || "";
  const headerName = headerNameSource.trim() ? headerNameSource : "Not set";
  const isHeaderNameEmpty = headerName === "Not set";
  const avatarInitial = headerNameSource.trim()
    ? headerNameSource.trim().charAt(0).toUpperCase()
    : "A";
  const displayName = authUser?.name?.trim() ? authUser.name : "";
  const displayEmail = authUser?.email?.trim() ? authUser.email : "";

  return (
    <div className="admin-page">
      {/* admin profile header */}
      <div className="admin-page-header">
        <h1>Profile</h1>
        <p>Your admin account details.</p>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-header">
          <div className="admin-profile-header-main">
            {/* admin avatar */}
            <div className="admin-profile-avatar">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Admin avatar"
                  className="admin-profile-avatar-img"
                />
              ) : (
                avatarInitial
              )}
              {isEditMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="admin-profile-avatar-input"
                    id="admin-avatar-upload"
                  />
                  <label
                    htmlFor="admin-avatar-upload"
                    className="admin-profile-avatar-edit"
                    title="Upload avatar"
                  >
                    <Pencil size={14} />
                  </label>
                </>
              )}
            </div>

            <div className="admin-profile-header-info">
              <div className="admin-profile-header-title">
                <h2
                  className={`admin-profile-header-name${
                    isHeaderNameEmpty ? " admin-profile-header-name-empty" : ""
                  }`}
                >
                  {headerName}
                </h2>
                <span className="admin-profile-role-badge">
                  <Shield size={14} />
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {!isEditMode && (
            <button
              className="admin-profile-edit-btn"
              onClick={() => setIsEditMode(true)}
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="admin-profile-fields">
          {/* admin name - editable */}
          <div className="admin-profile-field">
            <div className="admin-profile-field-icon">
              <User size={16} />
            </div>
            <div className="admin-profile-field-body">
              <label>Name</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="admin-profile-input"
                />
              ) : displayName ? (
                <span>{displayName}</span>
              ) : (
                <span className="admin-profile-field-empty">Not set</span>
              )}
            </div>
          </div>

          {/* admin email - uneditable */}
          <div className="admin-profile-field">
            <div className="admin-profile-field-icon">
              <Mail size={16} />
            </div>
            <div className="admin-profile-field-body">
              <label>Email</label>
              {displayEmail ? (
                <span>{displayEmail}</span>
              ) : (
                <span className="admin-profile-field-empty">Not set</span>
              )}
            </div>
          </div>

          {/* admin role - uneditable */}
          <div className="admin-profile-field">
            <div className="admin-profile-field-icon">
              <Shield size={16} />
            </div>
            <div className="admin-profile-field-body">
              <label>Role</label>
              <span>Administrator</span>
            </div>
          </div>
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
        ) : null}
      </div>
    </div>
  );
};

export default AdminProfile;
