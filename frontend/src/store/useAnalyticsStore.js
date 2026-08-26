import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const DEFAULT_START_MONTH = "2026-03";

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const resolveAnalyticsRange = (startMonth, endMonth) => ({
  startMonth: startMonth || DEFAULT_START_MONTH,
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

  getAnalyticsOverview: async (startMonth, endMonth) => {},

  getVolunteerSignUpAnalytics: async (startMonth, endMonth) => {},

  getOrganisationSignUpAnalytics: async (startMonth, endMonth) => {},

  getOpportunityCreatedAnalytics: async (startMonth, endMonth) => {},

  getReportAnalytics: async (startMonth, endMonth) => {}
}));
