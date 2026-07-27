import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const mockOrganisations = [
  {
    _id: "organisation-mock-001",
    name: "Community Care Network",
    avatar: "",
    biodata: "Supporting local families through practical community programmes.",
  },
  {
    _id: "organisation-mock-002",
    name: "Green Neighbourhood Initiative",
    avatar: "",
    biodata: "Bringing volunteers together for cleaner and greener communities.",
  },
];

const mockFollowers = [
  {
    _id: "volunteer-mock-001",
    name: "Alex Volunteer",
    avatar: "",
  },
  {
    _id: "volunteer-mock-002",
    name: "Jamie Helper",
    avatar: "",
  },
];

const createListResponse = (items) => ({
  success: true,
  count: items.length,
  data: items,
});

const getFollowErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

export const useFollowStore = create((set, get) => ({
  followedOrganisations: [],
  followers: [],
  isFollowing: false,
  isFollowLoading: false,
  followError: "",

  getMyFollowedOrganisations: async () => {
    set({ isFollowLoading: true, followError: "" });

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
      set({ isFollowLoading: false });
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
    set({ isFollowLoading: true, followError: "" });

    try {
      const response = await axiosInstance.post(
        `/follow/organisations/${organisationId}`,
      );
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
      set({ isFollowLoading: false });
    }
  },

  unfollowOrganisation: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const response = await axiosInstance.delete(
        `/follow/organisations/${organisationId}`,
      );
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
      set({ isFollowLoading: false });
    }
  },

  getOrganisationFollowers: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const organisationFollowers =
        organisationId === mockOrganisations[0]._id ? mockFollowers : [];
      const response = {
        data: {
          ...createListResponse(organisationFollowers),
          meta: { nextCursor: null },
        },
      };
      // TODO(follow-api): replace the mock response with:
      // const response = await axiosInstance.get(
      //   `/follow/organisations/${organisationId}/followers`,
      // );

      set({ followers: response.data.data });
      return response.data;
    } finally {
      set({ isFollowLoading: false });
    }
  },
}));
