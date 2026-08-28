import React from "react";
import { formatDateValue } from "../utils/analyticsFormatters";
import AnalyticsChartCard from "./AnalyticsChartCard";

const VolunteerAnalyticsCard = ({
  volunteerSignUpList = [],
  isLoading = false,
  error = "",
  onRetry
}) => {
  return (
    <AnalyticsChartCard
      title="Volunteer Growth"
      subtitle="Monthly volunteer registrations across the selected range."
      data={volunteerSignUpList}
      isLoading={isLoading}
      error={error}
      emptyMessage="No volunteer sign-ups were recorded for the selected period."
      summaryLabel="volunteer sign-ups"
      accent="#2c614f"
      detailKey="volunteers"
      detailLabel="volunteers"
      onRetry={onRetry}
      renderTooltipItem={(volunteer) => (
        <div className="admin-chart-tooltip-item-content">
          <strong>{volunteer.name || "Unknown volunteer"}</strong>
          <span>{volunteer.email || "No email available"}</span>
          <span>
            {formatDateValue(
              volunteer.signedUpAt || volunteer.signUpAt || volunteer.createdAt
            )}
          </span>
        </div>
      )}
    />
  );
};

export default VolunteerAnalyticsCard;
