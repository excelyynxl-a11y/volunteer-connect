import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "role",
  collection: "users",
  timestamps: true,
};

// Base User Schema (Only fields that EVERYONE shares)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    avatar: { type: String, default: "" },
  },
  baseOptions,
);

const User = mongoose.model("User", userSchema);

// Volunteer Schema (Only fields specific to Volunteers)
const availabilitySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    preference: {
      type: String,
      enum: ["available", "preferred"],
      default: "available",
    },
  },
  { _id: false },
);

const resumeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const Volunteer = User.discriminator(
  "volunteer",
  new mongoose.Schema({
    ageGroup: {
      type: String,
      enum: ["21-30", "31-40", "41-50", "51-60", "60+"],
      required: true,
    },

    biodata: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    skills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 50,
        },
      ],
      default: [],
      validate: {
        validator: (skills) => skills.length <= 20,
        message: "A volunteer can have at most 20 skills",
      },
    },

    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },

    resume: {
      type: resumeSchema,
      default: () => ({}),
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  }),
);

// Organisation Schema (Only fields specific to Orgs)
const Organisation = User.discriminator(
  "organisation",
  new mongoose.Schema({
    biodata: { type: String },
  }),
);

// Admin Schema (Only fields specific to Admins)
const Admin = User.discriminator("admin", new mongoose.Schema({}));

export { User, Volunteer, Organisation, Admin };
