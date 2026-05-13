import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useOrganisationStore = create((set, get) => ({
    activeOpportunities: [],
    isActiveOpportunitiesLoading: false,

    closedOpportunities: [],
    isClosedOpportunitiesLoading: false,

    cancelledOpportunities: [],
    isCancelledOpportunitiesLoading: false,

    pendingApplications: [],
    isPendingApplicationsLoading: false,

    approvedApplications: [],
    isApproveApplicationsLoading: false,

    rejectedApplications: [],
    isRejectedApplications: false,
    
    completedApplications: [],
    isCompletedApplications: false,

    getActiveOppotunities: async (userId) => {
        set({ isActiveOpportunitiesLoading: true });
        try {
            const res = await axiosInstance.get(`/opportunities/active/${userId}`);
            set({ activeOpportunities: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load active opportunities");
        } finally {
            set({ isActiveOpportunitiesLoading: false });
        }
    },

    getClosedOpportunities: async (userId) => {
        set({ isClosedOpportunitiesLoading: true });
        try {
            const res = await axiosInstance.get(`/opportunities/closed/${userId}`);
            set({ closedOpportunities: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load closed opportunities");
        } finally {
            set({ isClosedOpportunitiesLoading: false });
        }
    },

    getCancelledOpportunities: async (userId) => {
        set({ isCancelledOpportunitiesLoading: true });
        try {
            const res = await axiosInstance.get(`/opportunities/cancelled/${userId}`);
            set({ cancelledOpportunities: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load cancelled opportunities");
        } finally {
            set({ isCancelledOpportunitiesLoading: false });
        }
    },

    getPendingApplications: async (userId) => {
        set({ isPendingApplicationsLoading: true });
        try {
            const res = await axiosInstance.get(`/applications/pending/${userId}`);
            set({ pendingApplications: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load pending applications");
        } finally {
            set({ isPendingApplicationsLoading: false });
        }
    },

    getApprovedApplications: async (userId) => {
        set({ isApproveApplicationsLoading: true });
        try {
            const res = await axiosInstance.get(`/applications/approved/${userId}`);
            set({ approvedApplications: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load approved applications");
        } finally {
            set({ isApproveApplicationsLoading: false });
        }
    },

    getRejectedApplications: async (userId) => {
        set({ isRejectedApplications: true });
        try {
            const res = await axiosInstance.get(`/applications/rejected/${userId}`);
            set({ rejectedApplications: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load rejected applications");
        } finally {
            set({ isRejectedApplications: false });
        }
    },

    getCompletedApplications: async (userId) => {
        set({ isCompletedApplications: true });
        try {
            const res = await axiosInstance.get(`/applications/completed/${userId}`);
            set({ completedApplications: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load completed applications");
        } finally {
            set({ isCompletedApplications: false });
        }
    },
}));
