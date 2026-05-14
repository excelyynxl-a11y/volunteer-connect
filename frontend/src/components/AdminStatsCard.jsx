import React from "react";
import { useNavigate } from "react-router-dom";

// each AdminStatsCard navigate the path same as AdminSidebar
const keyToPath = {
  volunteers: "/admin-dashboard/manage-volunteer",
  volunteerswaitingapproval: "/admin-dashboard/manage-volunteer",
  organisations: "/admin-dashboard/manage-organisation",
  organisationswaitingapproval: "/admin-dashboard/manage-organisation",
  opportunities: "/admin-dashboard/manage-opportunity",
  reports: "/admin-dashboard/manage-report",
};

const AdminStatsCard = ({
  Icon,
  value,
  label,
  statKey,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = keyToPath[statKey];
    if (path) navigate(path);
  };

  return (
    <div
      className="admin-stat-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <p className="stat-value">
        {value}
      </p>
      <p className="stat-label">
        {label}
      </p>
    </div>
  );
};

export default AdminStatsCard;