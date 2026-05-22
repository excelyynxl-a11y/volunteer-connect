import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { malaysiaStateCities } from "../lib/data";
import toast from 'react-hot-toast';

const mockStats = [
  { key: "volunteers", value: "69", label: "Active Volunteers" },
  { key: "organisations", value: "911", label: "Active Organisations" },
  { key: "opportunities", value: "69", label: "Active Opportunities" },
  { key: "reports", value: "911", label: "Open Reports" },
  {
    key: "volunteerswaitingapproval",
    value: "69",
    label: "Volunteer Waiting Approval",
  },
  {
    key: "organisationswaitingapproval",
    value: "911",
    label: "Organisations Waiting Approval",
  },
];

const mockAllVolunteers = [
  {
    _id: "v001",
    name: "Alice",
    email: "nguyen@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar:
      "https://res.cloudinary.com/dhs7msmxt/image/upload/v1778728165/avatars/avatar-1778728159642-836816936.png",
    role: "volunteer",
    ageGroup: "21-30",
    biodata: "Passionate about community service and education.",
    skills: ["Teaching", "Mentoring", "First Aid"],
    availability: [
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "13:00",
        preference: "preferred",
      },
      {
        dayOfWeek: "Wednesday",
        startTime: "09:00",
        endTime: "17:00",
        preference: "available",
      },
    ],
    resume: "",
    createdAt: "2025-10-01T08:00:00.000Z",
    updatedAt: "2025-11-15T10:30:00.000Z",
  },
  {
    _id: "v002",
    name: "Bob Tran",
    email: "bob.tran@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "volunteer",
    ageGroup: "31-40",
    biodata: "Software engineer looking to give back through tech workshops.",
    skills: ["JavaScript", "Python", "Web Development"],
    availability: [
      {
        dayOfWeek: "Saturday",
        startTime: "10:00",
        endTime: "16:00",
        preference: "preferred",
      },
    ],
    resume: "https://example.com/resumes/bob.pdf",
    createdAt: "2025-10-05T12:00:00.000Z",
    updatedAt: "2025-11-20T09:00:00.000Z",
  },
  {
    _id: "v003",
    name: "Clara Patel",
    email: "clara.patel@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "pending",
    avatar: "",
    role: "volunteer",
    ageGroup: "21-30",
    biodata: "Medical student eager to help at health outreach events.",
    skills: ["First Aid", "Health Education", "CPR"],
    availability: [
      {
        dayOfWeek: "Tuesday",
        startTime: "14:00",
        endTime: "18:00",
        preference: "available",
      },
      {
        dayOfWeek: "Thursday",
        startTime: "14:00",
        endTime: "18:00",
        preference: "available",
      },
    ],
    resume: "",
    createdAt: "2025-11-01T07:30:00.000Z",
    updatedAt: "2025-11-01T07:30:00.000Z",
  },
  {
    _id: "v004",
    name: "David Kim",
    email: "david.kim@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "volunteer",
    ageGroup: "41-50",
    biodata: "Retired teacher with a love for tutoring children.",
    skills: ["Tutoring", "Mathematics", "English"],
    availability: [
      {
        dayOfWeek: "Monday",
        startTime: "10:00",
        endTime: "12:00",
        preference: "available",
      },
      {
        dayOfWeek: "Wednesday",
        startTime: "10:00",
        endTime: "12:00",
        preference: "available",
      },
      {
        dayOfWeek: "Friday",
        startTime: "10:00",
        endTime: "12:00",
        preference: "preferred",
      },
    ],
    resume: "",
    createdAt: "2025-09-20T15:00:00.000Z",
    updatedAt: "2025-10-10T11:00:00.000Z",
  },
  {
    _id: "v005",
    name: "Elena Rossi",
    email: "elena.rossi@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "rejected",
    avatar: "",
    role: "volunteer",
    ageGroup: "21-30",
    biodata: "Graphic designer interested in event promotion.",
    skills: ["Graphic Design", "Social Media", "Photography"],
    availability: [
      {
        dayOfWeek: "Saturday",
        startTime: "09:00",
        endTime: "15:00",
        preference: "available",
      },
    ],
    resume: "",
    createdAt: "2025-10-12T09:00:00.000Z",
    updatedAt: "2025-10-25T16:00:00.000Z",
  },
  {
    _id: "v006",
    name: "Frank Okonkwo",
    email: "frank.okonkwo@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "volunteer",
    ageGroup: "31-40",
    biodata: "Chef who loves organising community kitchens.",
    skills: ["Cooking", "Event Planning", "Team Leadership"],
    availability: [
      {
        dayOfWeek: "Sunday",
        startTime: "08:00",
        endTime: "14:00",
        preference: "preferred",
      },
    ],
    resume: "https://example.com/resumes/frank.pdf",
    createdAt: "2025-08-15T06:00:00.000Z",
    updatedAt: "2025-09-01T12:00:00.000Z",
  },
  {
    _id: "v007",
    name: "Grace Liu",
    email: "grace.liu@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "pending",
    avatar: "",
    role: "volunteer",
    ageGroup: "51-60",
    biodata:
      "Former accountant wanting to assist with financial literacy programs.",
    skills: ["Accounting", "Financial Literacy", "Mentoring"],
    availability: [
      {
        dayOfWeek: "Tuesday",
        startTime: "10:00",
        endTime: "16:00",
        preference: "available",
      },
      {
        dayOfWeek: "Thursday",
        startTime: "10:00",
        endTime: "16:00",
        preference: "available",
      },
    ],
    resume: "",
    createdAt: "2025-11-10T13:00:00.000Z",
    updatedAt: "2025-11-10T13:00:00.000Z",
  },
];

