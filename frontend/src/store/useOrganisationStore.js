import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const mockActiveOpportunities = [
  {
    _id: "active-001",
    title: "Community Food Drive Helper",
    details: "Support food packing, registration, and distribution for local families.",
    location: "Selangor, Cheras",
    category: ["Community"],
    startAt: "2026-05-20T09:00:00+08:00",
    endAt: "2026-05-20T14:00:00+08:00",
    organisationId: "mock-organisation",
    status: "Active",
  },
  {
    _id: "active-002",
    title: "Beach Cleanup Volunteer",
    details: "Help collect litter, sort recyclables, and document cleanup progress.",
    location: "Pulau Pinang, Batu Ferringhi",
    category: ["Environment", "Community"],
    startAt: "2026-05-24T08:00:00+08:00",
    endAt: "2026-05-24T12:00:00+08:00",
    organisationId: "mock-organisation",
    status: "Active",
  },
  {
    _id: "active-003",
    title: "Literacy Tutor",
    details: "Assist children with reading practice and basic writing exercises.",
    location: "Selangor, Petaling Jaya",
    category: ["Education"],
    startAt: "2026-05-28T15:00:00+08:00",
    endAt: "2026-05-30T18:00:00+08:00",
    organisationId: "mock-organisation",
    status: "Active",
  },
];

const mockClosedOpportunities = [
  {
    _id: "closed-001",
    title: "Senior Care Companion",
    details: "Spent the afternoon supporting seniors through conversation and activities.",
    location: "Selangor, Subang Jaya",
    category: ["Elderly Care"],
    startAt: "2026-04-15T13:00:00+08:00",
    endAt: "2026-04-15T16:00:00+08:00",
    organisationId: "mock-organisation",
    status: "Closed",
  },
  {
    _id: "closed-002",
    title: "Community Garden Setup",
    details: "Prepared planting beds, labelled seedlings, and arranged gardening tools.",
    location: "Johor, Johor Bahru",
    category: ["Environment"],
    startAt: "2026-04-22T08:30:00+08:00",
    endAt: "2026-04-23T11:30:00+08:00",
    organisationId: "mock-organisation",
    status: "Closed",
  },
];

const mockCancelledOpportunities = [
  {
    _id: "cancelled-001",
    title: "Outdoor Health Booth",
    details: "Cancelled due to severe weather conditions.",
    location: "Melaka, Ayer Keroh",
    category: ["Health"],
    startAt: "2026-05-02T10:00:00+08:00",
    endAt: "2026-05-02T15:00:00+08:00",
    organisationId: "mock-organisation",
    status: "Cancelled",
  },
];

const normaliseOpportunity = (opportunity) => ({
  ...opportunity,
  detail: opportunity.detail ?? opportunity.details ?? "",
});

const loadMockOpportunities = async (set, loadingKey, dataKey, mockData) => {
  set({ [loadingKey]: true });
  try {
    const opportunities = mockData.map(normaliseOpportunity);
    set({ [dataKey]: opportunities });
    return opportunities;
  } finally {
    set({ [loadingKey]: false });
  }
};

export const useOrganisationStore = create((set, get) => ({

    currentTab: "homepage",
    sidebarCollapsed: false,
    isUpdatingOrganisationProfile: false,
    isUpdatingOpportunity: false,

    setCurrentTab: (tab) => set({ currentTab: tab }),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

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

    
    updateOpportunity: async (opportunityId, opportunityData) => {
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

    activeOpportunities: mockActiveOpportunities.map(normaliseOpportunity),
    isActiveOpportunitiesLoading: false,

    closedOpportunities: mockClosedOpportunities.map(normaliseOpportunity),
    isClosedOpportunitiesLoading: false,

    cancelledOpportunities: mockCancelledOpportunities.map(normaliseOpportunity),
    isCancelledOpportunitiesLoading: false,

    pendingApplications: [],
    isPendingApplicationsLoading: false,

    approvedApplications: [],
    isApproveApplicationsLoading: false,

    rejectedApplications: [],
    isRejectedApplications: false,
    
    completedApplications: [],
    isCompletedApplications: false,

    getActiveOpportunities: async () => loadMockOpportunities(
      set,
      "isActiveOpportunitiesLoading",
      "activeOpportunities",
      mockActiveOpportunities,
    ),

    getClosedOpportunities: async () => loadMockOpportunities(
      set,
      "isClosedOpportunitiesLoading",
      "closedOpportunities",
      mockClosedOpportunities,
    ),

    getCancelledOpportunities: async () => loadMockOpportunities(
      set,
      "isCancelledOpportunitiesLoading",
      "cancelledOpportunities",
      mockCancelledOpportunities,
    ),

    getPendingApplications: async (userId) => {
        // set({ isPendingApplicationsLoading: true });
        // try {
        //     const res = await axiosInstance.get(`/application/pending/${userId}`);
        //     set({ pendingApplications: res.data });
        // } catch (error) {
        //     toast.error(error.response?.data?.message || "Failed to load pending applications");
        // } finally {
        //     set({ isPendingApplicationsLoading: false });
        // }
    },

    getApprovedApplications: async (userId) => {
        // set({ isApproveApplicationsLoading: true });
        // try {
        //     const res = await axiosInstance.get(`/application/approved/${userId}`);
        //     set({ approvedApplications: res.data });
        // } catch (error) {
        //     toast.error(error.response?.data?.message || "Failed to load approved applications");
        // } finally {
        //     set({ isApproveApplicationsLoading: false });
        // }
    },

    getRejectedApplications: async (userId) => {
        // set({ isRejectedApplications: true });
        // try {
        //     const res = await axiosInstance.get(`/application/rejected/${userId}`);
        //     set({ rejectedApplications: res.data });
        // } catch (error) {
        //     toast.error(error.response?.data?.message || "Failed to load rejected applications");
        // } finally {
        //     set({ isRejectedApplications: false });
        // }
    },

    getCompletedApplications: async (userId) => {
        // set({ isCompletedApplications: true });
        // try {
        //     const res = await axiosInstance.get(`/application/completed/${userId}`);
        //     set({ completedApplications: res.data });
        // } catch (error) {
        //     toast.error(error.response?.data?.message || "Failed to load completed applications");
        // } finally {
        //     set({ isCompletedApplications: false });
        // }
    },
}));
