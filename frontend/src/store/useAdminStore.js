import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import { useAuthStore } from "./useAuthStore";

const mockAllReports = [
  {
    _id: "mock-1",
    reportType: "OpportunityViolation",
    opportunityViolationType: "Harassment and Discrimination",
    title: "Unacceptable behaviour from event coordinator",
    details:
      "During the community cleanup event on 22 July, the coordinator made repeated dismissive comments directed at volunteers. Several volunteers expressed discomfort. I am reporting this so appropriate action can be taken to ensure a safe environment for all participants.",
    reportedOpportunityId: {
      _id: "opportunity-mock-001",
      title: "Community Food Distribution",
    },
    status: "Pending",
    createdAt: "2025-07-22T10:30:00Z",
  },
  {
    _id: "mock-2",
    reportType: "OpportunityViolation",
    opportunityViolationType: "Disorganized Schedules",
    title: "Event started two hours late with no notice",
    details:
      "The tree-planting drive was scheduled to begin at 9:00 AM but did not start until 11:15 AM. No prior communication was sent to volunteers, many of whom had rearranged their day to attend. This lack of coordination reflects poorly on the organisation and wastes volunteer time.",
    reportedOpportunityId: {
      _id: "opportunity-mock-002",
      title: "Neighbourhood Clean-up",
    },
    status: "Investigating",
    createdAt: "2025-07-10T14:15:00Z",
  },
  {
    _id: "mock-3",
    reportType: "OpportunityViolation",
    opportunityViolationType: "Hazardous Environment",
    title: "Missing safety equipment at construction site",
    details:
      "Volunteers at the building renovation project were not provided with hard hats or safety goggles despite working in an active construction area. I raised the concern on-site but was told to continue. This is a serious health and safety breach that needs to be addressed.",
    reportedOpportunityId: {
      _id: "opportunity-mock-001",
      title: "Community Food Distribution",
    },
    status: "Resolved",
    createdAt: "2025-06-28T09:00:00Z",
  },
  {
    _id: "org-mock-1",
    reportType: "UserViolation",
    userViolationType: "Last Minute Ghosting",
    title: "Volunteer no-show without prior notice",
    details:
      "The volunteer confirmed attendance for the food bank distribution on 20 July but did not show up and could not be reached. This left us short-staffed during a critical distribution window.",
    reportedUserId: {
      _id: "volunteer-mock-001",
      name: "Alex Volunteer",
    },
    status: "Pending",
    createdAt: "2025-07-20T08:00:00Z",
  },
  {
    _id: "org-mock-2",
    reportType: "UserViolation",
    userViolationType: "Poor Work Ethics",
    title: "Volunteer refused to follow assigned tasks",
    details:
      "During the charity drive, the volunteer repeatedly ignored task assignments and spent time on their phone. When asked to help with packing, they became argumentative with other team members.",
    reportedUserId: {
      _id: "volunteer-mock-002",
      name: "Jordan Lee",
    },
    status: "Investigating",
    createdAt: "2025-07-08T13:30:00Z",
  },
  {
    _id: "org-mock-3",
    reportType: "UserViolation",
    userViolationType: "Property Damage",
    title: "Equipment damaged and not reported",
    details:
      "The volunteer returned a projector with a cracked lens and did not report the damage. The equipment was discovered faulty by the next team using it. We are requesting an investigation into the incident.",
    reportedUserId: {
      _id: "volunteer-mock-001",
      name: "Alex Volunteer",
    },
    status: "Resolved",
    createdAt: "2025-06-15T16:45:00Z",
  },
]

