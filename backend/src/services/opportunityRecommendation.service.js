import { getVolunteerAnalysis } from "./volunteerAnalysis.service.js";
import { triggerVolunteerAnalysis } from "../lib/analysisTrigger.js";

export const getOpportunityRecommendations = async (volunteer) => {
  const analysis = await getVolunteerAnalysis(volunteer._id);

  // Start analysis in the background and return immediately if it is unavailable.
  if (!analysis || analysis.status === "failed") {
    triggerVolunteerAnalysis(volunteer._id);

    return {
      status: "analysis_unavailable",
      explanation: analysis?.explanation ?? "",
      opportunities: [],
    };
  }

  // Skip opportunity queries and AI selection when there are no categories.
  if (!analysis.categories?.length) {
    return {
      status: "no_matches",
      explanation: analysis.explanation ?? "",
      opportunities: [],
    };
  }

  // TODO: Query and filter candidate opportunities before connecting this service to the controller.
};
