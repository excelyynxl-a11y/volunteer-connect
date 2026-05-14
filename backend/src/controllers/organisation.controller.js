import { Organisation } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const updateOrgProfile = async (req, res) => {
  try {
    const { name, biodata } = req.body;
    const userId = req.user._id;

    // at least one field must be provided
    if (name === undefined && biodata === undefined && !req.file) {
      return res.status(400).json({
        success: false,
        message: "At least one profile field must be provided",
      });
    }

    // name cannot be empty
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    // biodata cannot be empty
    if (biodata !== undefined && biodata.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Biodata cannot be empty",
      });
    }

    // biodata cannot be too long (TODO: check how long client wants a orgainsation biodata to be)
    if (
      biodata !== undefined &&
      (typeof biodata !== "string" || biodata.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Biodata must be a string with at most 1000 characters",
      });
    }

    const organisation = await Organisation.findById(userId);

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
    }

    if (organisation.role !== "organisation") {
      return res.status(403).json({
        success: false,
        message: "Only organisations can update their profile",
      });
    }

    if (name !== undefined) {
      organisation.name = name.trim();
    }

    if (biodata !== undefined) {
      organisation.biodata = biodata.trim();
    }

    // upload avatar to Cloudinary if a file was provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            resource_type: "image",
            public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        stream.end(req.file.buffer);
      });
      organisation.avatar = result.secure_url;
    }

    await organisation.save();

    const updatedOrg = await Organisation.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: "Organisation profile updated successfully",
      data: updatedOrg,
    });
  } catch (error) {
    console.log("Error in updateOrgProfile controller: ", error.message);
    res.status(500).json({ 
      message: error.message 
    });
  }
};




