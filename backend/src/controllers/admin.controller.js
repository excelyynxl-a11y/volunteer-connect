import { User } from "../models/user.model.js";

export const approveUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.approvalStatus === "approved") {
      return res.status(400).json({
        message: "User account is already approved.",
      });
    }

    user.approvalStatus = "approved";
    await user.save();

    res.status(200).json({
      message: "User account approved successfully.",
      user,
    });
  } catch (err) {
    console.log("Error in approveUserAccount controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const rejectUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(400).json({
        message: "User account is already rejected.",
      });
    }

    user.approvalStatus = "rejected";
    await user.save();

    res.status(200).json({
      message: "User account rejected successfully.",
      user,
    });
  } catch (err) {
    console.log("Error in rejectUserAccount controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};
