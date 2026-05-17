import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { formatDate } from "../lib/utils";
import { useAuthStore } from "./useAuthStore";

const mapVolunteerPastOpportunity = (experienceData = []) =>
  experienceData.map((activity, index) => ({
    id: activity._id,
    title: `Completed Opportunity ${index + 1}`,
    organisation: "Organisation details unavailable",
    date: formatDate(activity.updatedAt || activity.createdAt),
    hours: `${Number(activity.loggedHours ?? 0).toFixed(1)} hrs`,
    loggedHours: Number(activity.loggedHours ?? 0),
    status: activity.status ?? "Completed",
  }));

const calculateTotalVolunteerHours = (history) =>
  `${history
    .reduce((total, activity) => total + activity.loggedHours, 0)
    .toFixed(1)}h`;

export const useVolunteerStore = create((set) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  volunteerId: "",
  participationHistory: [],
  totalVolunteerHours: "0.0h",
  isLoading: true,
  loadError: "",
  isUpdatingVolunteerProfile: false,
  opportunities: [],
  isOpportunitiesLoading: false,
  opportunitiesError: "",

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  getVolunteerPastOpportunity: async (volunteerId) => {
    set({
      volunteerId,
      isLoading: true,
      loadError: "",
    });

    if (!volunteerId) {
      set({
        participationHistory: [],
        totalVolunteerHours: "0.0h",
        loadError: "Unable to load volunteer history because no volunteer ID is available.",
        isLoading: false,
      });
      return { success: false };
    }

    try {
      const response = await axiosInstance.get(
        `/volunteer/profile/${volunteerId}/past-experience`,
      );
      const history = mapVolunteerPastOpportunity(response.data?.data ?? []);

      set({
        participationHistory: history,
        totalVolunteerHours: calculateTotalVolunteerHours(history),
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load volunteer history.";

      set({
        participationHistory: [],
        totalVolunteerHours: "0.0h",
        loadError: message,
        isLoading: false,
      });

      return { success: false, error: message };
    }
  },

  getAllOpportunities: async () => {
    set({
      isOpportunitiesLoading: true,
      opportunitiesError: "",
    });

    try {
      const response = await axiosInstance.get("/opportunity");
      const opportunities = response.data?.data ?? [];

      set({
        opportunities,
        isOpportunitiesLoading: false,
      });

      return { success: true, opportunities };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load opportunities.";

      set({
        opportunities: [],
        opportunitiesError: message,
        isOpportunitiesLoading: false,
      });

      return { success: false, error: message };
    }
  },

  updateVolunteerProfile: async (volunteerId, profilePayload) => {
    set({ isUpdatingVolunteerProfile: true });

    try {
      const response = await axiosInstance.put(
        `/volunteer/profile/${volunteerId}`,
        profilePayload,
      );
      const updatedProfile = response.data?.data ?? {};

      useAuthStore.getState().setAuthUser(updatedProfile);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to save profile details.";

      return { success: false, error: message };
    } finally {
      set({ isUpdatingVolunteerProfile: false });
    }
  },
}));
