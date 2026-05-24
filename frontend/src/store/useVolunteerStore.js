import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { formatDate } from "../lib/utils";
import { useAuthStore } from "./useAuthStore";

const getOpportunityDurationHours = (opportunity) => {
  if (!opportunity?.startAt || !opportunity?.endAt) return 0;

  const startAt = new Date(opportunity.startAt);
  const endAt = new Date(opportunity.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return 0;
  }

  return Math.max((endAt - startAt) / (1000 * 60 * 60), 0);
};

const mapVolunteerPastExperience = (experienceData = []) =>
  experienceData.map((activity, index) => {
    const opportunity = activity.opportunityId;
    const loggedHours = Number(
      activity.loggedHours ?? getOpportunityDurationHours(opportunity),
    );

    return {
      id: activity._id,
      title: opportunity?.title || `Completed Opportunity ${index + 1}`,
      organisation:
        opportunity?.organisationId?.name || "Organisation details unavailable",
      date: formatDate(opportunity?.endAt || activity.updatedAt || activity.createdAt),
      hours: `${loggedHours.toFixed(1)} hrs`,
      loggedHours,
      status: "Completed",
    };
  });

const calculateTotalVolunteerHours = (history) =>
  `${history
    .reduce((total, activity) => total + activity.loggedHours, 0)
    .toFixed(1)}h`;

const mockRecommendedOpportunities = [
  {
    _id: "mock-beach-cleanup",
    title: "Beach Cleanup",
    details: "Help clean the beach and protect the local environment.",
    location: "St Kilda Beach",
    startAt: "2026-06-01T08:00:00",
    endAt: "2026-06-01T12:00:00",
    status: "active",
    images: [],
  },
  {
    _id: "mock-food-bank-helper",
    title: "Food Bank Helper",
    details: "Support food packing and distribution for local families.",
    location: "Community Food Bank",
    startAt: "2026-06-03T10:00:00",
    endAt: "2026-06-03T14:00:00",
    status: "active",
    images: [],
  },
];

