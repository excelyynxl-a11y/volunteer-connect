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

export const useFollowStore = create((set, get) => ({
  followedOrganisations: [],
  followers: [],
  isFollowing: false,
  isFollowLoading: false,
  followError: "",

  getMyFollowedOrganisations: async () => {
    set({ isFollowLoading: true, followError: "" });

    try {
      try {
        const response = await axiosInstance.get("/follow/me");
        const organisations = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        set({ followedOrganisations: organisations });
        return response.data;
      } catch (err) {
        // fallback to mock data when backend is unavailable
        const response = { data: createListResponse(mockOrganisations) };
        set({ followedOrganisations: response.data.data });
        return response.data;
      }
    } finally {
      set({ isFollowLoading: false });
    }
  },

  getFollowStatus: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      try {
        const res = await axiosInstance.get(
          `/follow/organisations/${organisationId}/status`,
        );
        set({ isFollowing: res.data?.data?.isFollowing });
        return res.data;
      } catch (err) {
        const isFollowing = get().followedOrganisations.some(
          (organisation) => organisation._id === organisationId,
        );
        const response = {
          data: { success: true, data: { isFollowing } },
        };
        set({ isFollowing: response.data.data.isFollowing });
        return response.data;
      }
    } finally {
      set({ isFollowLoading: false });
    }
  },

  followOrganisation: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      try {
        const res = await axiosInstance.post(
          `/follow/organisations/${organisationId}`,
        );
        // on success, refresh list
        await get().getMyFollowedOrganisations();
        return res.data;
      } catch (err) {
        // fallback: update local mock list
        const organisation = mockOrganisations.find(
          (item) => item._id === organisationId,
        ) ?? { _id: organisationId, name: "Organisation", avatar: "", biodata: "" };
        set((state) => ({
          followedOrganisations: state.followedOrganisations.some(
            (item) => item._id === organisationId,
          )
            ? state.followedOrganisations
            : [organisation, ...state.followedOrganisations],
          isFollowing: true,
        }));
        return { success: true };
      }
    } finally {
      set({ isFollowLoading: false });
    }
  },

  unfollowOrganisation: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      try {
        const res = await axiosInstance.delete(
          `/follow/organisations/${organisationId}`,
        );
        // refresh list
        await get().getMyFollowedOrganisations();
        return res.data;
      } catch (err) {
        // fallback to local update
        set((state) => ({
          followedOrganisations: state.followedOrganisations.filter(
            (organisation) => organisation._id !== organisationId,
          ),
          isFollowing: false,
        }));
        return { success: true };
      }
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
