import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useReportStore = create((set, get) => ({
  previousReports: [],
  isPreviousReportsLoading: false,
  isCreatingReport: false,
  previousReportsError: "",

  getMyReports: async (reportType = "OpportunityViolation") => {
    set({
      isPreviousReportsLoading: true,
      previousReportsError: ""
    });

    try {
      const res = await axiosInstance.get("/report/my-reports");

      const reports = Array.isArray(res.data?.reports) ? res.data.reports : [];

      const filteredReports = reports.filter(
        (report) => report.reportType === reportType
      );

      set({ previousReports: filteredReports });

      return {
        success: true,
        data: filteredReports
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load your reports.";

      set({
        previousReports: [],
        previousReportsError: message
      });

      return {
        success: false,
        error: message
      };
    } finally {
      set({
        isPreviousReportsLoading: false
      });
    }
  },

  createReport: async (reportData) => {
    set({
      isCreatingReport: true
    });

    try {
      const res = await axiosInstance.post("/report", reportData);
      const newReport = res.data?.data ?? res.data;

      set((state) => ({
        previousReports: [newReport, ...state.previousReports]
      }));

      toast.success("Report successfully submitted to admin!");

      return {
        success: true,
        data: newReport
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create report";

      toast.error(message);

      return {
        success: false,
        error: message
      };
    } finally {
      set({
        isCreatingReport: false
      });
    }
  }
}));
