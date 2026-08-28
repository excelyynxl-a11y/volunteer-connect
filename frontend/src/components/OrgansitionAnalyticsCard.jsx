import React from "react";
import { formatDateValue } from "../utils/analyticsFormatters";
import AnalyticsChartCard from "./AnalyticsChartCard";

const OrganisationAnalyticsCard = ({
  organisationSignUpList = [],
  isLoading = false,
  error = "",
  onRetry
}) => {
  return (
    <AnalyticsChartCard
      title="Organisation Growth"
      subtitle="Monthly organisation registrations across the selected range."
      data={organisationSignUpList}
      isLoading={isLoading}
      error={error}
      emptyMessage="No organisation sign-ups were recorded for the selected period."
      summaryLabel="organisation sign-ups"
      accent="#d9aa55"
      detailKey="organisations"
      detailLabel="organisations"
      onRetry={onRetry}
      renderTooltipItem={(organisation) => (
        <div className="admin-chart-tooltip-item-content">
          <strong>{organisation.name || "Unknown organisation"}</strong>
          <span>{organisation.email || "No email available"}</span>
          <span>
            {formatDateValue(
              organisation.signedUpAt ||
                organisation.signUpAt ||
                organisation.createdAt
            )}
          </span>
        </div>
      )}
    />
  );
};

export default OrganisationAnalyticsCard;
