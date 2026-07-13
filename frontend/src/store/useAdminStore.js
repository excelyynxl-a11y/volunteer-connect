import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import { useAuthStore } from "./useAuthStore";

export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,
  isUsersLoading: false,
  isOpportunitiesLoading: false,
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
        axiosInstance.get("/opportunities"),
        axiosInstance.get("/report/"),
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
        reports,
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
        statsError: message,
      });
      return { success: false, error: message };
    } finally {
      set({ isStatsLoading: false });
    }
  },

  getAllOrganisations: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/organisations');
        set({ organisations: res.data.organisations });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }

  },

  getAllVolunteers: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/volunteers');
        set({ volunteers: res.data.volunteers });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }
  },

  rejectUserAccount: async (userId, onClose) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/reject`);
      toast.success('User account rejected!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
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
      const response = await axiosInstance.patch(`/admin/users/${userId}/approve`);
      toast.success('User account approved!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
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
        const res = await axiosInstance.get('/opportunities');
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

  getAllReports: () => {
    // TODO: call getAllReports
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
        error: message,
      };
    } finally {
      set({
        isUpdating: false,
      });
    }
  },

}));
