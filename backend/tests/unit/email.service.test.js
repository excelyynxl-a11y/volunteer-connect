import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@emailjs/nodejs", () => ({ default: { send: vi.fn() } }));
vi.mock("../../src/models/follow.model.js", () => ({ default: { find: vi.fn() } }));
vi.mock("../../src/models/user.model.js", () => ({ User: { findById: vi.fn() } }));

import emailjs from "@emailjs/nodejs";
import Follow from "../../src/models/follow.model.js";
import { User } from "../../src/models/user.model.js";
import {
  notifyFollowersOfNewOpportunity,
  sendApplicationStatusEmail,
} from "../../src/lib/email.js";

const configKeys = [
  "EMAILJS_SERVICE_ID",
  "EMAILJS_TEMPLATE_ID",
  "EMAILJS_TEMPLATE_ID_STATUS",
  "EMAILJS_TEMPLATE_ID_OPPORTUNITY",
  "EMAILJS_PUBLIC_KEY",
  "EMAILJS_PRIVATE_KEY",
  "EMAIL_NOTIFICATION_SUPPRESS_RECIPIENTS",
  "CLIENT_URL",
];

const originalEnvironment = Object.fromEntries(
  configKeys.map((key) => [key, process.env[key]]),
);

const setEmailConfig = () => {
  process.env.EMAILJS_SERVICE_ID = "service";
  process.env.EMAILJS_TEMPLATE_ID_STATUS = "status-template";
  process.env.EMAILJS_TEMPLATE_ID_OPPORTUNITY = "opportunity-template";
  process.env.EMAILJS_PUBLIC_KEY = "public";
  process.env.EMAILJS_PRIVATE_KEY = "private";
  process.env.CLIENT_URL = "https://volunteer.example";
};

const queryWithPopulate = (value) => {
  const query = { populate: vi.fn() };
  query.populate.mockResolvedValue(value);
  return query;
};

afterEach(() => {
  for (const key of configKeys) {
    if (originalEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnvironment[key];
  }
});

describe("email notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    User.findById.mockReset();
    Follow.find.mockReset();
    emailjs.send.mockReset();
    for (const key of configKeys) delete process.env[key];
  });

  it("skips status delivery when EmailJS is not configured", async () => {
    const result = await sendApplicationStatusEmail({
      volunteerId: { email: "alex@example.com", name: "Alex" },
      opportunityId: { title: "Beach cleanup" },
    }, "approved");

    expect(result).toBe(false);
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("sends a safe approved/rejected status template to the populated volunteer", async () => {
    setEmailConfig();
    emailjs.send.mockResolvedValue({ status: 200 });
    const result = await sendApplicationStatusEmail({
      volunteerId: { email: "alex@example.com", name: "Alex" },
      opportunityId: { title: "Beach cleanup" },
    }, "approved");

    expect(result).toBe(true);
    expect(emailjs.send).toHaveBeenCalledOnce();
    expect(emailjs.send).toHaveBeenCalledWith(
      "service",
      "status-template",
      {
        volunteer_email: "alex@example.com",
        volunteer_name: "Alex",
        opportunity_title: "Beach cleanup",
        status: "approved",
      },
      { publicKey: "public", privateKey: "private" },
    );
  });

  it("loads the volunteer safely when the application only contains an ID", async () => {
    setEmailConfig();
    emailjs.send.mockResolvedValue({ status: 200 });
    const select = vi.fn().mockResolvedValue({
      _id: "volunteer-1",
      name: "Alex",
      email: "alex@example.com",
      role: "volunteer",
      approvalStatus: "approved",
    });
    User.findById.mockReturnValue({ select });

    await sendApplicationStatusEmail({
      volunteerId: "volunteer-1",
      opportunityId: { title: "Tutoring" },
    }, "rejected");

    expect(User.findById).toHaveBeenCalledWith("volunteer-1");
    expect(select).toHaveBeenCalledWith("_id name email role approvalStatus");
    expect(emailjs.send.mock.calls[0][2]).toMatchObject({
      volunteer_email: "alex@example.com",
      status: "rejected",
    });
  });

  it("ignores unsupported statuses and applications without a recipient", async () => {
    setEmailConfig();
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    expect(await sendApplicationStatusEmail({}, "pending")).toBe(false);
    expect(await sendApplicationStatusEmail({ volunteerId: { name: "Alex" } }, "approved")).toBe(false);
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("stops retries after the first successful provider call", async () => {
    setEmailConfig();
    emailjs.send.mockResolvedValueOnce({ status: 200 });

    await sendApplicationStatusEmail({
      volunteerId: { email: "alex@example.com" },
      opportunityId: { title: "Cleanup" },
    }, "approved");

    expect(emailjs.send).toHaveBeenCalledOnce();
  });

  it("retries a provider failure once and returns false without throwing", async () => {
    setEmailConfig();
    emailjs.send.mockRejectedValue(new Error("provider unavailable"));

    const result = await sendApplicationStatusEmail({
      volunteerId: { email: "alex@example.com" },
      opportunityId: { title: "Cleanup" },
    }, "approved");

    expect(result).toBe(false);
    expect(emailjs.send).toHaveBeenCalledTimes(2);
  });

  it("notifies only approved volunteer followers, honours suppression, and batches recipients", async () => {
    setEmailConfig();
    process.env.EMAIL_NOTIFICATION_SUPPRESS_RECIPIENTS = "suppressed@example.com";
    emailjs.send.mockResolvedValue({ status: 200 });
    const volunteers = Array.from({ length: 6 }, (_, index) => ({
      _id: `volunteer-${index}`,
      name: `Volunteer ${index}`,
      email: `volunteer-${index}@example.com`,
      role: "volunteer",
      approvalStatus: "approved",
    }));
    volunteers.push(
      { email: "pending@example.com", role: "volunteer", approvalStatus: "pending" },
      { email: "organisation@example.com", role: "organisation", approvalStatus: "approved" },
      { email: "suppressed@example.com", role: "volunteer", approvalStatus: "approved" },
    );
    Follow.find.mockReturnValue(queryWithPopulate(
      volunteers.map((volunteerId) => ({ volunteerId })),
    ));

    await notifyFollowersOfNewOpportunity(
      { title: "New opportunity" },
      { _id: "org-1", name: "Helping Hands" },
    );

    expect(Follow.find).toHaveBeenCalledWith({ organisationId: "org-1" });
    expect(emailjs.send).toHaveBeenCalledTimes(6);
    expect(emailjs.send.mock.calls[0][2]).toMatchObject({
      to_email: "volunteer-0@example.com",
      org_name: "Helping Hands",
      opportunity_title: "New opportunity",
      opportunity_link: "https://volunteer.example/volunteer-dashboard/opportunities",
    });
    expect(emailjs.send.mock.calls.flatMap((call) => call[2].to_email)).not.toContain("suppressed@example.com");
  });
});
