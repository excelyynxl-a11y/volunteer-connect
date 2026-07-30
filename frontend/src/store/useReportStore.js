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
    status: "Pending",
    createdAt: "2025-07-22T10:30:00Z",
  },
  {
    _id: "mock-2",
    opportunityViolationType: "Disorganized Schedules",
    title: "Event started two hours late with no notice",
    status: "Investigating",
    createdAt: "2025-07-10T14:15:00Z",
  },
  {
    _id: "mock-3",
    opportunityViolationType: "Hazardous Environment",
    title: "Missing safety equipment at construction site",
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