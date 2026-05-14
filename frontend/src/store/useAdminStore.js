import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const mockStats = [
  { key: "volunteers", value: "69", label: "Active Volunteers" },
  { key: "organisations", value: "911", label: "Active Organisations" },
  { key: "opportunities", value: "69", label: "Active Opportunities" },
  { key: "reports", value: "911", label: "Open Reports" },
  { key: "volunteerswaitingapproval", value: "69", label: "Volunteer Waiting Approval" },
  { key: "organisationswaitingapproval", value: "911", label: "Organisations Waiting Approval" },
];

const mockAllVolunteers = [
  {
    _id: "v001",
    name: "Alice",
    email: "nguyen@example.com",
    password: "$2a$10$hidden",
    approvalStatus: "approved",
    avatar: "",
    role: "volunteer",
    ageGroup: "21-30",
    biodata: "Passionate about community service and education.",
    skills: ["Teaching", "Mentoring", "First Aid"],
    availability: [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "13:00", preference: "preferred" },
      { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00", preference: "available" },
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
      { dayOfWeek: "Saturday", startTime: "10:00", endTime: "16:00", preference: "preferred" },
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
      { dayOfWeek: "Tuesday", startTime: "14:00", endTime: "18:00", preference: "available" },
      { dayOfWeek: "Thursday", startTime: "14:00", endTime: "18:00", preference: "available" },
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
      { dayOfWeek: "Monday", startTime: "10:00", endTime: "12:00", preference: "available" },
      { dayOfWeek: "Wednesday", startTime: "10:00", endTime: "12:00", preference: "available" },
      { dayOfWeek: "Friday", startTime: "10:00", endTime: "12:00", preference: "preferred" },
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
      { dayOfWeek: "Saturday", startTime: "09:00", endTime: "15:00", preference: "available" },
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
      { dayOfWeek: "Sunday", startTime: "08:00", endTime: "14:00", preference: "preferred" },
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
    biodata: "Former accountant wanting to assist with financial literacy programs.",
    skills: ["Accounting", "Financial Literacy", "Mentoring"],
    availability: [
      { dayOfWeek: "Tuesday", startTime: "10:00", endTime: "16:00", preference: "available" },
      { dayOfWeek: "Thursday", startTime: "10:00", endTime: "16:00", preference: "available" },
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
    biodata: "A community centre dedicated to providing free educational programs and social activities for local residents.",
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
    biodata: "Environmental non-profit focused on tree planting and sustainability workshops.",
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
    biodata: "Operates food distribution centres across the city to support families in need.",
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
    biodata: "No-kill animal shelter offering adoption services and volunteer opportunities.",
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
    biodata: "Offers free coding bootcamps and digital literacy classes for underserved communities.",
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
    biodata: "Free health clinic providing basic medical care and health education to the community.",
    createdAt: "2025-10-18T11:00:00.000Z",
    updatedAt: "2025-10-18T11:00:00.000Z",
  },
];

const mockAllOpportunites = [

];


export const useAdminStore = create((set, get) => ({
  currentTab: "homepage",
  sidebarCollapsed: false,
  isUpdating: false,

  setCurrentTab: (tab) => set({ currentTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  getStats: () => {
    // TODO: call GET to retrived getAllVolunteer, getAllOrg, getAllOpportunities, getAllReport to get their counts
    return mockStats;
  },

  getAllOrganisations: () => {
    // TODO: call getAllOrganisations
    return mockAllOrganisation;
  },

  getAllVolunteers: () => {
    // TODO: call getAllVolunteers
    return mockAllVolunteers;
  },

  rejectUserAccount: (userId) => {
    // TODO: call rejectUserAccount

  },

  approveUserAccount: (userId) => {
    // TODO: call approveUserAccount 

  },

  getAllOpportunities: () => {
    // TODO: call getAllOpportunities

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
        error: message 
      };
    } finally {
      set({ 
        isUpdating: false 
      });
    }
  },

}));
