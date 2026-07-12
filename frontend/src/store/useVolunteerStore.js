import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { formatDate } from "../lib/utils";
import { useAuthStore } from "./useAuthStore";

const getOpportunityDurationHours = (opportunity) => {
  if (!opportunity?.startAt || !opportunity?.endAt) return 0;

  const startAt = new Date(opportunity.startAt);
  const endAt = new Date(opportunity.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return 0;
  }

  return Math.max((endAt - startAt) / (1000 * 60 * 60), 0);
};

const mapVolunteerPastExperience = (experienceData = []) =>
  experienceData.map((activity, index) => {
    const opportunity = activity.opportunityId;
    const loggedHours = Number(
      activity.loggedHours ?? getOpportunityDurationHours(opportunity),
    );

    return {
      id: activity._id,
      title: opportunity?.title || `Completed Opportunity ${index + 1}`,
      organisation:
        opportunity?.organisationId?.name || "Organisation details unavailable",
      date: formatDate(opportunity?.endAt || activity.updatedAt || activity.createdAt),
      hours: `${loggedHours.toFixed(1)} hrs`,
      loggedHours,
      status: "Completed",
    };
  });

const calculateTotalVolunteerHours = (history) =>
  `${history
    .reduce((total, activity) => total + activity.loggedHours, 0)
    .toFixed(1)}h`;

const mockVolunteerApplications = [
  {
    _id: "mock-application-community-garden",
    opportunityTitle: "Community Garden Setup",
    location: "Semenyih Community Garden",
    startAt: "2026-06-08T09:00:00",
    endAt: "2026-06-08T13:00:00",
    status: "approved",
  },
  {
    _id: "mock-application-food-bank",
    opportunityTitle: "Food Bank Helper",
    location: "Community Food Bank",
    startAt: "2026-06-03T10:00:00",
    endAt: "2026-06-03T14:00:00",
    status: "pending",
  },
  {
    _id: "mock-application-recycling",
    opportunityTitle: "Recycling Drive Sorter",
    location: "Butterworth Community Hall",
    startAt: "2026-06-13T09:00:00",
    endAt: "2026-06-13T12:30:00",
    status: "rejected",
  },
];

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
  volunteerApplications: [],
  isVolunteerApplicationsLoading: false,
  volunteerApplicationsError: "",

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  getVolunteerPastExperience: async (volunteerId) => {
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
      const history = mapVolunteerPastExperience(response.data?.data ?? []);

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
      const response = await axiosInstance.get("/opportunities");
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

  getVolunteerApplications: async (volunteerId) => {
    set({
      isVolunteerApplicationsLoading: true,
      volunteerApplicationsError: "",
    });

    if (!volunteerId) {
      set({
        volunteerApplications: [],
        isVolunteerApplicationsLoading: false,
        volunteerApplicationsError:
          "Unable to load applications because no volunteer ID is available.",
      });
      return { success: false };
    }

    const applications = mockVolunteerApplications;

    set({
      volunteerApplications: applications,
      isVolunteerApplicationsLoading: false,
    });

    return { success: true, applications };
  },

  updateVolunteerProfile: async (volunteerId, profilePayload) => {
    set({ isUpdatingVolunteerProfile: true });

    try {
      const hasAvatarFile =
        typeof File !== "undefined" && profilePayload?.avatar instanceof File;
      const requestPayload = hasAvatarFile ? new FormData() : profilePayload;

      if (hasAvatarFile) {
        requestPayload.append("fullName", profilePayload.fullName ?? "");
        requestPayload.append("ageGroup", profilePayload.ageGroup ?? "");
        requestPayload.append("biodata", profilePayload.biodata ?? "");
        requestPayload.append("skills", JSON.stringify(profilePayload.skills ?? []));
        requestPayload.append(
          "availability",
          JSON.stringify(profilePayload.availability ?? []),
        );
        requestPayload.append("profilePic", profilePayload.avatar);
      }

      const response = await axiosInstance.put(
        `/volunteer/profile/${volunteerId}`,
        requestPayload,
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
