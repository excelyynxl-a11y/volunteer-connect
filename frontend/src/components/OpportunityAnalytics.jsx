import React from "react";
import { formatDateValue } from "../utils/analyticsFormatters";
import AnalyticsChartCard from "./AnalyticsChartCard";

const OpportunityAnalyticsCard = ({
  opportunityCreatedList = [],
  isLoading = false,
  error = "",
  onRetry
}) => {
  return (
    <AnalyticsChartCard
      title="Opportunity Growth"
      subtitle="Monthly opportunity creation trends across the selected range."
      data={opportunityCreatedList}
      isLoading={isLoading}
      error={error}
      emptyMessage="No opportunities were created during the selected period."
      summaryLabel="opportunities created"
      accent="#4b6f8c"
      detailKey="opportunities"
      detailLabel="opportunities"
      onRetry={onRetry}
      renderTooltipItem={(opportunity) => (
        <div className="admin-chart-tooltip-item-content">
          <strong>{opportunity.title || "Untitled opportunity"}</strong>
          <span>{opportunity.organisationName || "Unknown organisation"}</span>
          <span>
            {formatDateValue(opportunity.eventDate || opportunity.createdAt)}
          </span>
        </div>
      )}
    />
  );
};

export default OpportunityAnalyticsCard;
