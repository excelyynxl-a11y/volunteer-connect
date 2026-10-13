import mongoose from "mongoose";

import { OPPORTUNITY_CATEGORIES } from "./opportunity.model.js";

// Shared with the analysis service so AI output is trimmed to what the schema allows.
export const ANALYSIS_LIMITS = Object.freeze({
  skills: { maxItems: 20, maxLength: 100 },
  experience: { maxItems: 10, maxLength: 200 },
  interests: { maxItems: 10, maxLength: 100 },
  categories: { maxItems: 5 },
  explanationMaxLength: 300,
});

const stringList = ({ maxItems, maxLength }) => ({
  type: [{ type: String, trim: true, maxlength: maxLength }],
  default: [],
  validate: {
    validator: (items) => items.length <= maxItems,
    message: `At most ${maxItems} items are allowed`,
  },
});

const volunteerAnalysisSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    skills: stringList(ANALYSIS_LIMITS.skills),
    experience: stringList(ANALYSIS_LIMITS.experience),
    interests: stringList(ANALYSIS_LIMITS.interests),

    categories: {
      type: [{ type: String, enum: OPPORTUNITY_CATEGORIES }],
      default: [],
      validate: {
        validator: (items) => items.length <= ANALYSIS_LIMITS.categories.maxItems,
        message: `At most ${ANALYSIS_LIMITS.categories.maxItems} categories are allowed`,
      },
    },

    // One-sentence recommendation direction shown to the volunteer.
    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: ANALYSIS_LIMITS.explanationMaxLength,
    },

    // "failed" means no usable analysis exists yet, service retries lazily.
    status: {
      type: String,
      enum: ["ready", "failed"],
      default: "ready",
    },

    resumeUsed: {
      type: Boolean,
      default: false,
    },

    sourceUpdatedAt: {
      type: Date,
      default: null,
    },

    analysedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const VolunteerAnalysis = mongoose.model(
  "VolunteerAnalysis",
  volunteerAnalysisSchema,
);
export default VolunteerAnalysis;
