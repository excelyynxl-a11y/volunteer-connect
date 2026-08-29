import emailjs from '@emailjs/nodejs';

/**
 * Sends an application status notification email to a volunteer.
 * @param {Object} params
 * @param {string} params.volunteerEmail - Recipient email address
 * @param {string} params.volunteerName - Name of the volunteer
 * @param {string} params.status - Updated status ('APPROVED' or 'REJECTED')
 * @param {string} params.opportunityTitle - Title of the volunteer opportunity
 */
export const sendStatusNotification = async ({ volunteerEmail, volunteerName, status, opportunityTitle }) => {
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        volunteer_email: volunteerEmail,
        volunteer_name: volunteerName,
        status: status,
        opportunity_title: opportunityTitle,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
  } catch (error) {
    console.error('Error sending status notification via EmailJS:', error);
  }
};