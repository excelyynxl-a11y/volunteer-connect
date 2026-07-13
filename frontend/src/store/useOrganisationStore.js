import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { splitOpportunitiesByStatus } from "../lib/opportunity";

const getOpportunitiesFromResponse = (responseData) => {
  const opportunities = Array.isArray(responseData)
    ? responseData
    : responseData?.opportunities || responseData?.data;

  return Array.isArray(opportunities) ? opportunities : [];
};

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
  isUpdatingOrganisationProfile: false,
  isUpdatingOpportunity: false,
  isCreatingOpportunity: false,

  // --- Data State Collections ---
  activeOpportunities: [],
  closedOpportunities: [],
  cancelledOpportunities: [],
  allMyOpportunities: [],
  
  pendingApplications: [],
  approvedApplications: [],
  rejectedApplications: [],
  completedApplications: [],

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
      const response = await axiosInstance.get("/opportunities/my-opportunities");
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
