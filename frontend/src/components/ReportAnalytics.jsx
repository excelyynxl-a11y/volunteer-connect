import React from "react";
import AnalyticsChartCard, { formatDateValue } from "./AnalyticsChartCard";

const ReportAnalyticsCard = ({
  reportList = [],
  isLoading = false,
  error = "",
  onRetry
}) => {
  return (
    <AnalyticsChartCard
      title="Report Activity"
      subtitle="Monthly report submissions across the selected range."
      data={reportList}
      isLoading={isLoading}
      error={error}
      emptyMessage="No reports were submitted during the selected period."
      summaryLabel="reports"
      accent="#7a5b8c"
      detailKey="reports"
      detailLabel="reports"
      onRetry={onRetry}
      renderTooltipItem={(report) => (
        <div className="admin-chart-tooltip-item-content">
          <strong>{report.title || "Untitled report"}</strong>
          <span>{report.reportType || "Unknown type"}</span>
          <span>{report.status || "Unknown status"}</span>
          <span>{formatDateValue(report.createdAt)}</span>
        </div>
      )}
    />
  );
};

export default ReportAnalyticsCard;
