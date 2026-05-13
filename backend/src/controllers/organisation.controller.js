import { User } from "../models/user.model.js";

export const updateOrgProfile = async (req, res) => {
  try {
    const { name, biodata, categories, previousEvents } = req.body;

    const userId = req.user._id;
    const updatedOrg = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          aboutUs: biodata, // Map frontend 'biodata' to backend 'aboutUs'
          categories,
          previousEvents
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

export const getOrgPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const org = await User.findById(id).select("-password");
    if (!org) return res.status(404).json({ message: "Organisation not found" });

    const activePostings = await User.find({
      organisationId: id,
      status: "Active"
    });

    res.status(200).json({
      profile: org,
      opportunities: activePostings
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};



