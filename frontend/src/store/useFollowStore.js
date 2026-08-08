import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const getFollowErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

export const useFollowStore = create((set, get) => ({
  followedOrganisations: [],
  followers: [],
  isFollowing: false,
  isFollowLoading: false,
  isFollowedOrganisationsLoading: false,
  followMutationOrganisationId: null,
  followError: "",
  followersError: "",

  getMyFollowedOrganisations: async () => {
    set({ isFollowedOrganisationsLoading: true, followError: "" });

    try {
      const response = await axiosInstance.get("/follow/me");
      const organisations = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      set({ followedOrganisations: organisations });
      return response.data;
    } catch (error) {
      const message = getFollowErrorMessage(
        error,
        "Failed to load followed organisations.",
      );
      set({
        followedOrganisations: [],
        followError: message,
      });
      return { success: false, error: message };
    } finally {
      set({ isFollowedOrganisationsLoading: false });
    }
  },

  getFollowStatus: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const response = await axiosInstance.get(
        `/follow/organisations/${organisationId}/status`,
      );
      set({ isFollowing: Boolean(response.data?.data?.isFollowing) });
      return response.data;
    } catch (error) {
      const message = getFollowErrorMessage(
        error,
        "Failed to check follow status.",
      );
      set({
        isFollowing: false,
        followError: message,
      });
      return { success: false, error: message };
    } finally {
      set({ isFollowLoading: false });
    }
  },

  followOrganisation: async (organisationId) => {
    set({
      isFollowLoading: true,
      followMutationOrganisationId: organisationId,
      followError: "",
    });

    try {
      const response = await axiosInstance.post(
        `/follow/organisations/${organisationId}`,
      );
      set({ isFollowing: true });

      const refreshResult = await get().getMyFollowedOrganisations();

      if (refreshResult?.success === false) {
        return refreshResult;
      }

      return response.data;
    } catch (error) {
      const message = getFollowErrorMessage(
        error,
        "Failed to follow organisation.",
      );
      set({ followError: message });
      return { success: false, error: message };
    } finally {
      set({ isFollowLoading: false, followMutationOrganisationId: null });
    }
  },

  unfollowOrganisation: async (organisationId) => {
    set({
      isFollowLoading: true,
      followMutationOrganisationId: organisationId,
      followError: "",
    });

    try {
      const response = await axiosInstance.delete(
        `/follow/organisations/${organisationId}`,
      );
      set({ isFollowing: false });

      const refreshResult = await get().getMyFollowedOrganisations();

      if (refreshResult?.success === false) {
        return refreshResult;
      }

      return response.data;
    } catch (error) {
      const message = getFollowErrorMessage(
        error,
        "Failed to unfollow organisation.",
      );
      set({ followError: message });
      return { success: false, error: message };
    } finally {
      set({ isFollowLoading: false, followMutationOrganisationId: null });
    }
  },

  getOrganisationFollowers: async (organisationId) => {
    set({ isFollowLoading: true, followersError: "" });

    try {
      const response = await axiosInstance.get(
        `/follow/organisations/${organisationId}/followers`,
      );
      const followers = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      set({ followers });
      return response.data;
    } catch (error) {
      const message = getFollowErrorMessage(
        error,
        "Failed to load organisation followers.",
      );
      set({ followers: [], followersError: message });
      return { success: false, error: message };
    } finally {
      set({ isFollowLoading: false });
    }
  },
}));
