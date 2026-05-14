import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Pencil } from "lucide-react";

const AdminProfile = () => {
  const { authUser } = useAuthStore();
  const [ isEditMode, setIsEditMode ] = useState(false);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Profile</h1>
        <p>Your admin account details.</p>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-avatar">
          {authUser?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        {/* Admin details: name, email, role */}
        <div className="admin-profile-field">
          <label>Name</label>
          <span>{authUser?.name || "—"}</span>
        </div>

        <div className="admin-profile-field">
          <label>Email</label>
          <span>{authUser?.email || "—"}</span>
        </div>

        <div className="admin-profile-field">
          <label>Role</label>
          <span>Administrator</span>
        </div>

        {/* Edit profile button */}
        <button 
          className="admin-profile-edit-btn"
        >
          <Pencil size={16} /> Edit Profile
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
