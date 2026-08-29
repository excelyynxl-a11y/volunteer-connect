import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useApplicationStore = create((set) => ({
  applications: [],
  selectedApplication: null,
  isApplicationsLoading: false,
  isSubmittingApplication: false,
  isUpdatingApplication: false,
  applicationsError: "",
  clearApplicationsError: () => set({ applicationsError: "" }),

  // GET /api/application - Fetch applications for the authenticated volunteer
  getMyApplications: async ({ status } = {}) => {
    set({ isApplicationsLoading: true, applicationsError: "" });
    try {
      const response = await axiosInstance.get("/application", {
        params: { status, page: 1, limit: 100 },
      });
      set({ applications: response.data.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch applications";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  // GET /api/application/organisation - Fetch applications received by the organisation
  getMyOrganisationApplications: async ({ status, opportunityId } = {}) => {
    set({ isApplicationsLoading: true, applicationsError: "" });
    try {
      const response = await axiosInstance.get("/application/organisation", {
        params: { status, opportunityId, page: 1, limit: 100 },
      });
      set({ applications: response.data.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch organisation applications";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  // GET /api/application/:id - Fetch single application details
  getApplicationById: async (applicationId) => {
    set({ isApplicationsLoading: true, applicationsError: "" });
    try {
      const response = await axiosInstance.get(`/application/${applicationId}`);
      set({ selectedApplication: response.data.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch application details";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  // POST /api/application - Submit a new application
  createApplication: async (opportunityId) => {
    set({ isSubmittingApplication: true, applicationsError: "" });
    try {
      const response = await axiosInstance.post("/application", { opportunityId });
      
      // Instantly prepend the populated database response into state
      set((state) => ({
        applications: [response.data.data, ...state.applications],
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit application";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isSubmittingApplication: false });
    }
  },

  // PUT /api/application/:id/approve - Approve application
  approveApplication: async (applicationId) => {
    set({ isUpdatingApplication: true, applicationsError: "" });
    try {
      const response = await axiosInstance.put(`/application/${applicationId}/approve`);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === applicationId ? response.data.data : app
        ),
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to approve application";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isUpdatingApplication: false });
    }
  },

  // PUT /api/application/:id/reject - Reject application
  rejectApplication: async (applicationId, reason) => {
    set({ isUpdatingApplication: true, applicationsError: "" });
    try {
      const response = await axiosInstance.put(`/application/${applicationId}/reject`, {
        reason,
        rejectionReason: reason, // sending both keys so backend accepts either
      });
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === applicationId ? response.data.data : app
        ),
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reject application";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isUpdatingApplication: false });
    }
  },

  // PUT /api/application/:id/withdraw - Withdraw application
  withdrawApplication: async (applicationId, withdrawalReason) => {
    set({ isUpdatingApplication: true, applicationsError: "" });
    try {
      const response = await axiosInstance.put(`/application/${applicationId}/withdraw`, {
        withdrawalReason,
      });
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === applicationId ? response.data.data : app
        ),
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to withdraw application";
      set({ applicationsError: message });
      throw error;
    } finally {
      set({ isUpdatingApplication: false });
    }
  },
}));
