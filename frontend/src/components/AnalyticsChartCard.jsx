import React, { useId, useMemo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export const formatMonthLabel = (monthKey) => {
  if (!monthKey || typeof monthKey !== "string") {
    return "Unknown";
  }

  const [year, month] = monthKey.split("-");
  const yearNumber = Number(year);
  const monthNumber = Number(month);

  if (!Number.isFinite(yearNumber) || !Number.isFinite(monthNumber)) {
    return monthKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(yearNumber, monthNumber - 1, 1)));
};

export const formatDateValue = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsedDate);
};

const AnalyticsChartCard = ({
  title,
  subtitle,
  data = [],
  isLoading = false,
  error = "",
  emptyMessage = "No activity recorded for this period.",
  summaryLabel = "records",
  accent = "#2c614f",
  detailKey,
  detailLabel = "records",
  onRetry,
  renderTooltipItem
}) => {
  const gradientId = useId();

  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        ...entry,
        monthLabel: formatMonthLabel(entry.month)
      })),
    [data]
  );

  const totalCount = useMemo(
    () => chartData.reduce((sum, entry) => sum + Number(entry.count || 0), 0),
    [chartData]
  );

  const peakMonth = useMemo(() => {
    if (!chartData.length) {
      return null;
    }

    return chartData.reduce((best, entry) => {
      if (!best || Number(entry.count || 0) > Number(best.count || 0)) {
        return entry;
      }

      return best;
    }, null);
  }, [chartData]);

  const renderState = (icon, heading, message, buttonLabel) => (
    <div className="admin-chart-state">
      {icon}
      <h4>{heading}</h4>
      <p>{message}</p>
      {buttonLabel && typeof onRetry === "function" && (
        <button type="button" className="admin-chart-retry" onClick={onRetry}>
          {buttonLabel}
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section className="admin-analytics-card">
        <div className="admin-analytics-card-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        {renderState(
          <Loader2 className="admin-chart-loading-spinner" size={28} />,
          "Loading analytics",
          "Fetching the latest monthly breakdown."
        )}
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-analytics-card">
        <div className="admin-analytics-card-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        {renderState(
          <AlertCircle size={28} />,
          "Could not load chart",
          error,
          "Retry"
        )}
      </section>
    );
  }

  if (!chartData.length) {
    return (
      <section className="admin-analytics-card">
        <div className="admin-analytics-card-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        {renderState(
          <AlertCircle size={28} />,
          "No data available",
          emptyMessage
        )}
      </section>
    );
  }

  return (
    <section className="admin-analytics-card">
      <div className="admin-analytics-card-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="admin-analytics-card-meta">
          <div>
            <span className="admin-analytics-card-meta-label">
              Total {summaryLabel}
            </span>
            <strong>{totalCount.toLocaleString()}</strong>
          </div>
          {peakMonth && (
            <span className="admin-analytics-card-peak">
              Peak {peakMonth.monthLabel} (
              {Number(peakMonth.count || 0).toLocaleString()})
            </span>
          )}
        </div>
      </div>

      <div className="admin-chart-shell">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 18, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`analytics-gradient-${gradientId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={accent} stopOpacity={0.4} />
                <stop offset="95%" stopColor={accent} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eadfce"
            />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7a6755", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7a6755", fontSize: 12 }}
              width={34}
            />
            <Tooltip
              cursor={{
                stroke: accent,
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const activeEntry = payload[0].payload;
                const detailItems = Array.isArray(activeEntry?.[detailKey])
                  ? activeEntry[detailKey]
                  : [];
                const visibleItems = detailItems.slice(0, 4);
                const hiddenCount = Math.max(
                  detailItems.length - visibleItems.length,
                  0
                );

                return (
                  <div className="admin-chart-tooltip">
                    <strong>{activeEntry.monthLabel}</strong>
                    <span>
                      {Number(activeEntry.count || 0).toLocaleString()}{" "}
                      {detailLabel}
                    </span>
                    {visibleItems.length > 0 ? (
                      <ul className="admin-chart-tooltip-list">
                        {visibleItems.map((item, index) => (
                          <li key={`${activeEntry.month}-${index}`}>
                            {renderTooltipItem
                              ? renderTooltipItem(item, index)
                              : String(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="admin-chart-tooltip-empty">
                        No {detailLabel} recorded in this month.
                      </p>
                    )}
                    {hiddenCount > 0 && (
                      <span className="admin-chart-tooltip-more">
                        +{hiddenCount} more
                      </span>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={accent}
              strokeWidth={3}
              fill={`url(#analytics-gradient-${gradientId})`}
              dot={{ r: 3, strokeWidth: 2, fill: "#ffffff", stroke: accent }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default AnalyticsChartCard;
