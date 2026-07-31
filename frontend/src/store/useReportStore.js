import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

// TODO: remove after backend integration
// mock previous reports for volunteer (OpportunityViolation)
const mockVolunteerReports = [
  {
    _id: "mock-1",
    reportType: "OpportunityViolation",
    opportunityViolationType: "Harassment and Discrimination",
    title: "Unacceptable behaviour from event coordinator",
    details:
      "During the community cleanup event on 22 July, the coordinator made repeated dismissive comments directed at volunteers. Several volunteers expressed discomfort. I am reporting this so appropriate action can be taken to ensure a safe environment for all participants.",
    reportedOpportunityId: {
      _id: "opportunity-mock-001",
      title: "Community Food Distribution"
    },
    status: "Pending",
    createdAt: "2025-07-22T10:30:00Z"
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
      title: "Neighbourhood Clean-up"
    },
    status: "Investigating",
    createdAt: "2025-07-10T14:15:00Z"
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
      title: "Community Food Distribution"
    },
    status: "Resolved",
    createdAt: "2025-06-28T09:00:00Z"
  }
];

// TODO: remove after backend integration
// mock previous reports for organisation (UserViolation)
const mockOrganisationReports = [
  {
    _id: "org-mock-1",
    reportType: "UserViolation",
    userViolationType: "Last Minute Ghosting",
    title: "Volunteer no-show without prior notice",
    details:
      "The volunteer confirmed attendance for the food bank distribution on 20 July but did not show up and could not be reached. This left us short-staffed during a critical distribution window.",
    reportedUserId: {
      _id: "volunteer-mock-001",
      name: "Alex Volunteer"
    },
    status: "Pending",
    createdAt: "2025-07-20T08:00:00Z"
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
      name: "Jordan Lee"
    },
    status: "Investigating",
    createdAt: "2025-07-08T13:30:00Z"
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
      name: "Alex Volunteer"
    },
    status: "Resolved",
    createdAt: "2025-06-15T16:45:00Z"
  }
];

export const useReportStore = create((set, get) => ({
  previousReports: [],
  isPreviousReportsLoading: false,
  isCreatingReport: false,
  previousReportsError: "",

  getPreviousReports: async (userId, reportType = "OpportunityViolation") => {
    set({
      isPreviousReportsLoading: true,
      previousReportsError: ""
    });

    try {
      const res = await axiosInstance.get("/report/");
      const reports = Array.isArray(res.data?.reports) ? res.data.reports : [];

      const filteredReports = reports.filter(
        (report) => report.reportType === reportType
      );

      set({ previousReports: filteredReports });

      return {
        success: true,
        data: filteredReports
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load previous reports.";

      set({
        previousReports: [],
        previousReportsError: message
      });

      return {
        success: false,
        error: message
      };
    } finally {
      set({
        isPreviousReportsLoading: false
      });
    }
  },

  createReport: async (reportData) => {
    set({
      isCreatingReport: true
    });

    try {
      const res = await axiosInstance.post("/report", reportData);
      const newReport = res.data?.data ?? res.data;

      set((state) => ({
        previousReports: [newReport, ...state.previousReports]
      }));

      toast.success("Report successfully submitted to admin!");

      return {
        success: true,
        data: newReport
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create report";

      toast.error(message);

      return {
        success: false,
        error: message
      };
    } finally {
      set({
        isCreatingReport: false
      });
    }
  }
}));