const mockScrollableOpportunities = [
  {
    _id: "mock-scroll-literacy-tutor",
    title: "Literacy Tutor",
    details: "Help primary school students practise reading and short writing exercises.",
    organisationId: { name: "Kids First Foundation" },
    location: "Selangor, Kajang",
    startAt: "2026-06-05T15:00:00",
    endAt: "2026-06-05T18:00:00",
    applicationDeadline: "2026-06-03T23:59:00",
    maxVolunteers: 12,
    approvedVolunteersCount: 4,
    category: ["Education"],
    requirements: "Patient with children\nBasic English reading skills",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-senior-care",
    title: "Senior Care Companion",
    details: "Spend time with seniors through conversation, games, and light activity support.",
    organisationId: { name: "Golden Years Centre" },
    location: "Kuala Lumpur, Setapak",
    startAt: "2026-06-06T10:00:00",
    endAt: "2026-06-06T13:00:00",
    applicationDeadline: "2026-06-04T23:59:00",
    maxVolunteers: 10,
    approvedVolunteersCount: 3,
    category: ["Elderly Care"],
    requirements: "Friendly communication\nComfortable assisting seniors",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-health-booth",
    title: "Community Health Booth",
    details: "Support registration and crowd flow at a neighbourhood health screening booth.",
    organisationId: { name: "Harbour Health Clinic" },
    location: "Kuala Lumpur, Sentul",
    startAt: "2026-06-07T09:00:00",
    endAt: "2026-06-07T14:00:00",
    applicationDeadline: "2026-06-05T23:59:00",
    maxVolunteers: 16,
    approvedVolunteersCount: 6,
    category: ["Health", "Event Support"],
    requirements: "Able to stand for several hours\nBasic Bahasa Malaysia or English",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-animal-care",
    title: "Animal Shelter Assistant",
    details: "Assist shelter staff with feeding routines, kennel cleaning, and enrichment activities.",
    organisationId: { name: "Paws & Claws KL" },
    location: "Kuala Lumpur, Setapak",
    startAt: "2026-06-08T09:00:00",
    endAt: "2026-06-08T13:00:00",
    applicationDeadline: "2026-06-06T23:59:00",
    maxVolunteers: 14,
    approvedVolunteersCount: 8,
    category: ["Animal Welfare"],
    requirements: "Comfortable around cats and dogs\nClosed-toe shoes required",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-tree-planting",
    title: "Tree Planting Crew",
    details: "Join a morning tree planting session and help prepare seedlings and planting spots.",
    organisationId: { name: "Green Earth Society" },
    location: "Selangor, Shah Alam",
    startAt: "2026-06-09T08:00:00",
    endAt: "2026-06-09T12:00:00",
    applicationDeadline: "2026-06-07T23:59:00",
    maxVolunteers: 25,
    approvedVolunteersCount: 11,
    category: ["Environment"],
    requirements: "Outdoor activity suitable attire\nBring a reusable water bottle",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-food-packing",
    title: "Food Packing Support",
    details: "Pack dry food items and label aid boxes for families receiving weekend support.",
    organisationId: { name: "Helping Hands Malaysia" },
    location: "Selangor, Cheras",
    startAt: "2026-06-10T10:00:00",
    endAt: "2026-06-10T15:00:00",
    applicationDeadline: "2026-06-08T23:59:00",
    maxVolunteers: 20,
    approvedVolunteersCount: 9,
    category: ["Community"],
    requirements: "Light lifting involved\nAble to follow packing checklist",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-fundraising",
    title: "Fundraising Booth Volunteer",
    details: "Help run a public booth, explain campaign goals, and record donation pledges.",
    organisationId: { name: "Youth Futures Foundation" },
    location: "Selangor, Subang Jaya",
    startAt: "2026-06-11T11:00:00",
    endAt: "2026-06-11T17:00:00",
    applicationDeadline: "2026-06-09T23:59:00",
    maxVolunteers: 18,
    approvedVolunteersCount: 5,
    category: ["Fundraising", "Event Support"],
    requirements: "Confident speaking to the public\nBasic campaign briefing provided",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-inclusive-sports",
    title: "Inclusive Sports Day Helper",
    details: "Support station setup, participant guidance, and game facilitation for an inclusive sports day.",
    organisationId: { name: "TogetherAbility" },
    location: "Selangor, Petaling Jaya",
    startAt: "2026-06-12T08:30:00",
    endAt: "2026-06-12T13:30:00",
    applicationDeadline: "2026-06-10T23:59:00",
    maxVolunteers: 22,
    approvedVolunteersCount: 10,
    category: ["Disability Support", "Event Support"],
    requirements: "Respectful participant support\nComfortable with outdoor games",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-recycling-drive",
    title: "Recycling Drive Sorter",
    details: "Sort recyclables, guide drop-off visitors, and track collection categories.",
    organisationId: { name: "Green Earth Society" },
    location: "Pulau Pinang, Butterworth",
    startAt: "2026-06-13T09:00:00",
    endAt: "2026-06-13T12:30:00",
    applicationDeadline: "2026-06-11T23:59:00",
    maxVolunteers: 15,
    approvedVolunteersCount: 7,
    category: ["Environment"],
    requirements: "Gloves provided\nAble to sort by material type",
    status: "active",
    images: [],
  },
  {
    _id: "mock-scroll-community-garden",
    title: "Community Garden Setup",
    details: "Prepare planting beds, arrange tools, and label seedlings for a neighbourhood garden.",
    organisationId: { name: "Semenyih Community Garden" },
    location: "Selangor, Semenyih",
    startAt: "2026-06-14T08:30:00",
    endAt: "2026-06-14T11:30:00",
    applicationDeadline: "2026-06-12T23:59:00",
    maxVolunteers: 15,
    approvedVolunteersCount: 6,
    category: ["Community", "Environment"],
    requirements: "Outdoor activity\nNo gardening experience required",
    status: "active",
    images: [],
  },
];

const mockVolunteerApplications = [
  {
    _id: "mock-application-community-garden",
    opportunityTitle: "Community Garden Setup",
    location: "Semenyih Community Garden",
    startAt: "2026-06-08T09:00:00",
    endAt: "2026-06-08T13:00:00",
    status: "approved",
  },
  {
    _id: "mock-application-food-bank",
    opportunityTitle: "Food Bank Helper",
    location: "Community Food Bank",
    startAt: "2026-06-03T10:00:00",
    endAt: "2026-06-03T14:00:00",
    status: "pending",
  },
  {
    _id: "mock-application-recycling",
    opportunityTitle: "Recycling Drive Sorter",
    location: "Butterworth Community Hall",
    startAt: "2026-06-13T09:00:00",
    endAt: "2026-06-13T12:30:00",
    status: "rejected",
  },
];

