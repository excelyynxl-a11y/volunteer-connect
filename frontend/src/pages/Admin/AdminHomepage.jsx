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
  const { getStats, adminStats } = useAdminStore();

  useEffect(() => {
    getStats()
  }, [getStats]); 

  const stats = useMemo(() => {
    return adminStats.map((stat) => ({
      ...stat,
      Icon: iconMap[stat.key],
    }));
  }, [adminStats]);

  return (
    <div className="admin-page">

      {/* homepage header  */}
      <div className="admin-page-header">
        <h1>
          Homepage
        </h1>
        <p>
          Welcome back! Here is an overview of the platform.
        </p>
      </div>

      {/* Display the 6 clickable AdminStatsCard on AdminHomepage = [active vol, active org, active opp, open reports, vol waiting approval org waiting approval] */}
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
      
    </div>
  );
};

export default AdminHomepage;
