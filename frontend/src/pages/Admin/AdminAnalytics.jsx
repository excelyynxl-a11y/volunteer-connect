import React from "react";
import { BarChart3 } from "lucide-react";

const AdminAnalytics = () => {

  // TODO: analytics in Milestone 3
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
            <BarChart3 size={32} /> 
            Volunteer sign up agaisnt time graph 
          </div>
        </div>

        {/* Trend 2: new organisation sign up agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Organisation Growth
          </h3>
          <div className="admin-chart-placeholder">
            <BarChart3 size={32} /> 
            Organisation sign up agaisnt time graph
          </div>
        </div>

        {/* Trend 3: new opportunity created agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Opportunity Growth
          </h3>
          <div className="admin-chart-placeholder">
            <BarChart3 size={32} /> 
            Opportunity created agaisnt time graph
          </div>
        </div>

        {/* Trend 4: new report received agaisnt time graph */}
        <div className="admin-analytics-card">
          <h3>
            Report Activity
          </h3>
          <div className="admin-chart-placeholder">
            <BarChart3 size={32} /> 
            Report received agaisnt time graph
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminAnalytics;