export const useVolunteerStore = create((set) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  volunteerId: "",
  participationHistory: [],
  totalVolunteerHours: "0.0h",
  isLoading: true,
  loadError: "",
  isUpdatingVolunteerProfile: false,
  opportunities: [],
  isOpportunitiesLoading: false,
  opportunitiesError: "",
  recommendedFallbackOpportunities: mockRecommendedOpportunities,
  volunteerApplications: [],
  isVolunteerApplicationsLoading: false,
  volunteerApplicationsError: "",

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  getVolunteerPastExperience: async (volunteerId) => {
    set({
      volunteerId,
      isLoading: true,
      loadError: "",
    });

    if (!volunteerId) {
      set({
        participationHistory: [],
        totalVolunteerHours: "0.0h",
        loadError: "Unable to load volunteer history because no volunteer ID is available.",
        isLoading: false,
      });
      return { success: false };
    }

    try {
      const response = await axiosInstance.get(
        `/volunteer/profile/${volunteerId}/past-experience`,
      );
      const history = mapVolunteerPastExperience(response.data?.data ?? []);

      set({
        participationHistory: history,
        totalVolunteerHours: calculateTotalVolunteerHours(history),
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load volunteer history.";

      set({
        participationHistory: [],
        totalVolunteerHours: "0.0h",
        loadError: message,
        isLoading: false,
      });

      return { success: false, error: message };
    }
  },

  getAllOpportunities: async () => {
    set({
      isOpportunitiesLoading: true,
      opportunitiesError: "",
    });

    try {
      const response = await axiosInstance.get("/opportunity");
      const opportunities = response.data?.data ?? [];
      const displayOpportunities =
        import.meta.env.MODE === "development"
          ? [...opportunities, ...mockScrollableOpportunities]
          : opportunities;

      set({
        opportunities: displayOpportunities,
        isOpportunitiesLoading: false,
      });

      return { success: true, opportunities: displayOpportunities };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load opportunities.";

      set({
        opportunities: [],
        opportunitiesError: message,
        isOpportunitiesLoading: false,
      });

      return { success: false, error: message };
    }
  },

  getVolunteerApplications: async (volunteerId) => {
    set({
      isVolunteerApplicationsLoading: true,
      volunteerApplicationsError: "",
    });

    if (!volunteerId) {
      set({
        volunteerApplications: [],
        isVolunteerApplicationsLoading: false,
        volunteerApplicationsError:
          "Unable to load applications because no volunteer ID is available.",
      });
      return { success: false };
    }

    const applications = mockVolunteerApplications;

    set({
      volunteerApplications: applications,
      isVolunteerApplicationsLoading: false,
    });

    return { success: true, applications };
  },

  updateVolunteerProfile: async (volunteerId, profilePayload) => {
    set({ isUpdatingVolunteerProfile: true });

    try {
      const hasAvatarFile =
        typeof File !== "undefined" && profilePayload?.avatar instanceof File;
      const requestPayload = hasAvatarFile ? new FormData() : profilePayload;

      if (hasAvatarFile) {
        requestPayload.append("fullName", profilePayload.fullName ?? "");
        requestPayload.append("ageGroup", profilePayload.ageGroup ?? "");
        requestPayload.append("biodata", profilePayload.biodata ?? "");
        requestPayload.append("skills", JSON.stringify(profilePayload.skills ?? []));
        requestPayload.append(
          "availability",
          JSON.stringify(profilePayload.availability ?? []),
        );
        requestPayload.append("profilePic", profilePayload.avatar);
      }

      const response = await axiosInstance.put(
        `/volunteer/profile/${volunteerId}`,
        requestPayload,
      );
      const updatedProfile = response.data?.data ?? {};

      useAuthStore.getState().setAuthUser(updatedProfile);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to save profile details.";

      return { success: false, error: message };
    } finally {
      set({ isUpdatingVolunteerProfile: false });
    }
  },
}));
