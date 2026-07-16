import { Organisation } from "../models/user.model.js";
import { uploadAvatarToCloudinary } from "../services/cloudinary.service.js";
import mongoose from "mongoose";

export const getOrgProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    const organisation = await Organisation.findOne({
      _id: id,
      approvalStatus: "approved",
    }).select("name avatar biodata");

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: organisation,
    });
  } catch (error) {
    console.log("Error in getOrgProfile controller: ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

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

    if (
      name !== undefined &&
      (typeof name !== "string" ||
        name.trim() === "" ||
        name.trim().length > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string with at most 120 characters",
      });
    }

    if (
      biodata !== undefined &&
      (typeof biodata !== "string" ||
        biodata.trim() === "" ||
        biodata.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Biodata must be a non-empty string with at most 1000 characters",
      });
    }

    const organisation = await Organisation.findById(userId);

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
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
      organisation.avatar = await uploadAvatarToCloudinary(req.file.buffer);
    }

    await organisation.save();

    const updatedOrg = await Organisation.findById(userId).select(
      "-password -__v",
    );

    res.status(200).json({
      success: true,
      message: "Organisation profile updated successfully",
      data: updatedOrg,
    });
  } catch (error) {
    console.log("Error in updateOrgProfile controller: ", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




