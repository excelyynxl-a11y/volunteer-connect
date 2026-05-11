import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
        } catch (error) {
            console.error("Error in checkAuth: ", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully.");
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
            return { success: false, error: message };
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        // TODO: login api call

    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully.');
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        }
    }

}))