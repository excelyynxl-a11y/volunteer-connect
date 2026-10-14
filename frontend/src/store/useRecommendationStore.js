
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useRecommendationStore = create((set) => ({
  recommendations: [],
  insight: "",
  recommendationStatus: "",
  isLoading: false,
  error: "",

  getRecommendations: async () => {
    set({
      isLoading: true,
      error: "",
    });

    try {
      const response = await axiosInstance.post(
        "/recommendations/opportunities"
      );

      const result = response.data;

      set({
        recommendations: result.opportunities ?? [],
        insight: result.explanation ?? "",
        recommendationStatus: result.status ?? "",
      });

      return result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load AI recommendations.";

      set({
        recommendations: [],
        insight: "",
        recommendationStatus: "",
        error: message,
      });

      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
