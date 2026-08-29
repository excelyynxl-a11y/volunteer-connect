import mongoose from "mongoose";

export const OPPORTUNITY_CATEGORIES = [
  "Environment",
  "Education",
  "Health",
  "Community",
  "Animal Welfare",
  "Elderly Care",
  "Disability Support",
  "Event Support",
  "Fundraising",
  "Other",
];

export const OPPORTUNITY_STATUSES = [
  "active",
  "closed",
  "cancelled",
  "completed",
];

const opportunitySchema = new mongoose.Schema(
  {
    // Basic posting information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    details: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Organisation that owns this opportunity
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Cloudinary image URLs
    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    // Location information (format: "State, City")
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Opportunity date and time
    startAt: {
      type: Date,
      required: true,
      index: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    // Application deadline (must be before startAt)
    applicationDeadline: {
      type: Date,
      required: true,
    },

    // Volunteer capacity
    maxVolunteers: {
      type: Number,
      required: true,
      min: 1,
    },

    approvedVolunteersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Category classification (can have multiple)
    category: {
      type: [
        {
          type: String,
          enum: OPPORTUNITY_CATEGORIES,
        },
      ],
      default: [],
    },

    // Requirements description for volunteers
    requirements: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    // Opportunity lifecycle
    status: {
      type: String,
      enum: OPPORTUNITY_STATUSES,
      default: "active",
      index: true,
    },

    // When the opportunity was published
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Preserve historical application/report references after moderation removal.
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Validation: endAt must be after startAt
opportunitySchema.path("endAt").validate(function (value) {
  if (!this.startAt || !value) return true;
  return value > this.startAt;
}, "End date/time must be after start date/time.");

// Validation: applicationDeadline must be before startAt
opportunitySchema.path("applicationDeadline").validate(function (value) {
  if (!value || !this.startAt) return true;
  return value < this.startAt;
}, "Application deadline must be before the opportunity start time.");

// Validation: approvedVolunteersCount cannot exceed maxVolunteers
opportunitySchema.path("approvedVolunteersCount").validate(function (value) {
  return value <= this.maxVolunteers;
}, "Approved volunteers count cannot exceed maximum volunteers.");

// Virtual field: remaining available spots
opportunitySchema.virtual("spotsRemaining").get(function () {
  return Math.max(this.maxVolunteers - this.approvedVolunteersCount, 0);
});

// Virtual field: whether the opportunity is full
opportunitySchema.virtual("isFull").get(function () {
  return this.approvedVolunteersCount >= this.maxVolunteers;
});

// Indexes for common search/filter operations
opportunitySchema.index({ status: 1, publishedAt: -1 });
opportunitySchema.index({ location: 1, status: 1 });
opportunitySchema.index({ category: 1, status: 1 });
opportunitySchema.index({ startAt: 1, endAt: 1 });
opportunitySchema.index({ organisationId: 1 });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
