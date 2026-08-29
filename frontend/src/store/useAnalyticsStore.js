import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const getDefaultStartMonthKey = () => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 11);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const resolveAnalyticsRange = (startMonth, endMonth) => ({
  startMonth: startMonth || getDefaultStartMonthKey(),
  endMonth: endMonth || getCurrentMonthKey()
});

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage;

const normalizeAnalyticsList = (value) => (Array.isArray(value) ? value : []);

const fetchAnalyticsMetric = async ({
  set,
  path,
  dataKey,
  loadingKey,
  errorKey,
  startMonth,
  endMonth,
  fallbackMessage
}) => {
  set({ [loadingKey]: true, [errorKey]: "" });

  try {
    const range = resolveAnalyticsRange(startMonth, endMonth);
    const response = await axiosInstance.get(path, { params: range });
    const data = normalizeAnalyticsList(response.data);

    set({ [dataKey]: data });
    return { success: true, data };
  } catch (error) {
    const message = getErrorMessage(error, fallbackMessage);
    set({ [dataKey]: [], [errorKey]: message });
    toast.error(message);
    return { success: false, error: message };
  } finally {
    set({ [loadingKey]: false });
  }
};

export const useAnalyticsStore = create((set, get) => ({
  volunteerSignUpAnaltyics: [],
  isVolunteerSignUpAnaltyicsLoading: false,
  volunteerSignUpAnalyticsError: "",
  organisationSignUpAnaltyics: [],
  isOrganisationSignUpAnaltyicsLoading: false,
  organisationSignUpAnalyticsError: "",
  opportunityCreatedAnaltyics: [],
  isOpportunityCreatedAnaltyicsLoading: false,
  opportunityCreatedAnalyticsError: "",
  reportAnaltyics: [],
  isReportAnaltyicsLoading: false,
  reportAnalyticsError: "",
  analyticsOverviewRequestId: 0,

  getAnalyticsOverview: async (startMonth, endMonth) => {
    const requestId = Date.now();
    const range = resolveAnalyticsRange(startMonth, endMonth);

    set({
      analyticsOverviewRequestId: requestId,
      isVolunteerSignUpAnaltyicsLoading: true,
      isOrganisationSignUpAnaltyicsLoading: true,
      isOpportunityCreatedAnaltyicsLoading: true,
      isReportAnaltyicsLoading: true,
      volunteerSignUpAnalyticsError: "",
      organisationSignUpAnalyticsError: "",
      opportunityCreatedAnalyticsError: "",
      reportAnalyticsError: ""
    });

    try {
      const [volunteerRes, organisationRes, opportunityRes, reportRes] =
        await Promise.allSettled([
          axiosInstance.get("/analytics/volunteer-signups", { params: range }),
          axiosInstance.get("/analytics/organisation-signups", {
            params: range
          }),
          axiosInstance.get("/analytics/opportunities-created", {
            params: range
          }),
          axiosInstance.get("/analytics/reports", { params: range })
        ]);

      if (get().analyticsOverviewRequestId !== requestId) {
        return { success: false, stale: true };
      }

      const parseSettled = (result) =>
        result.status === "fulfilled"
          ? normalizeAnalyticsList(result.value.data)
          : [];

      const parseError = (result, fallbackMessage) =>
        result.status === "rejected"
          ? getErrorMessage(result.reason, fallbackMessage)
          : "";

      set({
        volunteerSignUpAnaltyics: parseSettled(volunteerRes),
        organisationSignUpAnaltyics: parseSettled(organisationRes),
        opportunityCreatedAnaltyics: parseSettled(opportunityRes),
        reportAnaltyics: parseSettled(reportRes),
        volunteerSignUpAnalyticsError: parseError(
          volunteerRes,
          "Failed to load volunteer analytics"
        ),
        organisationSignUpAnalyticsError: parseError(
          organisationRes,
          "Failed to load organisation analytics"
        ),
        opportunityCreatedAnalyticsError: parseError(
          opportunityRes,
          "Failed to load opportunity analytics"
        ),
        reportAnalyticsError: parseError(
          reportRes,
          "Failed to load report analytics"
        ),
        isVolunteerSignUpAnaltyicsLoading: false,
        isOrganisationSignUpAnaltyicsLoading: false,
        isOpportunityCreatedAnaltyicsLoading: false,
        isReportAnaltyicsLoading: false
      });

      return { success: true };
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to load analytics overview"
      );

      if (get().analyticsOverviewRequestId !== requestId) {
        return { success: false, stale: true };
      }

      set({
        volunteerSignUpAnaltyics: [],
        organisationSignUpAnaltyics: [],
        opportunityCreatedAnaltyics: [],
        reportAnaltyics: [],
        volunteerSignUpAnalyticsError: message,
        organisationSignUpAnalyticsError: message,
        opportunityCreatedAnalyticsError: message,
        reportAnalyticsError: message,
        isVolunteerSignUpAnaltyicsLoading: false,
        isOrganisationSignUpAnaltyicsLoading: false,
        isOpportunityCreatedAnaltyicsLoading: false,
        isReportAnaltyicsLoading: false
      });

      toast.error(message);
      return { success: false, error: message };
    }
  },

  getVolunteerSignUpAnalytics: async (startMonth, endMonth) => {
    return fetchAnalyticsMetric({
      set,
      path: "/analytics/volunteer-signups",
      dataKey: "volunteerSignUpAnaltyics",
      loadingKey: "isVolunteerSignUpAnaltyicsLoading",
      errorKey: "volunteerSignUpAnalyticsError",
      startMonth,
      endMonth,
      fallbackMessage: "Failed to load volunteer analytics"
    });
  },

  getOrganisationSignUpAnalytics: async (startMonth, endMonth) => {
    return fetchAnalyticsMetric({
      set,
      path: "/analytics/organisation-signups",
      dataKey: "organisationSignUpAnaltyics",
      loadingKey: "isOrganisationSignUpAnaltyicsLoading",
      errorKey: "organisationSignUpAnalyticsError",
      startMonth,
      endMonth,
      fallbackMessage: "Failed to load organisation analytics"
    });
  },

  getOpportunityCreatedAnalytics: async (startMonth, endMonth) => {
    return fetchAnalyticsMetric({
      set,
      path: "/analytics/opportunities-created",
      dataKey: "opportunityCreatedAnaltyics",
      loadingKey: "isOpportunityCreatedAnaltyicsLoading",
      errorKey: "opportunityCreatedAnalyticsError",
      startMonth,
      endMonth,
      fallbackMessage: "Failed to load opportunity analytics"
    });
  },

  getReportAnalytics: async (startMonth, endMonth) => {
    return fetchAnalyticsMetric({
      set,
      path: "/analytics/reports",
      dataKey: "reportAnaltyics",
      loadingKey: "isReportAnaltyicsLoading",
      errorKey: "reportAnalyticsError",
      startMonth,
      endMonth,
      fallbackMessage: "Failed to load report analytics"
    });
  }
}));
