import { create } from "zustand";

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
      const isFollowing = get().followedOrganisations.some(
        (organisation) => organisation._id === organisationId,
      );
      const response = {
        data: {
          success: true,
          data: { isFollowing },
        },
      };
      // TODO(follow-api): replace the mock response with:
      // const response = await axiosInstance.get(
      //   `/follow/organisations/${organisationId}/status`,
      // );

      set({ isFollowing: response.data.data.isFollowing });
      return response.data;
    } finally {
      set({ isFollowLoading: false });
    }
  },

  followOrganisation: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const organisation = mockOrganisations.find(
        (item) => item._id === organisationId,
      ) ?? {
        _id: organisationId,
        name: "Organisation",
        avatar: "",
        biodata: "",
      };
      const response = {
        data: {
          success: true,
          message: "Organisation followed successfully",
          data: {
            _id: `follow-mock-${Date.now()}`,
            volunteerId: "volunteer-mock-001",
            organisationId,
            createdAt: new Date().toISOString(),
          },
        },
      };
      // TODO(follow-api): replace the mock response with:
      // const response = await axiosInstance.post(
      //   `/follow/organisations/${organisationId}`,
      // );

      set((state) => ({
        followedOrganisations: state.followedOrganisations.some(
          (item) => item._id === organisationId,
        )
          ? state.followedOrganisations
          : [organisation, ...state.followedOrganisations],
        isFollowing: true,
      }));
      return response.data;
    } finally {
      set({ isFollowLoading: false });
    }
  },

  unfollowOrganisation: async (organisationId) => {
    set({ isFollowLoading: true, followError: "" });

    try {
      const response = {
        data: {
          success: true,
          message: "Organisation unfollowed successfully",
        },
      };
      // TODO(follow-api): replace the mock response with:
      // const response = await axiosInstance.delete(
      //   `/follow/organisations/${organisationId}`,
      // );

      set((state) => ({
        followedOrganisations: state.followedOrganisations.filter(
          (organisation) => organisation._id !== organisationId,
        ),
        isFollowing: false,
      }));
      return response.data;
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
