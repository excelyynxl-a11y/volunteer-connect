import emailjs from "@emailjs/nodejs";
import Follow from "../models/follow.model.js";
import { User } from "../models/user.model.js";

const EMAIL_BATCH_SIZE = 5;
const MAX_SEND_ATTEMPTS = 2;

const getEmailConfig = (templateKey) => {
  const templateId =
    templateKey === "opportunity"
      ? process.env.EMAILJS_TEMPLATE_ID_OPPORTUNITY || process.env.EMAILJS_TEMPLATE_ID
      : process.env.EMAILJS_TEMPLATE_ID_STATUS;

  return {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  };
};

const isConfigured = (config) => Object.values(config).every(Boolean);

const sendEmail = async (templateKey, params) => {
  const config = getEmailConfig(templateKey);

  if (!isConfigured(config)) {
    console.warn(`Email notification skipped: ${templateKey} template is not configured.`);
    return false;
  }

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    try {
      await emailjs.send(config.serviceId, config.templateId, params, {
        publicKey: config.publicKey,
        privateKey: config.privateKey,
      });
      return true;
    } catch (error) {
      if (attempt === MAX_SEND_ATTEMPTS) {
        console.error(`Email notification failed after ${attempt} attempts:`, error.message);
      }
    }
  }

  return false;
};

const getVolunteerForApplication = async (application) => {
  if (application.volunteerId?.email) return application.volunteerId;

  const volunteerId = application.volunteerId?._id || application.volunteerId;
  if (!volunteerId) return null;

  return User.findById(volunteerId).select("_id name email role approvalStatus");
};

/**
 * Sends an application decision notification without exposing the recipient
 * email in API responses or application list projections.
 */
export const sendApplicationStatusEmail = async (application, status) => {
  if (!["approved", "rejected"].includes(status)) return false;

  const volunteer = await getVolunteerForApplication(application);
  if (!volunteer?.email) return false;

  return sendEmail("status", {
    volunteer_email: volunteer.email,
    volunteer_name: volunteer.name || "Volunteer",
    opportunity_title: application.opportunityId?.title || "the opportunity",
    status,
  });
};

const getSuppressedRecipients = () =>
  new Set(
    (process.env.EMAIL_NOTIFICATION_SUPPRESS_RECIPIENTS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

const sendOpportunityNotification = async (follower, opportunity, organisation) =>
  sendEmail("opportunity", {
    to_email: follower.email,
    to_name: follower.name || "Volunteer",
    org_name: organisation.name || "An organisation",
    opportunity_title: opportunity.title,
    opportunity_link: `${process.env.CLIENT_URL || "http://localhost:5173"}/volunteer-dashboard/opportunities`,
  });

/** Notify approved volunteers who follow an organisation, in bounded batches. */
export const notifyFollowersOfNewOpportunity = async (opportunity, organisation) => {
  try {
    const follows = await Follow.find({ organisationId: organisation._id }).populate(
      "volunteerId",
      "_id name email role approvalStatus",
    );
    const suppressedRecipients = getSuppressedRecipients();
    const followers = follows
      .map((follow) => follow.volunteerId)
      .filter(
        (volunteer) =>
          volunteer?.role === "volunteer" &&
          volunteer.approvalStatus === "approved" &&
          volunteer.email &&
          !suppressedRecipients.has(volunteer.email.toLowerCase()),
      );

    for (let index = 0; index < followers.length; index += EMAIL_BATCH_SIZE) {
      const batch = followers.slice(index, index + EMAIL_BATCH_SIZE);
      await Promise.all(
        batch.map((follower) => sendOpportunityNotification(follower, opportunity, organisation)),
      );
    }
  } catch (error) {
    console.error("Opportunity follower notifications failed:", error.message);
  }
};
