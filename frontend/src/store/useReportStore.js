import toast from "react-hot-toast";

export const useReportStore = create((set, get) => ({
    previousReports: [],
    isPreviousReportsLoading: false,
    isCreatingReport: false,
    previousReportsError: "",
    userId: "",

    getPreviousReports: async (userId) => {

        // TODO: get all previous report made by this user

        set({ 
            isPreviousReportsLoading: true, 
            previousReportsError: "" 
        });

        try {
        
        } catch (error) {

            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to load previous reports made.";

            set({
                previousReports: [],
                statsError: message,
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