import React, { useEffect, useMemo } from "react";
import { Users, Building2, Lightbulb, AlertCircle, UserCheck, Building } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import AdminStatsCard from "../../components/AdminStatsCard";

const iconMap = {
  volunteers: UserCheck,
  organisations: Building2,
  opportunities: Lightbulb,
  reports: AlertCircle,
  volunteerswaitingapproval: Users,
  organisationswaitingapproval: Building,
};

const AdminHomepage = () => {
  const {
    getStats,
    volunteers,
    organisations,
    opportunities,
    reports,
    isStatsLoading,
    statsError,
  } = useAdminStore();

  useEffect(() => {
    getStats()
  }, [getStats]); 

  const stats = useMemo(() => {
    const countByStatus = (items, field, statuses) => {
      const acceptedStatuses = statuses.map((status) => status.toLowerCase());
      return items.filter((item) =>
        acceptedStatuses.includes(String(item?.[field] || "").toLowerCase()),
      ).length;
    };

    return [
      {
        key: "volunteers",
        value: countByStatus(volunteers, "approvalStatus", ["approved"]),
        label: "Approved Volunteers",
      },
      {
        key: "organisations",
        value: countByStatus(organisations, "approvalStatus", ["approved"]),
        label: "Approved Organisations",
      },
      {
        key: "opportunities",
        value: countByStatus(opportunities, "status", ["active"]),
        label: "Active Opportunities",
      },
      {
        key: "reports",
        value: countByStatus(reports, "status", ["pending", "investigating"]),
        label: "Open Reports",
      },
      {
        key: "volunteerswaitingapproval",
        value: countByStatus(volunteers, "approvalStatus", ["pending"]),
        label: "Volunteers Awaiting Approval",
      },
      {
        key: "organisationswaitingapproval",
        value: countByStatus(organisations, "approvalStatus", ["pending"]),
        label: "Organisations Awaiting Approval",
      },
    ].map((stat) => ({ ...stat, Icon: iconMap[stat.key] }));
  }, [opportunities, organisations, reports, volunteers]);

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <h1>Homepage</h1>
        <p>Welcome back! Here is a live overview of the platform.</p>
      </div>

      {isStatsLoading ? (
        <div className="admin-dashboard-state" aria-live="polite">
          <Lightbulb className="admin-dashboard-spinner" size={30} />
          <p>Loading platform overview...</p>
        </div>
      ) : statsError ? (
        <div className="admin-dashboard-state" role="alert">
          <AlertCircle size={32} />
          <h2>We couldn't load the platform overview</h2>
          <p>{statsError}</p>
          <button type="button" className="admin-dashboard-retry" onClick={getStats}>
            Try Again
          </button>
        </div>
      ) : (
        <div className="admin-stats">
          {stats.map(({ Icon, value, label, key }) => (
            <AdminStatsCard
              key={key}
              Icon={Icon}
              value={value}
              label={label}
              statKey={key}
            />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default AdminHomepage;
