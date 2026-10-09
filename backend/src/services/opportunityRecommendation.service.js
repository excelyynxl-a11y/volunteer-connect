import { getVolunteerAnalysis } from "./volunteerAnalysis.service.js";
import { triggerVolunteerAnalysis } from "../lib/analysisTrigger.js";
import { isOpportunityInsideAvailability } from "../lib/availability.js";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js";

const QUERY_LIMIT = 200;
const CANDIDATE_LIMIT = 30;
const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: process.env.TZ || "Asia/Kuala_Lumpur",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const findCandidateOpportunities = async (volunteer, categories) => {
  // Exclude every previous application, including rejected and withdrawn ones.
  const appliedOpportunityIds = await Application.distinct("opportunityId", {
    volunteerId: volunteer._id,
  });
  const now = new Date();
  const opportunities = await Opportunity.find({
    category: { $in: categories },
    status: "active",
    deletedAt: null,
    startAt: { $gt: now },
    applicationDeadline: { $gt: now },
    $expr: { $lt: ["$approvedVolunteersCount", "$maxVolunteers"] },
    _id: { $nin: appliedOpportunityIds },
  })
    .sort({ startAt: 1, _id: 1 })
    .limit(QUERY_LIMIT)
    .populate("organisationId", "name");

  const availability = volunteer.availability ?? [];

  // Empty availability imposes no time restriction.
  return opportunities.filter((opportunity) => {
    if (availability.length === 0) return true;

    const start = new Date(opportunity.startAt);
    const end = new Date(opportunity.endAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return false;
    }

    // A single availability slot cannot cover an overnight or multi-day event.
    // Keep the existing helper's timezone while checking dates as well as times.
    if (end <= start || localDateFormatter.format(start) !== localDateFormatter.format(end)) {
      return false;
    }

    return isOpportunityInsideAvailability(opportunity, availability);
  }).slice(0, CANDIDATE_LIMIT);
};

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

  const candidates = await findCandidateOpportunities(volunteer, analysis.categories);

  if (candidates.length === 0) {
    return {
      status: "no_matches",
      explanation: analysis.explanation ?? "",
      opportunities: [],
    };
  }

  // TODO: Send candidates to Gemini and validate its selection before connecting
  // this service to the controller. Candidates are not recommendations yet.
};
