import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

// TODO: remove after backend integration
// mock previous reports (no backend integration yet)
const mockPreviousReports = [
  {
    _id: "mock-1",
    opportunityViolationType: "Harassment and Discrimination",
    title: "Unacceptable behaviour from event coordinator",
    details:
      "During the community cleanup event on 22 July, the coordinator made repeated dismissive comments directed at volunteers. Several volunteers expressed discomfort. I am reporting this so appropriate action can be taken to ensure a safe environment for all participants.",
    status: "Pending",
    createdAt: "2025-07-22T10:30:00Z",
  },
  {
    _id: "mock-2",
    opportunityViolationType: "Disorganized Schedules",
    title: "Event started two hours late with no notice",
    details:
      "The tree-planting drive was scheduled to begin at 9:00 AM but did not start until 11:15 AM. No prior communication was sent to volunteers, many of whom had rearranged their day to attend. This lack of coordination reflects poorly on the organisation and wastes volunteer time.",
    status: "Investigating",
    createdAt: "2025-07-10T14:15:00Z",
  },
  {
    _id: "mock-3",
    opportunityViolationType: "Hazardous Environment",
    title: "Missing safety equipment at construction site",
    details:
      "Volunteers at the building renovation project were not provided with hard hats or safety goggles despite working in an active construction area. I raised the concern on-site but was told to continue. This is a serious health and safety breach that needs to be addressed.",
    status: "Resolved",
    createdAt: "2025-06-28T09:00:00Z",
  },
];

export const useReportStore = create((set, get) => ({
    previousReports: [],
    isPreviousReportsLoading: false,
    isCreatingReport: false,
    previousReportsError: "",
    userId: "",

    getPreviousReports: async (userId) => {

        // TODO: integrate backend to get all previous report made by this user
        set({ 
            isPreviousReportsLoading: true, 
            previousReportsError: "" 
        });

        try {
            set({ previousReports: mockPreviousReports });

            return {
                success: true,
                data: mockPreviousReports,
            };
        } catch (error) {

            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load previous reports made.";

            set({
                previousReports: [],
                previousReportsError: message,
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

        // TODO: integrate with backend to create new reports
        try {
            const res = await axiosInstance.post("/report/create", reportData);
            const newReport = res.data?.data ?? res.data;
        
            set((state) => ({
                previousReports: [newReport, ...state.previousReports],
            }));

            toast.success("Report succesfully submitted to admin!");

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
    },

}))