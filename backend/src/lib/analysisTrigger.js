// Starts a volunteer analysis in the background. Never throws and never delays
// the caller's response. The service is imported lazily so the controllers that
// call this don't pull the AI code and its models into their import graph.

export const triggerVolunteerAnalysis = (volunteerId) => {
  void import("../services/volunteerAnalysis.service.js")
    .then(({ analyseVolunteer }) => analyseVolunteer(volunteerId))
    .catch((error) => {
      console.error("Volunteer analysis failed:", error.message);
    });
};
