import React from "react";
import { BarChart3 } from "lucide-react";
import VolunteerAnalyticsCard from "../../components/VolunteerAnalyticsCard";
import OrganisationAnalyticsCard from "../../components/OrgansitionAnalyticsCard";
import OpportunityAnalyticsCard from "../../components/OpportunityAnalytics";
import ReportAnalyticsCard from "../../components/ReportAnalytics";

const AdminAnalytics = () => {

  // TODO: extract GET values from useAnalyticsStore and throw to individual AnalyticsCard component
  // each graph should have input field for startmonth and endmonth (optional, defualt set to start = Mar2026 and end = current month)
  // throw startmonth and endmonth to useAnalyticsStore get method as params
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>
          Analytics
        </h1>
        <p>
          Platform-wide statistics and trends.
        </p>
      </div>

      <div className="admin-analytics-grid">

        {/* Trend 1: new volunteer sign up agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Volunteer Growth
          </h3>
          <div className="admin-chart-placeholder">
            <VolunteerAnalyticsCard />
            Volunteer sign up agaisnt time graph 
          </div>
        </div>

        {/* Trend 2: new organisation sign up agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Organisation Growth
          </h3>
          <div className="admin-chart-placeholder">
            <OrganisationAnalyticsCard />
            Organisation sign up agaisnt time graph
          </div>
        </div>

        {/* Trend 3: new opportunity created agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Opportunity Growth
          </h3>
          <div className="admin-chart-placeholder">
            <OpportunityAnalyticsCard />
            Opportunity created agaisnt time graph
          </div>
        </div>

        {/* Trend 4: new report received agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Report Activity
          </h3>
          <div className="admin-chart-placeholder">
            <ReportAnalyticsCard /> 
            Report received agaisnt time graph
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminAnalytics;
