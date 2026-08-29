import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,
  isUsersLoading: false,
  isOpportunitiesLoading: false,
  isReportsLoading: false,
  reportsError: "",
  opportunitiesError: "",
  isStatsLoading: false,
  statsError: "",
  organisations: [],
  volunteers: [],
  opportunities: [],
  reports: [],

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  getStats: async () => {
    set({ isStatsLoading: true, statsError: "" });
    try {
      const [volRes, orgRes, oppRes, repRes] = await Promise.all([
        axiosInstance.get("/user/volunteers"),
        axiosInstance.get("/user/organisations"),
        axiosInstance.get("/opportunities", { params: { page: 1, limit: 100 } }),
        axiosInstance.get("/report/", { params: { page: 1, limit: 100 } })
      ]);

      const volunteers = Array.isArray(volRes.data?.volunteers)
        ? volRes.data.volunteers
        : [];
      const organisations = Array.isArray(orgRes.data?.organisations)
        ? orgRes.data.organisations
        : [];
      const opportunities = Array.isArray(oppRes.data?.data)
        ? oppRes.data.data
        : [];
      const reports = Array.isArray(repRes.data?.reports)
        ? repRes.data.reports
        : [];

      set({
        volunteers,
        organisations,
        opportunities,
        reports
      });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard overview";

      set({
        volunteers: [],
        organisations: [],
        opportunities: [],
        reports: [],
        statsError: message
      });
      return { success: false, error: message };
    } finally {
      set({ isStatsLoading: false });
    }
  },

  getAllOrganisations: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/user/organisations");
      const organisations = Array.isArray(res.data?.organisations)
        ? res.data.organisations
        : [];
      set({ organisations });
      return { success: true, organisations };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load organisations";
      set({ organisations: [] });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getAllVolunteers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/user/volunteers");
      const volunteers = Array.isArray(res.data?.volunteers)
        ? res.data.volunteers
        : [];
      set({ volunteers });
      return { success: true, volunteers };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load volunteers";
      set({ volunteers: [] });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUsersLoading: false });
    }
  },

  rejectUserAccount: async (userId, onClose) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/users/${userId}/reject`
      );
      toast.success("User account rejected!");
      await Promise.all([
        get().getAllOrganisations(),
        get().getAllVolunteers()
      ]);
      onClose?.();
      return { success: true, user: response.data?.user };
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  approveUserAccount: async (userId, onClose) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/users/${userId}/approve`
      );
      toast.success("User account approved!");
      await Promise.all([
        get().getAllOrganisations(),
        get().getAllVolunteers()
      ]);
      onClose?.();
      return { success: true, user: response.data?.user };
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  getAllOpportunities: async () => {
    set({ isOpportunitiesLoading: true, opportunitiesError: "" });

    try {
      const res = await axiosInstance.get("/opportunities", {
        params: { page: 1, limit: 100 },
      });
      const opportunities = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ opportunities });
      return { success: true, opportunities };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load opportunities.";
      set({ opportunities: [], opportunitiesError: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isOpportunitiesLoading: false });
    }
  },

  getAllReports: async () => {
    set({
      isReportsLoading: true,
      reportsError: ""
    });

    try {
      const res = await axiosInstance.get("/report/", {
        params: { page: 1, limit: 100 },
      });
      const reports = Array.isArray(res.data?.reports) ? res.data.reports : [];

      set({ reports });

      return {
        success: true,
        data: reports
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load reports";

      set({
        reports: [],
        reportsError: message
      });

      return {
        success: false,
        error: message
      };
    } finally {
      set({ isReportsLoading: false });
    }
  },

  updateReportStatus: async (reportId, status) => {
    set({ isUpdating: true });

    try {
      const res = await axiosInstance.patch(`/report/${reportId}`, { status });
      const updatedReport = res.data?.data;

      set((state) => ({
        reports: state.reports.map((r) =>
          r._id === reportId ? updatedReport : r
        )
      }));

      toast.success("Report status updated successfully!");

      return { success: true, data: updatedReport };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update report status";

      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUpdating: false });
    }
  },

  updateAdminProfile: async ({ name, avatar }) => {
    try {
      set({ isUpdating: true });

      const formData = new FormData();
      if (name !== undefined) {
        formData.append("name", name);
      }
      if (avatar) {
        formData.append("profilePic", avatar);
      }

      const res = await axiosInstance.put("/admin/profile", formData);
      const updatedAdmin = res.data?.data;

      useAuthStore.getState().setAuthUser(updatedAdmin);

      toast.success("Admin profile updated successfully.");
      return { success: true, data: updatedAdmin };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      return {
        success: false,
        error: message
      };
    } finally {
      set({
        isUpdating: false
      });
    }
  }
}));
