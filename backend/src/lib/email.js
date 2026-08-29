import emailjs from "@emailjs/nodejs";

const {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID_STATUS,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
} = process.env;

// Initialised once, on import. The private key is required here because
// requests are coming from the server (non-browser origin) and EmailJS
// needs it to trust the send.
emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
  privateKey: EMAILJS_PRIVATE_KEY,
});

/**
 * Sends an "application approved/rejected" notification email to the
 * volunteer. This is designed to be called fire-and-forget (not awaited
 * in the request/response path): it swallows and logs its own errors so
 * a failed send never surfaces to the client or crashes the process.
 *
 * @param {Object} application - populated Application document. Expects
 *   application.volunteerId to be populated with at least { name, email }
 *   and application.opportunityId to be populated with { title }.
 * @param {"approved" | "rejected"} status
 */
export const sendApplicationStatusEmail = async (application, status) => {
  try {
    const volunteer = application.volunteerId;
    const opportunity = application.opportunityId;

    if (!volunteer?.email) {
      console.log(
        "sendApplicationStatusEmail: volunteer email missing, skipping send"
      );
      return;
    }

    const templateParams = {
      volunteer_email: volunteer.email,
      volunteer_name: volunteer.name || "Volunteer",
      opportunity_title: opportunity?.title || "the opportunity",
      status,
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_STATUS, templateParams);

    console.log(
      `Application status email sent to ${volunteer.email} (status: ${status})`
    );
  } catch (err) {
    console.log(
      "Error in sendApplicationStatusEmail:",
      err?.message || err
    );
  }
};