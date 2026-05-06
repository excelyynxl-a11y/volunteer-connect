import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    maxVolunteers: { type: Number, required: true },
    fixedDate: { type: Date, required: true },
    timeFrame: { type: String, required: true }, // e.g., "09:00 AM - 02:00 PM"

    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refers to the User model (Organisation discriminator)
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Closed", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true },
);

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