const mockAllOrganisation = [
  {
    _id: "o001",
    name: "Sunshine Community Centre",
    email: "info@sunshinecc.org",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "organisation",
    biodata:
      "A community centre dedicated to providing free educational programs and social activities for local residents.",
    createdAt: "2025-07-01T08:00:00.000Z",
    updatedAt: "2025-10-20T14:00:00.000Z",
  },
  {
    _id: "o002",
    name: "Green Earth Initiative",
    email: "contact@greenearth.org",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "organisation",
    biodata:
      "Environmental non-profit focused on tree planting and sustainability workshops.",
    createdAt: "2025-08-05T10:00:00.000Z",
    updatedAt: "2025-11-01T09:30:00.000Z",
  },
  {
    _id: "o003",
    name: "Helping Hands Food Bank",
    email: "admin@helpinghands.org",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "organisation",
    biodata:
      "Operates food distribution centres across the city to support families in need.",
    createdAt: "2025-06-15T07:00:00.000Z",
    updatedAt: "2025-09-12T11:00:00.000Z",
  },
  {
    _id: "o004",
    name: "Youth Futures Foundation",
    email: "hello@youthfutures.org",
    password: "$2a$10$hidden",
    approvalStatus: "pending",
    avatar: "",
    role: "organisation",
    biodata: "Provides mentorship and career guidance for at-risk youth.",
    createdAt: "2025-10-01T12:00:00.000Z",
    updatedAt: "2025-10-01T12:00:00.000Z",
  },
  {
    _id: "o005",
    name: "Paws & Claws Animal Shelter",
    email: "adopt@pawsclaws.org",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "organisation",
    biodata:
      "No-kill animal shelter offering adoption services and volunteer opportunities.",
    createdAt: "2025-05-20T08:30:00.000Z",
    updatedAt: "2025-11-05T16:00:00.000Z",
  },
  {
    _id: "o006",
    name: "TechBridge Collective",
    email: "info@techbridge.org",
    password: "$2a$10$hidden",
    approvalStatus: "rejected",
    avatar: "",
    role: "organisation",
    biodata:
      "Offers free coding bootcamps and digital literacy classes for underserved communities.",
    createdAt: "2025-09-10T09:00:00.000Z",
    updatedAt: "2025-09-25T10:00:00.000Z",
  },
  {
    _id: "o007",
    name: "Harbour Health Clinic",
    email: "volunteer@harbourhealth.org",
    password: "$2a$10$hidden",
    approvalStatus: "pending",
    avatar: "",
    role: "organisation",
    biodata:
      "Free health clinic providing basic medical care and health education to the community.",
    createdAt: "2025-10-18T11:00:00.000Z",
    updatedAt: "2025-10-18T11:00:00.000Z",
  },
];

const locationFrom = (state, city) => {
  const stateCities = malaysiaStateCities[state] || [];
  const resolvedCity = stateCities.includes(city)
    ? city
    : stateCities[0] || city;

  return `${state}, ${resolvedCity}`;
};

