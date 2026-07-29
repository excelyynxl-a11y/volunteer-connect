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

export const useFollowStore = create((set) => ({
  followedOrganisations: [],
  followers: [],
  isFollowing: false,
  isFollowLoading: false,
  followError: "",

  getMyFollowedOrganisations: async () => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const response = { data: createListResponse(mockOrganisations) };
      // TODO(follow-api): replace the mock response with:
      // const response = await axiosInstance.get("/follow/me");

      set({ followedOrganisations: response.data.data });
      return response.data;
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
      const message =
        error.response?.data?.message || "Failed to load follow status.";

      set({ isFollowing: false, followError: message });
      return { success: false, message };
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

      set({ isFollowing: true });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to follow organisation.";

      set({ followError: message });
      return { success: false, message };
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

      set((state) => ({
        followedOrganisations: state.followedOrganisations.filter(
          (organisation) => organisation._id !== organisationId,
        ),
        isFollowing: false,
      }));
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to unfollow organisation.";

      set({ followError: message });
      return { success: false, message };
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
