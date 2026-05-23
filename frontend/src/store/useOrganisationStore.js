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

  // --- Opportunity CRUD Actions ---
  createOpportunity: async (opportunityData) => {
    set({ isCreatingOpportunity: true });
    try {
    const res = await axiosInstance.post("/opportunity/create", opportunityData);      const newOpp = normaliseOpportunity(res.data?.data ?? res.data);

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
      const res = await axiosInstance.put(`/opportunity/${opportunityId}`, opportunityData);
      
      toast.success("Opportunity updated successfully.");

      set((state) => ({
        activeOpportunities: state.activeOpportunities.map((opp) =>
          opp._id === opportunityId ? { ...opp, ...opportunityData } : opp
        )
      }));

      return { success: true, data: res.data };
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
    const res = await axiosInstance.get("/opportunities/my-opportunities"); 
    
    if (res.data && res.data.success) {
      const allOpps = res.data.data || [];
      
      const active = allOpps.filter(opp => opp.status === "active");
      
      set({ activeOpportunities: active });
    }
  } catch (error) {
    console.error("Error fetching active opportunities:", error);
  }
},

  getClosedOpportunities: async (orgId) => {
    if (!orgId) return;
    try {
      const res = await axiosInstance.get(`/opportunities/organisation/${orgId}?status=closed`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      set({ closedOpportunities: data.map(normaliseOpportunity) });
    } catch (error) {
      console.error("Error fetching closed opportunities:", error);
    }
  },

  getCancelledOpportunities: async (orgId) => {
    if (!orgId) return;
    try {
      const res = await axiosInstance.get(`/opportunities/organisation/${orgId}?status=cancelled`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      set({ cancelledOpportunities: data.map(normaliseOpportunity) });
    } catch (error) {
      console.error("Error fetching cancelled opportunities:", error);
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