const mockAllOpportunities = [
  {
    _id: "opp001",
    title: "Community Garden Build Day",
    details:
      "Join our volunteers to build raised beds, plant seedlings, and set up irrigation for the new community garden.",
    organisationId: "o002",
    images: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    ],
    location: locationFrom("Selangor", "Shah Alam"),
    startAt: "2026-06-15T09:00:00.000Z",
    endAt: "2026-06-15T15:00:00.000Z",
    applicationDeadline: "2026-06-08T23:59:00.000Z",
    maxVolunteers: 25,
    approvedVolunteersCount: 12,
    category: ["Environment", "Community"],
    requirements: "Closed-toe shoes, sun protection, and water bottle.",
    status: "active",
    publishedAt: "2026-05-20T08:00:00.000Z",
    createdAt: "2026-05-20T08:00:00.000Z",
    updatedAt: "2026-05-21T09:15:00.000Z",
  },
  {
    _id: "opp002",
    title: "After-School Math Mentors",
    details:
      "Support local students with weekly math mentoring sessions and homework assistance.",
    organisationId: "o001",
    images: [],
    location: locationFrom("Wp Kuala Lumpur", "Kuala Lumpur"),
    startAt: "2026-07-06T06:00:00.000Z",
    endAt: "2026-07-06T08:00:00.000Z",
    applicationDeadline: "2026-06-25T23:59:00.000Z",
    maxVolunteers: 10,
    approvedVolunteersCount: 7,
    category: ["Education"],
    requirements:
      "Working with children check preferred. Confidence in basic algebra.",
    status: "active",
    publishedAt: "2026-05-05T05:30:00.000Z",
    createdAt: "2026-05-05T05:30:00.000Z",
    updatedAt: "2026-05-18T12:00:00.000Z",
  },
  {
    _id: "opp003",
    title: "Food Bank Warehouse Sorting",
    details:
      "Help us sort incoming pantry donations and pack family meal kits.",
    organisationId: "o003",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
    ],
    location: locationFrom("Johor", "Johor Bahru"),
    startAt: "2026-04-10T02:00:00.000Z",
    endAt: "2026-04-10T07:00:00.000Z",
    applicationDeadline: "2026-04-03T23:59:00.000Z",
    maxVolunteers: 18,
    approvedVolunteersCount: 18,
    category: ["Community"],
    requirements: "Comfortable lifting up to 10kg and closed-toe shoes.",
    status: "completed",
    publishedAt: "2026-03-15T04:00:00.000Z",
    createdAt: "2026-03-15T04:00:00.000Z",
    updatedAt: "2026-04-11T09:00:00.000Z",
  },
  {
    _id: "opp004",
    title: "Animal Shelter Enrichment Day",
    details:
      "Spend a day socializing shelter animals and preparing enrichment activities.",
    organisationId: "o005",
    images: [],
    location: locationFrom("Pulau Pinang", "Bayan Lepas"),
    startAt: "2026-05-30T00:30:00.000Z",
    endAt: "2026-05-30T04:30:00.000Z",
    applicationDeadline: "2026-05-20T23:59:00.000Z",
    maxVolunteers: 12,
    approvedVolunteersCount: 9,
    category: ["Animal Welfare"],
    requirements: "Comfortable handling animals. Closed-toe shoes required.",
    status: "closed",
    publishedAt: "2026-04-22T06:00:00.000Z",
    createdAt: "2026-04-22T06:00:00.000Z",
    updatedAt: "2026-05-21T08:10:00.000Z",
  },
  {
    _id: "opp005",
    title: "TechBridge Intro to Coding",
    details:
      "Assist instructors with a one-day coding workshop for adult learners.",
    organisationId: "o006",
    images: [],
    location: locationFrom("Sabah", "Kota Kinabalu"),
    startAt: "2026-06-22T01:00:00.000Z",
    endAt: "2026-06-22T07:00:00.000Z",
    applicationDeadline: "2026-06-10T23:59:00.000Z",
    maxVolunteers: 8,
    approvedVolunteersCount: 2,
    category: ["Education", "Community"],
    requirements: "Comfortable with basic web development concepts.",
    status: "cancelled",
    publishedAt: "2026-05-10T05:00:00.000Z",
    createdAt: "2026-05-10T05:00:00.000Z",
    updatedAt: "2026-05-25T10:30:00.000Z",
  },
  {
    _id: "opp006",
    title: "Harbour Health Outreach",
    details:
      "Support clinic staff with check-ins, patient guidance, and health education materials.",
    organisationId: "o007",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    ],
    location: locationFrom("Sarawak", "Kuching"),
    startAt: "2026-06-05T22:30:00.000Z",
    endAt: "2026-06-06T04:30:00.000Z",
    applicationDeadline: "2026-05-28T23:59:00.000Z",
    maxVolunteers: 15,
    approvedVolunteersCount: 6,
    category: ["Health", "Community"],
    requirements: "Friendly communication and comfort assisting patients.",
    status: "active",
    publishedAt: "2026-05-14T07:30:00.000Z",
    createdAt: "2026-05-14T07:30:00.000Z",
    updatedAt: "2026-05-21T11:45:00.000Z",
  },
];

export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,
  isUsersLoading: false,
  isOpportunitiesLoading: false,
  organisations: [],
  volunteers: [],
  opportunities: [],
  reports: [],

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  getStats: () => {
    // TODO: call GET to retrived getAllVolunteer, getAllOrg, getAllOpportunities, getAllReport to get their counts
    return mockStats;
  },

  getAllOrganisations: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/organisations');
        set({ organisations: res.data.organisations });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }

  },

  getAllVolunteers: async () => {
    set({ isUsersLoading: true });
    
    try {
        const res = await axiosInstance.get('/user/volunteers');
        set({ volunteers: res.data.volunteers });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isUsersLoading: false });
    }
  },

  rejectUserAccount: async (userId, onClose) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/reject`);
      toast.success('User account rejected!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  approveUserAccount: async (userId, onClose) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/approve`);
      toast.success('User account approved!');
      await Promise.all(
        [
          get().getAllOrganisations(), 
          get().getAllVolunteers()
        ]
      );
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  getAllOpportunities: async () => {
    set({ isOpportunitiesLoading: true });
    
    try {
        const res = await axiosInstance.get('/opportunity/');
        set({ opportunities: res.data.data });
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isOpportunitiesLoading: false });
    }

  },

  getAllReports: () => {
    // TODO: call getAllReports
  },

  updateAdminProfile: async ({ name, avatar }) => {
    try {
      set({ isUpdating: true });

      // TODO: integrate updateAdminProfile api
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      set({
        isUpdating: false,
      });
    }
  },

}));
