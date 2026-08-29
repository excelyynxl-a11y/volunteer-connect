import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const handlers = {};
  const handler = (name) => {
    const fn = vi.fn((_req, res) => res.status(200).json({ handler: name }));
    handlers[name] = fn;
    return fn;
  };

  const authUser = (req, res, next) => {
    const role = req.get("x-test-role");
    if (!role) {
      return res.status(401).json({ message: "Unauthorised - No Token Provided." });
    }

    req.user = { _id: `${role}-id`, role, approvalStatus: "approved" };
    return next();
  };

  const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    return next();
  };

  const allowRoles = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`,
      });
    }

    return next();
  };

  const passUpload = (req, _res, next) => next();

  return {
    handlers,
    auth: { protectRoute: authUser, adminOnly, allowRoles },
    uploads: {
      uploadAvatar: passUpload,
      uploadMessageAttachment: passUpload,
      uploadResume: passUpload,
      validateMessageAttachmentSignature: passUpload,
    },
    controllers: {
      admin: {
        approveUserAccount: handler("approveUserAccount"),
        rejectUserAccount: handler("rejectUserAccount"),
        updateAdminProfile: handler("updateAdminProfile"),
      },
      analytics: {
        getVolunteerSignUpAnalytics: handler("getVolunteerSignUpAnalytics"),
        getOrganisationSignUpAnalytics: handler("getOrganisationSignUpAnalytics"),
        getOpportunityCreatedAnalytics: handler("getOpportunityCreatedAnalytics"),
        getReportAnalytics: handler("getReportAnalytics"),
      },
      application: {
        approveApplication: handler("approveApplication"),
        createApplication: handler("createApplication"),
        deleteApplication: handler("deleteApplication"),
        getAllApplications: handler("getAllApplications"),
        getApplicationById: handler("getApplicationById"),
        getMyApplications: handler("getMyApplications"),
        getMyOrganisationApplications: handler("getMyOrganisationApplications"),
        rejectApplication: handler("rejectApplication"),
        withdrawApplication: handler("withdrawApplication"),
      },
      auth: {
        checkAuth: handler("checkAuth"),
        getMe: handler("getMe"),
        login: handler("login"),
        logout: handler("logout"),
        signup: handler("signup"),
      },
      follow: {
        followOrganisation: handler("followOrganisation"),
        getFollowStatus: handler("getFollowStatus"),
        getMyFollowedOrganisations: handler("getMyFollowedOrganisations"),
        getOrganisationFollowers: handler("getOrganisationFollowers"),
        unfollowOrganisation: handler("unfollowOrganisation"),
      },
      message: {
        downloadMessageAttachment: handler("downloadMessageAttachment"),
        endConversation: handler("endConversation"),
        getConversationMessages: handler("getConversationMessages"),
        getMyConversations: handler("getMyConversations"),
        initiateConversation: handler("initiateConversation"),
        markConversationAsRead: handler("markConversationAsRead"),
        sendMessage: handler("sendMessage"),
      },
      opportunity: {
        createOpportunity: handler("createOpportunity"),
        deleteOpportunity: handler("deleteOpportunity"),
        getAllOpportunities: handler("getAllOpportunities"),
        getOpportunityById: handler("getOpportunityById"),
        getOrganisationOpportunities: handler("getOrganisationOpportunities"),
        updateOpportunity: handler("updateOpportunity"),
      },
      organisation: {
        getOrgProfile: handler("getOrgProfile"),
        updateOrgProfile: handler("updateOrgProfile"),
      },
      report: {
        createReport: handler("createReport"),
        deleteReport: handler("deleteReport"),
        getAllReports: handler("getAllReports"),
        getMyReports: handler("getMyReports"),
        getReportById: handler("getReportById"),
        updateReportStatus: handler("updateReportStatus"),
      },
      user: {
        deleteUser: handler("deleteUser"),
        getAllAdmins: handler("getAllAdmins"),
        getAllOrganisations: handler("getAllOrganisations"),
        getAllUsers: handler("getAllUsers"),
        getAllVolunteers: handler("getAllVolunteers"),
        getUserById: handler("getUserById"),
      },
      volunteer: {
        getVolunteerPastExperience: handler("getVolunteerPastExperience"),
        getVolunteerProfile: handler("getVolunteerProfile"),
        updateVolunteerProfile: handler("updateVolunteerProfile"),
      },
    },
  };
});

vi.mock("../../src/middlewares/auth.middleware.js", () => mocks.auth);
vi.mock("../../src/middlewares/multer.middleware.js", () => mocks.uploads);
vi.mock("../../src/controllers/admin.controller.js", () => mocks.controllers.admin);
vi.mock("../../src/controllers/analytics.controller.js", () => mocks.controllers.analytics);
vi.mock("../../src/controllers/application.controller.js", () => mocks.controllers.application);
vi.mock("../../src/controllers/auth.controller.js", () => mocks.controllers.auth);
vi.mock("../../src/controllers/follow.controller.js", () => mocks.controllers.follow);
vi.mock("../../src/controllers/message.controller.js", () => mocks.controllers.message);
vi.mock("../../src/controllers/opportunity.controller.js", () => mocks.controllers.opportunity);
vi.mock("../../src/controllers/organisation.controller.js", () => mocks.controllers.organisation);
vi.mock("../../src/controllers/report.controller.js", () => mocks.controllers.report);
vi.mock("../../src/controllers/user.controller.js", () => mocks.controllers.user);
vi.mock("../../src/controllers/volunteer.controller.js", () => mocks.controllers.volunteer);

const { default: app } = await import("../../src/app.js");

beforeEach(() => {
  Object.values(mocks.handlers).forEach((handler) => handler.mockClear());
});

describe("API route contract wiring", () => {
  it("requires authentication on protected routes and allows public opportunity reads", async () => {
    const protectedResponse = await request(app).get("/api/application");
    expect(protectedResponse.status).toBe(401);

    const publicResponse = await request(app).get("/api/opportunities");
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body).toEqual({ handler: "getAllOpportunities" });
    expect(mocks.handlers.getAllOpportunities).toHaveBeenCalledOnce();
  });

  it("enforces admin-only analytics and user-management routes", async () => {
    const analyticsDenied = await request(app)
      .get("/api/analytics/reports")
      .set("x-test-role", "volunteer");
    expect(analyticsDenied.status).toBe(403);

    const analyticsAllowed = await request(app)
      .get("/api/analytics/reports")
      .set("x-test-role", "admin");
    expect(analyticsAllowed.status).toBe(200);
    expect(analyticsAllowed.body).toEqual({ handler: "getReportAnalytics" });

    const usersDenied = await request(app)
      .get("/api/user")
      .set("x-test-role", "organisation");
    expect(usersDenied.status).toBe(403);

    const usersAllowed = await request(app)
      .get("/api/user")
      .set("x-test-role", "admin");
    expect(usersAllowed.status).toBe(200);
    expect(usersAllowed.body).toEqual({ handler: "getAllUsers" });
  });

  it("enforces role-specific application, follow, and messaging routes", async () => {
    const volunteerApplication = await request(app)
      .post("/api/application")
      .set("x-test-role", "volunteer")
      .send({ opportunityId: "opportunity-1" });
    expect(volunteerApplication.status).toBe(200);
    expect(volunteerApplication.body).toEqual({ handler: "createApplication" });

    const organisationApplicationDenied = await request(app)
      .post("/api/application")
      .set("x-test-role", "organisation")
      .send({ opportunityId: "opportunity-1" });
    expect(organisationApplicationDenied.status).toBe(403);

    const followDenied = await request(app)
      .post("/api/follow/organisations/org-1")
      .set("x-test-role", "organisation");
    expect(followDenied.status).toBe(403);

    const startConversation = await request(app)
      .post("/api/message/conversations")
      .set("x-test-role", "volunteer")
      .send({ organisationId: "org-1", text: "Hello" });
    expect(startConversation.status).toBe(200);
    expect(startConversation.body).toEqual({ handler: "initiateConversation" });

    const endConversationDenied = await request(app)
      .delete("/api/message/conversations/conversation-1")
      .set("x-test-role", "volunteer");
    expect(endConversationDenied.status).toBe(403);
  });

  it("routes organisation, report, volunteer, and admin opportunity operations", async () => {
    const createOpportunityDenied = await request(app)
      .post("/api/opportunities/create")
      .set("x-test-role", "volunteer")
      .send({ title: "Event" });
    expect(createOpportunityDenied.status).toBe(403);

    const createOpportunityAllowed = await request(app)
      .post("/api/opportunities/create")
      .set("x-test-role", "organisation")
      .send({ title: "Event" });
    expect(createOpportunityAllowed.status).toBe(200);
    expect(createOpportunityAllowed.body).toEqual({ handler: "createOpportunity" });

    const adminDelete = await request(app)
      .delete("/api/opportunities/opportunity-1")
      .set("x-test-role", "admin");
    expect(adminDelete.status).toBe(200);
    expect(adminDelete.body).toEqual({ handler: "deleteOpportunity" });

    const volunteerReport = await request(app)
      .post("/api/report")
      .set("x-test-role", "volunteer")
      .send({ reportType: "OpportunityViolation" });
    expect(volunteerReport.status).toBe(200);
    expect(volunteerReport.body).toEqual({ handler: "createReport" });

    const organisationProfile = await request(app)
      .get("/api/organisation/profile/org-1")
      .set("x-test-role", "volunteer");
    expect(organisationProfile.status).toBe(200);
    expect(organisationProfile.body).toEqual({ handler: "getOrgProfile" });

    const volunteerProfile = await request(app)
      .get("/api/volunteer/profile/vol-1")
      .set("x-test-role", "organisation");
    expect(volunteerProfile.status).toBe(200);
    expect(volunteerProfile.body).toEqual({ handler: "getVolunteerProfile" });
  });

  it("keeps auth endpoints public where intended and protects session endpoints", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: "a", password: "b" });
    expect(login.status).toBe(200);
    expect(login.body).toEqual({ handler: "login" });

    const logout = await request(app).post("/api/auth/logout");
    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ handler: "logout" });

    const meDenied = await request(app).get("/api/auth/me");
    expect(meDenied.status).toBe(401);

    const meAllowed = await request(app)
      .get("/api/auth/me")
      .set("x-test-role", "volunteer");
    expect(meAllowed.status).toBe(200);
    expect(meAllowed.body).toEqual({ handler: "getMe" });
  });
});
