import { getVolunteerAnalysis } from "../services/volunteerAnalysis.service.js";

const toClientAnalysis = (analysis) => ({
  skills: analysis.skills,
  experience: analysis.experience,
  interests: analysis.interests,
  categories: analysis.categories,
  explanation: analysis.explanation,
  status: analysis.status,
  analysedAt: analysis.analysedAt,
});

/** Return the stored analysis of the authenticated volunteer, or null if none exists yet. */

export const getMyAnalysis = async (req, res) => {
  try {
    const analysis = await getVolunteerAnalysis(req.user._id);

    return res.status(200).json({
      success: true,
      data: analysis ? toClientAnalysis(analysis) : null,
    });
  } catch (error) {
    console.log("Error in getMyAnalysis controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const recommendOpportunities = async (_req, res) =>
  res.status(501).json({ success: false, message: "Not implemented" });