export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,
  isUsersLoading: false,
  isOpportunitiesLoading: false,
  isReportsLoading: false,
  reportsError: "",
  opportunitiesError: "",
  isStatsLoading: false,
  statsError: "",
  organisations: [],
  volunteers: [],
  opportunities: [],
  reports: [],

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  getStats: async () => {
    set({ isStatsLoading: true, statsError: "" });
    try {
      const [volRes, orgRes, oppRes, repRes] = await Promise.all([
        axiosInstance.get("/user/volunteers"),
        axiosInstance.get("/user/organisations"),
        axiosInstance.get("/opportunities"),
        axiosInstance.get("/report/"),
      ]);

      const volunteers = Array.isArray(volRes.data?.volunteers)
        ? volRes.data.volunteers
        : [];
      const organisations = Array.isArray(orgRes.data?.organisations)
        ? orgRes.data.organisations
        : [];
      const opportunities = Array.isArray(oppRes.data?.data)
        ? oppRes.data.data
        : [];
      const reports = Array.isArray(repRes.data?.reports)
        ? repRes.data.reports
        : [];

      set({
        volunteers,
        organisations,
        opportunities,
        reports,
      });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard overview";

      set({
        volunteers: [],
        organisations: [],
        opportunities: [],
        reports: [],
        statsError: message,
      });
      return { success: false, error: message };
    } finally {
      set({ isStatsLoading: false });
    }
  },

  getAllOrganisations: async () => {
    set({ isUsersLoading: true });
    
    try {
      const res = await axiosInstance.get('/user/organisations');
      const organisations = Array.isArray(res.data?.organisations)
        ? res.data.organisations
        : [];
      set({ organisations });
      return { success: true, organisations };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load organisations";
      set({ organisations: [] });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUsersLoading: false });
    }

  },

  getAllVolunteers: async () => {
    set({ isUsersLoading: true });
    
    try {
      const res = await axiosInstance.get('/user/volunteers');
      const volunteers = Array.isArray(res.data?.volunteers)
        ? res.data.volunteers
        : [];
      set({ volunteers });
      return { success: true, volunteers };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load volunteers";
      set({ volunteers: [] });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUsersLoading: false });
    }
  },

  rejectUserAccount: async (userId, onClose) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/reject`);
      toast.success('User account rejected!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
      return { success: true, user: response.data?.user };
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  approveUserAccount: async (userId, onClose) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/approve`);
      toast.success('User account approved!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
      return { success: true, user: response.data?.user };
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  getAllOpportunities: async () => {
    set({ isOpportunitiesLoading: true, opportunitiesError: "" });
    
    try {
        const res = await axiosInstance.get('/opportunities');
        const opportunities = Array.isArray(res.data?.data) ? res.data.data : [];
        set({ opportunities });
        return { success: true, opportunities };
    } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load opportunities.";
        set({ opportunities: [], opportunitiesError: message });
        toast.error(message);
        return { success: false, error: message };
    } finally {
        set({ isOpportunitiesLoading: false });
    }

  },

  // TODO: integrate with backend to get all report made by volunteer / organisation
  getAllReports: async() => {
    set({ 
      isReportsLoading: true, 
      reportsError: "" 
    });

    try {
      // TODO: replace mockAllReports with actual API call
      // const res = await axiosInstance.get('/report/');
      // const reports = Array.isArray(res.data?.reports) ? res.data.reports : [];

      set({ reports: mockAllReports });

      return {
        success: true,
        data: mockAllReports,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load reports";

      set({
        reports: [],
        reportsError: message,
      });

      return { 
        success: false, 
        error: message 
      };
    } finally {
      set({ isReportsLoading: false });
    }
  },

  // TODO: implement report status changing between ["Pending", "Investigating", "Resolved", "Dismissed"]
  updateReportStatus: async(reportId, status) => {
    try {

      // query
      // update

      return { 
        success: true, 
        report: response.data?.report 
      };
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
      return { 
        success: false, 
        error: message 
      };
    }
  },

  updateAdminProfile: async ({ name, avatar }) => {
    try {
      set({ isUpdating: true });

      const formData = new FormData();
      if (name !== undefined) {
        formData.append("name", name);
      }
      if (avatar) {
        formData.append("profilePic", avatar);
      }

      const res = await axiosInstance.put("/admin/profile", formData);
      const updatedAdmin = res.data?.data;

      useAuthStore.getState().setAuthUser(updatedAdmin);

      toast.success("Admin profile updated successfully.");
      return { success: true, data: updatedAdmin };

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
