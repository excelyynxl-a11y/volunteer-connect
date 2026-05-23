import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const normaliseOpportunity = (opportunity) => ({
  ...opportunity,
  detail: opportunity.detail ?? opportunity.details ?? "",
});

export const useOrganisationStore = create((set, get) => ({
  // --- UI State ---
  currentTab: "homepage",
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // --- Loading States ---
  isLoading: false,
  isUpdatingOrganisationProfile: false,
  isUpdatingOpportunity: false,
  isCreatingOpportunity: false,

  // --- Data State Collections ---
  activeOpportunities: [],
  closedOpportunities: [],
  cancelledOpportunities: [],
  
  pendingApplications: [],
  approvedApplications: [],
  rejectedApplications: [],
  completedApplications: [],

  // --- Organisation Profile Actions ---
  updateOrganisationProfile: async (profileData) => {
    set({ isUpdatingOrganisationProfile: true });
    try {
      const res = await axiosInstance.put("/organisation/profile", profileData);
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

  createOpportunity: async (opportunityData) => {
    set({ isCreatingOpportunity: true });
    try {
      const res = await axiosInstance.post("/opportunities/create", opportunityData);      
      const newOpp = normaliseOpportunity(res.data?.data ?? res.data);

      toast.success("Opportunity created successfully!");

      set((state) => ({
        activeOpportunities: [newOpp, ...state.activeOpportunities],
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

  updateOpportunity: async (opportunityId, opportunityData) => {
    if (!opportunityId) {
      console.error("Cannot update opportunity: opportunityId is missing.");
      return { success: false, error: "Missing ID" };
    }

    set({ isUpdatingOpportunity: true });
    try {
      const res = await axiosInstance.put(`/opportunities/${opportunityId}`, opportunityData);
      
      const updatedOpp = normaliseOpportunity(res.data?.data ?? res.data ?? opportunityData);
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

  getActiveOpportunities: async () => {
    try {
      const response = await axiosInstance.get("/opportunities/my-opportunities");
      const rawData = Array.isArray(response.data) ? response.data : (response.data.opportunities || response.data.data || []);
      
      const active = rawData.filter(opp => opp.status !== "closed" && opp.status !== "cancelled" && opp.status !== "completed");
      set({ activeOpportunities: active });
    } catch (error) {
      console.error("Error fetching active opportunities:", error);
      set({ activeOpportunities: [] });
    }
  },

  getClosedOpportunities: async () => {
    try {
      const response = await axiosInstance.get("/opportunities/my-opportunities");
      const rawData = Array.isArray(response.data) ? response.data : (response.data.opportunities || response.data.data || []);
      
      const closed = rawData.filter(opp => opp.status === "closed" || opp.status === "completed");
      set({ closedOpportunities: closed });
    } catch (error) {
      console.error("Error fetching closed opportunities:", error);
      set({ closedOpportunities: [] });
    }
  },

  getCancelledOpportunities: async () => {
    try {
      const response = await axiosInstance.get("/opportunities/my-opportunities");
      const rawData = Array.isArray(response.data) ? response.data : (response.data.opportunities || response.data.data || []);
      
      const cancelled = rawData.filter(opp => opp.status === "cancelled");
      set({ cancelledOpportunities: cancelled });
    } catch (error) {
      console.error("Error fetching cancelled opportunities:", error);
      set({ cancelledOpportunities: [] });
    }
  },

  // --- Application State Actions ---
  getPendingApplications: async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/application/pending/${userId}`);
      set({ pendingApplications: res.data });
    } catch (error) {
      console.error("Failed to load pending applications", error);
    }
  },

  getApprovedApplications: async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/application/approved/${userId}`);
      set({ approvedApplications: res.data });
    } catch (error) {
      console.error("Failed to load approved applications", error);
    }
  },

  getRejectedApplications: async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/application/rejected/${userId}`);
      set({ rejectedApplications: res.data });
    } catch (error) {
      console.error("Failed to load rejected applications", error);
    }
  },

  getCompletedApplications: async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/application/completed/${userId}`);
      set({ completedApplications: res.data });
    } catch (error) {
      console.error("Failed to load completed applications", error);
    }
  },
}));