import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const useOrganisationStore = create((set, get) => ({
    activeOpportunities: [],
    isActiveOpportunitiesLoading: true,

    closedOpportunities: [],
    isClosedOpportunitiesLoading: true,

    cancelledOpportunities: [],
    isCancelledOpportunitiesLoading: true,

    pendingApplications: [],
    isPendingApplicationsLoading: true,

    approvedApplications: [],
    isApproveApplicationsLoading: true,

    rejectedApplications: [],
    isRejectedApplications: true,
    
    completedApplications: [],
    isCompletedApplications: true,

    // TODO: create all the get fucntions below by calling backend via axiosInstance

    getActiveOppotunities: async (userId) => {
        set({ isActiveOpportunitiesLoading: true });

        try {
            const res = await axiosInstance.get();
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isActiveOpportunitiesLoading: false });
        }
    },

    getClosedOpportunities: async (userId) => {
        set({ isClosedOpportunities: true });

        try {
            const res = await axiosInstance.get();
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isClosedOpportunities: false });
        }
    },

    getCancelledOpportunities: async (userId) => {
        set({ isCancelledOpportunitiesLoading: true });

        try {
            const res = await axiosInstance.get();
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isCancelledOpportunitiesLoading: false });
        }
    },

    getPendingApplications: async (userId) => {

    },

    getApprovedApplications: async (userId) => {

    },

    getRejectedApplications: async (userId) => {

    },

    getCompletedApplications: async(userId) => {

    },

}));