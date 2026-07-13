import React from "react";
import { useNavigate } from "react-router-dom";

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
    <button
      type="button"
      className="admin-stat-card"
      onClick={handleClick}
      aria-label={`${label}: ${value}`}
    >
      <div className="stat-icon">
        {React.createElement(Icon, { size: 22 })}
      </div>
      <p className="stat-value">
        {value}
      </p>
      <p className="stat-label">
        {label}
      </p>
    </button>
  );
};

export default AdminStatsCard;
