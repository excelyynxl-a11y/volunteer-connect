import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  setAuthUser: (user) => set({ authUser: user }),
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error in checkAuth: ", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({
        authUser: res.data.approvalStatus === "approved" ? res.data : null,
      });
      toast.success("Account created successfully.");
      return {
        success: true,
        role: res.data.role,
        approvalStatus: res.data.approvalStatus,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully.");
      return {
        success: true,
        role: res.data.role,
        approvalStatus: res.data.approvalStatus,
      };
    } catch (error) {
      const approvalStatus = error.response?.data?.approvalStatus;
      const role = error.response?.data?.role;
      if (approvalStatus) {
        return { success: false, approvalStatus, role };
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }
  },
}));
