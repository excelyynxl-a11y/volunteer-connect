import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarRange,
  Lightbulb,
  RotateCcw,
  Users
} from "lucide-react";
import AdminStatsCard from "../../components/AdminStatsCard";
import VolunteerAnalyticsCard from "../../components/VolunteerAnalyticsCard";
import OrganisationAnalyticsCard from "../../components/OrgansitionAnalyticsCard";
import OpportunityAnalyticsCard from "../../components/OpportunityAnalytics";
import ReportAnalyticsCard from "../../components/ReportAnalytics";
import { formatMonthLabel } from "../../components/AnalyticsChartCard";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";

const DEFAULT_START_MONTH = "2026-03";

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const sumCounts = (entries = []) =>
  entries.reduce((sum, entry) => sum + Number(entry?.count || 0), 0);

const AdminAnalytics = () => {
  const [startMonth, setStartMonth] = useState(DEFAULT_START_MONTH);
  const [endMonth, setEndMonth] = useState(getCurrentMonthKey());

  const opportunityCreatedAnaltyics = useAnalyticsStore(
    (state) => state.opportunityCreatedAnaltyics
  );
  const isOpportunityCreatedAnaltyicsLoading = useAnalyticsStore(
    (state) => state.isOpportunityCreatedAnaltyicsLoading
  );
  const opportunityCreatedAnalyticsError = useAnalyticsStore(
    (state) => state.opportunityCreatedAnalyticsError
  );

  const getAnalyticsOverview = useAnalyticsStore(
    (state) => state.getAnalyticsOverview
  );

  const rangeIsValid = !startMonth || !endMonth || startMonth <= endMonth;

  useEffect(() => {
    if (!rangeIsValid) {
      return;
    }

    void getAnalyticsOverview(startMonth, endMonth);
  }, [endMonth, getAnalyticsOverview, rangeIsValid, startMonth]);

  const summaryCards = useMemo(
    () => [
      {
        key: "opportunities",
        label: "Opportunities created",
        value: sumCounts(opportunityCreatedAnaltyics),
        Icon: Lightbulb
      }
    ],
    [opportunityCreatedAnaltyics]
  );

  const selectedRangeLabel = `${formatMonthLabel(startMonth)} to ${formatMonthLabel(endMonth)}`;

  const handleResetRange = () => {
    setStartMonth(DEFAULT_START_MONTH);
    setEndMonth(getCurrentMonthKey());
  };

  const handleRefresh = () => {
    if (rangeIsValid) {
      void getAnalyticsOverview(startMonth, endMonth);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Analytics</h1>
        <p>Platform-wide statistics and trends for the selected month range.</p>
      </div>

      <div className="admin-analytics-toolbar">
        <div className="admin-analytics-range">
          <label className="admin-analytics-field">
            <span>
              <CalendarRange size={14} />
              Start month
            </span>
            <input
              type="month"
              value={startMonth}
              max={getCurrentMonthKey()}
              onChange={(event) => setStartMonth(event.target.value)}
            />
          </label>

          <label className="admin-analytics-field">
            <span>
              <CalendarRange size={14} />
              End month
            </span>
            <input
              type="month"
              value={endMonth}
              min={startMonth || DEFAULT_START_MONTH}
              max={getCurrentMonthKey()}
              onChange={(event) => setEndMonth(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="admin-analytics-reset-btn"
            onClick={handleResetRange}
          >
            <RotateCcw size={14} />
            Reset range
          </button>
        </div>

        <p className="admin-analytics-range-note">
          Showing data from {selectedRangeLabel}. Default range starts at March
          2026 and ends at the current month.
        </p>
      </div>

      {!rangeIsValid ? (
        <div className="admin-dashboard-state" role="alert">
          <AlertCircle size={32} />
          <h2>Invalid month range</h2>
          <p>The start month must be earlier than or equal to the end month.</p>
        </div>
      ) : (
        <>
          <div className="admin-stats admin-analytics-summary">
            {summaryCards.map(({ key, label, value, Icon }) => (
              <AdminStatsCard
                key={key}
                Icon={Icon}
                value={value}
                label={label}
                statKey={key}
              />
            ))}
          </div>

          <div className="admin-analytics-grid">
            <OpportunityAnalyticsCard
              opportunityCreatedList={opportunityCreatedAnaltyics}
              isLoading={isOpportunityCreatedAnaltyicsLoading}
              error={opportunityCreatedAnalyticsError}
              onRetry={handleRefresh}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
