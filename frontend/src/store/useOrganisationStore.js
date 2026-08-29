import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { splitOpportunitiesByStatus } from "../lib/opportunity";
import { formatDate } from "../lib/utils";

const getOpportunitiesFromResponse = (responseData) => {
  const opportunities = Array.isArray(responseData)
    ? responseData
    : responseData?.opportunities || responseData?.data;

  return Array.isArray(opportunities) ? opportunities : [];
};

const mapPublicVolunteerParticipation = (experienceData = []) =>
  [...experienceData]
    .filter((application) => application.opportunityId)
    .sort((first, second) => {
      const firstEndAt = new Date(first.opportunityId.endAt).getTime() || 0;
      const secondEndAt = new Date(second.opportunityId.endAt).getTime() || 0;

      return secondEndAt - firstEndAt;
    })
    .slice(0, 3)
    .map((application, index) => {
      const opportunity = application.opportunityId;

      return {
        id: application._id,
        title: opportunity.title || `Past Opportunity ${index + 1}`,
        organisation:
          opportunity.organisationId?.name ||
          "Organisation details unavailable",
        date: formatDate(
          opportunity.endAt || application.updatedAt || application.createdAt,
        ),
        status: "Completed",
      };
    });

export const useOrganisationStore = create((set, get) => ({
  // --- UI State ---
  currentTab: "homepage",
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // --- Loading States ---
  isOpportunitiesLoading: false,
  opportunitiesError: "",
  isPublicVolunteerProfileLoading: false,
  publicVolunteerProfileError: "",
  isPublicVolunteerParticipationLoading: false,
  publicVolunteerParticipationError: "",
  isUpdatingOrganisationProfile: false,
  isUpdatingOpportunity: false,
  isCreatingOpportunity: false,

  // --- Data State Collections ---
  activeOpportunities: [],
  closedOpportunities: [],
  cancelledOpportunities: [],
  allMyOpportunities: [],
  publicVolunteerProfile: null,
  publicVolunteerParticipation: [],

  // --- Public Volunteer Profile Actions ---
  getPublicVolunteerProfile: async (volunteerId) => {
    set({
      publicVolunteerProfile: null,
      isPublicVolunteerProfileLoading: true,
      publicVolunteerProfileError: "",
    });

    if (!volunteerId) {
      const message =
        "Unable to load the volunteer profile because no volunteer ID is available.";

      set({
        isPublicVolunteerProfileLoading: false,
        publicVolunteerProfileError: message,
      });

      return { success: false, error: message };
    }

    try {
      const response = await axiosInstance.get(
        `/volunteer/profile/${volunteerId}`,
      );
      const profile = response.data?.data;

      if (!profile) {
        throw new Error("Volunteer profile data is unavailable.");
      }

      set({
        publicVolunteerProfile: profile,
        isPublicVolunteerProfileLoading: false,
      });

      return { success: true, profile };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load the volunteer profile.";

      set({
        publicVolunteerProfile: null,
        isPublicVolunteerProfileLoading: false,
        publicVolunteerProfileError: message,
      });

      return { success: false, error: message };
    }
  },

  getPublicVolunteerPastExperience: async (volunteerId) => {
    set({
      publicVolunteerParticipation: [],
      isPublicVolunteerParticipationLoading: true,
      publicVolunteerParticipationError: "",
    });

    if (!volunteerId) {
      const message =
        "Unable to load recent participation because no volunteer ID is available.";

      set({
        isPublicVolunteerParticipationLoading: false,
        publicVolunteerParticipationError: message,
      });

      return { success: false, error: message };
    }

    try {
      const response = await axiosInstance.get(
        `/volunteer/profile/${volunteerId}/past-experience`,
      );
      const experienceData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const participation = mapPublicVolunteerParticipation(experienceData);

      set({
        publicVolunteerParticipation: participation,
        isPublicVolunteerParticipationLoading: false,
      });

      return { success: true, participation };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load recent participation.";

      set({
        publicVolunteerParticipation: [],
        isPublicVolunteerParticipationLoading: false,
        publicVolunteerParticipationError: message,
      });

      return { success: false, error: message };
    }
  },

  // --- Organisation Profile Actions ---
  updateOrganisationProfile: async (profileData) => {
    set({ isUpdatingOrganisationProfile: true });
    try {
      const hasAvatarFile =
        typeof File !== "undefined" && profileData?.avatar instanceof File;
      const requestPayload = hasAvatarFile ? new FormData() : profileData;

      if (hasAvatarFile) {
        requestPayload.append("name", profileData.name ?? "");
        requestPayload.append("biodata", profileData.biodata ?? "");
        requestPayload.append("profilePic", profileData.avatar);
      }

      const res = await axiosInstance.put(
        "/organisation/profile",
        requestPayload,
      );
      const updatedUser = res.data?.data ?? res.data;

      useAuthStore.getState().setAuthUser(updatedUser);
      toast.success("Organisation profile updated successfully.");

      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update organisation profile";

      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUpdatingOrganisationProfile: false });
    }
  },

  // --- Opportunity Management Actions ---
  updateOpportunity: async (opportunityId, opportunityData) => {
    if (!opportunityId) {
      console.error("Cannot update opportunity: opportunityId is missing.");
      return { success: false, error: "Missing ID" };
    }

    set({ isUpdatingOpportunity: true });
    try {
      const res = await axiosInstance.put(`/opportunities/${opportunityId}`, opportunityData);
      
      const updatedOpp = res.data?.data ?? res.data ?? opportunityData;
      toast.success("Opportunity updated successfully.");

      set((state) => {
        const filterOut = (list) => list.filter((opp) => opp._id !== opportunityId);
        const updateInList = (list) => list.map((opp) => opp._id === opportunityId ? { ...opp, ...updatedOpp } : opp);

        const status = (updatedOpp.status || "").toLowerCase();

        let nextActive = updateInList(state.activeOpportunities);
        let nextClosed = updateInList(state.closedOpportunities);
        let nextCancelled = updateInList(state.cancelledOpportunities);

        if (status === "closed" || status === "completed") {
          nextActive = filterOut(state.activeOpportunities);
          if (!state.closedOpportunities.some(o => o._id === opportunityId)) {
            nextClosed = [updatedOpp, ...nextClosed];
          }
          nextCancelled = filterOut(state.cancelledOpportunities);
        } else if (status === "cancelled") {
          nextActive = filterOut(state.activeOpportunities);
          nextClosed = filterOut(state.closedOpportunities);
          if (!state.cancelledOpportunities.some(o => o._id === opportunityId)) {
            nextCancelled = [updatedOpp, ...nextCancelled];
          }
        } else {
          // It's an active status
          if (!state.activeOpportunities.some(o => o._id === opportunityId)) {
            nextActive = [updatedOpp, ...nextActive];
          }
          nextClosed = filterOut(state.closedOpportunities);
          nextCancelled = filterOut(state.cancelledOpportunities);
        }

        return {
          activeOpportunities: nextActive,
          closedOpportunities: nextClosed,
          cancelledOpportunities: nextCancelled,
          allMyOpportunities: updateInList(state.allMyOpportunities),
        };
      });

      return { success: true, data: updatedOpp };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update opportunity";
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUpdatingOpportunity: false });
    }
  },

  // --- Opportunity Management Actions ---
  createOpportunity: async (opportunityData) => {
    set({ isCreatingOpportunity: true });
    try {
      const res = await axiosInstance.post("/opportunities/create", opportunityData);
      const newOpp = res.data?.data ?? res.data;
      
      // Add the newly created opportunity to the top of the active list
      set((state) => ({
        activeOpportunities: [newOpp, ...state.activeOpportunities],
        allMyOpportunities: [newOpp, ...state.allMyOpportunities],
      }));

      return { success: true, data: newOpp };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create opportunity";

      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isCreatingOpportunity: false });
    }
  },

  getMyOpportunities: async () => {
    set({ isOpportunitiesLoading: true, opportunitiesError: "" });
    try {
      const response = await axiosInstance.get("/opportunities/my-opportunities", {
        params: { page: 1, limit: 100 },
      });
      const opportunities = getOpportunitiesFromResponse(response.data);
      set({
        allMyOpportunities: opportunities,
        ...splitOpportunitiesByStatus(opportunities),
      });
      return { success: true, data: opportunities };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load opportunities";

      set({
        activeOpportunities: [],
        closedOpportunities: [],
        cancelledOpportunities: [],
        allMyOpportunities: [],
        opportunitiesError: message,
      });
      return { success: false, error: message };
    } finally {
      set({ isOpportunitiesLoading: false });
    }
  },

  getActiveOpportunities: async () => {
    return get().getMyOpportunities();
  },

  getClosedOpportunities: async () => {
    return get().getMyOpportunities();
  },

  getCancelledOpportunities: async () => {
    return get().getMyOpportunities();
  },

  getAllMyOpportunities: async () => {
    return get().getMyOpportunities();
  },

}));
