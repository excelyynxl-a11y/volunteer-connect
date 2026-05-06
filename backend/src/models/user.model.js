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
    avatar: { type: String, default: "" },
  },
  baseOptions,
);

const User = mongoose.model("User", userSchema);

// Volunteer Schema (Only fields specific to Volunteers)
const Volunteer = User.discriminator(
  "volunteer",
  new mongoose.Schema({
    ageGroup: {
      type: String,
      enum: ["21-30", "31-40", "41-50", "51-60", "60+"],
      required: true,
    },
    resume: { type: String },
    biodata: { type: String },
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
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  }),
);

// Admin Schema (Only fields specific to Admins)
const Admin = User.discriminator("admin", new mongoose.Schema({}));

export { User, Volunteer, Organisation, Admin };
