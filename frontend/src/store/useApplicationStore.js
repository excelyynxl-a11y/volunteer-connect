import { create } from "zustand";

const mockOrganisation = {
  _id: "organisation-mock-001",
  name: "Community Care Network",
};

const mockOpportunities = [
  {
    _id: "opportunity-mock-001",
    title: "Community Food Distribution",
    startAt: "2026-08-15T01:00:00.000Z",
    endAt: "2026-08-15T05:00:00.000Z",
    applicationDeadline: "2026-08-10T15:59:59.000Z",
    status: "active",
    organisationId: mockOrganisation,
  },
  {
    _id: "opportunity-mock-002",
    title: "Neighbourhood Clean-up",
    startAt: "2026-08-22T00:00:00.000Z",
    endAt: "2026-08-22T04:00:00.000Z",
    applicationDeadline: "2026-08-18T15:59:59.000Z",
    status: "active",
    organisationId: mockOrganisation,
  },
];

const mockVolunteer = {
  _id: "volunteer-mock-001",
  name: "Alex Volunteer",
  avatar: "",
  skills: ["Event Support", "Communication"],
  availability: [],
};

const mockApplications = [
  {
    _id: "application-mock-001",
    volunteerId: mockVolunteer,
    opportunityId: mockOpportunities[0],
    status: "pending",
    withdrawalReason: "",
    createdAt: "2026-07-10T03:00:00.000Z",
    updatedAt: "2026-07-10T03:00:00.000Z",
  },
  {
    _id: "application-mock-002",
    volunteerId: mockVolunteer,
    opportunityId: mockOpportunities[1],
    status: "approved",
    withdrawalReason: "",
    createdAt: "2026-07-08T03:00:00.000Z",
    updatedAt: "2026-07-09T03:00:00.000Z",
  },
];

const filterApplications = (applications, { status, opportunityId } = {}) =>
  applications.filter((application) => {
    const matchesStatus = !status || application.status === status;
    const matchesOpportunity =
      !opportunityId || application.opportunityId?._id === opportunityId;

    return matchesStatus && matchesOpportunity;
  });

const createListResponse = (applications) => ({
  success: true,
  count: applications.length,
  data: applications,
});

export const useApplicationStore = create((set, get) => ({
  applications: [],
  selectedApplication: null,
  isApplicationsLoading: false,
  isSubmittingApplication: false,
  isUpdatingApplication: false,
  applicationsError: "",

  getMyApplications: async ({ status } = {}) => {
    set({ isApplicationsLoading: true, applicationsError: "" });

    try {
      const filteredApplications = filterApplications(mockApplications, { status });
      const response = { data: createListResponse(filteredApplications) };
      // TODO(application-api): replace the mock response with:
      // const response = await axiosInstance.get("/application/me", { params: { status } });

      set({ applications: response.data.data });
      return response.data;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  getMyOrganisationApplications: async ({ status, opportunityId } = {}) => {
    set({ isApplicationsLoading: true, applicationsError: "" });

    try {
      const filteredApplications = filterApplications(mockApplications, {
        status,
        opportunityId,
      });
      const response = { data: createListResponse(filteredApplications) };
      // TODO(application-api): replace the mock response with:
      // const response = await axiosInstance.get("/application/organisation/me", {
      //   params: { status, opportunityId },
      // });

      set({ applications: response.data.data });
      return response.data;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  getApplicationById: async (applicationId) => {
    set({ isApplicationsLoading: true, applicationsError: "" });

    try {
      const application = mockApplications.find(
        (item) => item._id === applicationId,
      );
      const response = {
        data: {
          success: Boolean(application),
          data: application ?? null,
        },
      };
      // TODO(application-api): replace the mock response with:
      // const response = await axiosInstance.get(`/application/${applicationId}`);

      set({ selectedApplication: response.data.data });
      return response.data;
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  createApplication: async (opportunityId) => {
    set({ isSubmittingApplication: true, applicationsError: "" });

    try {
      const opportunity = mockOpportunities.find(
        (item) => item._id === opportunityId,
      );
      const application = {
        _id: `application-mock-${Date.now()}`,
        volunteerId: mockVolunteer,
        opportunityId: opportunity ?? { _id: opportunityId },
        status: "pending",
        withdrawalReason: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO(application-api): remove once createApplication created
      mockApplications.unshift(application);
      const response = {
        data: {
          success: true,
          message: "Application submitted successfully",
          data: application,
        },
      };
      // TODO(application-api): replace the mock response with:
      // const response = await axiosInstance.post("/application/create", { opportunityId });

      set((state) => ({ applications: [response.data.data, ...state.applications] }));
      return response.data;
    } finally {
      set({ isSubmittingApplication: false });
    }
  },

  approveApplication: async (applicationId) => {
    const response = await get().updateMockApplication(applicationId, "approved", {
      message: "Application approved successfully",
    });

    return {
      ...response,
      data: response.data
        ? { application: response.data, spotsRemaining: 3 }
        : null,
    };
  },

  rejectApplication: async (applicationId) => {
    return get().updateMockApplication(applicationId, "rejected", {
      message: "Application rejected successfully",
    });
  },

  withdrawApplication: async (applicationId, withdrawalReason) => {
    return get().updateMockApplication(applicationId, "withdrawn", {
      message: "Application withdrawn successfully",
      withdrawalReason,
    });
  },

  updateMockApplication: async (
    applicationId,
    status,
    { message, withdrawalReason = "" },
  ) => {
    set({ isUpdatingApplication: true, applicationsError: "" });

    try {
      const existingApplication = get().applications.find(
        (application) => application._id === applicationId,
      ) ?? mockApplications.find((application) => application._id === applicationId);
      const updatedApplication = existingApplication
        ? {
            ...existingApplication,
            status,
            withdrawalReason,
            updatedAt: new Date().toISOString(),
          }
        : null;
      const response = {
        data: {
          success: Boolean(updatedApplication),
          message,
          data: updatedApplication,
        },
      };
      // TODO(application-api): replace this shared mock update with the matching
      // approve, reject, or withdraw API request.

      if (updatedApplication) {
        set((state) => ({
          applications: state.applications.map((application) =>
            application._id === applicationId ? updatedApplication : application,
          ),
          selectedApplication:
            state.selectedApplication?._id === applicationId
              ? updatedApplication
              : state.selectedApplication,
        }));
      }

      return response.data;
    } finally {
      set({ isUpdatingApplication: false });
    }
  },
}));
