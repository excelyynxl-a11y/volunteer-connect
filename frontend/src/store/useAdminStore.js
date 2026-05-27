import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { malaysiaStateCities } from "../lib/data";
import toast from 'react-hot-toast';

const locationFrom = (state, city) => {
  const stateCities = malaysiaStateCities[state] || [];
  const resolvedCity = stateCities.includes(city)
    ? city
    : stateCities[0] || city;

  return `${state}, ${resolvedCity}`;
};

export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,
  isUsersLoading: false,
  isOpportunitiesLoading: false,
  adminStats: [],
  organisations: [],
  volunteers: [],
  opportunities: [],
  reports: [],

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  getStats: async () => {

    // AdminHomepage has 6 AdminStatsCard of:
    // [activeVolunteers, activeOrg, activeOpp, openReport, pendingVol, pendingOrg]
    try {
      const [volRes, orgRes, oppRes, repRes] = await Promise.all([
        axiosInstance.get("/user/volunteers"),
        axiosInstance.get("/user/organisations"),
        axiosInstance.get("/opportunity/"),
        axiosInstance.get("/report/"),
      ]);

      const volunteers = volRes.data.volunteers || [];
      const organisations = orgRes.data.organisations || [];
      const opportunities = oppRes.data.data || [];
      const reports = repRes.data.reports || [];

      set({
        volunteers,
        organisations,
        opportunities,
        reports,
        adminStats: [
          {
            key: "volunteers",
            value: String(volunteers.filter((v) => v.approvalStatus === "approved").length),
            label: "Active Volunteers",
          },
          {
            key: "organisations",
            value: String(organisations.filter((o) => o.approvalStatus === "approved").length),
            label: "Active Organisations",
          },
          {
            key: "opportunities",
            value: String(opportunities.filter((o) => o.status === "active").length),
            label: "Active Opportunities",
          },
          {
            key: "reports",
            value: String(reports.filter((r) => r.status === "Pending").length),
            label: "Open Reports",
          },
          {
            key: "volunteerswaitingapproval",
            value: String(volunteers.filter((v) => v.approvalStatus === "pending").length),
            label: "Volunteer Waiting Approval",
          },
          {
            key: "organisationswaitingapproval",
            value: String(organisations.filter((o) => o.approvalStatus === "pending").length),
            label: "Organisations Waiting Approval",
          },
        ],
      });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load stats");
    }
  },

  getAllOrganisations: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/organisations');
        set({ organisations: res.data.organisations });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }

  },

  getAllVolunteers: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/volunteers');
        set({ volunteers: res.data.volunteers });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }
  },

  rejectUserAccount: async (userId, onClose) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/reject`);
      toast.success('User account rejected!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  approveUserAccount: async (userId, onClose) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/approve`);
      toast.success('User account approved!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  getAllOpportunities: async () => {
    set({ isOpportunitiesLoading: true });
    
    try {
        const res = await axiosInstance.get('/opportunity/');
        set({ opportunities: res.data.data });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isOpportunitiesLoading: false });
    }

  },

  getAllReports: () => {
    // TODO: call getAllReports
  },

  updateAdminProfile: async ({ name, avatar }) => {
    try {
      set({ isUpdating: true });

      const formData = new FormData();
      formData.append("name", name);
      if (avatar) {
        formData.append("profilePic", avatar);
      }

      const res = await axiosInstance.put("/admin/profile", formData);

      toast.success("Admin profile updated successfully.");
      return { success: true, data: res.data.data };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      set({
        isUpdating: false,
      });
    }
  },

}));
