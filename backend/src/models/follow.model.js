import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

followSchema.index(
  { volunteerId: 1, organisationId: 1 },
  { unique: true },
);

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
