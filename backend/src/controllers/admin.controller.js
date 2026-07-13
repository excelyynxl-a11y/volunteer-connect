import cloudinary from "../lib/cloudinary.js";
import { Admin, User } from "../models/user.model.js";
import mongoose from "mongoose";

const REVIEWABLE_ROLES = ["volunteer", "organisation"];

const getReviewableUser = async (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid user ID." });
    return null;
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return null;
  }

  if (!REVIEWABLE_ROLES.includes(user.role)) {
    res.status(400).json({
      message: "Only volunteer and organisation accounts can be reviewed.",
    });
    return null;
  }

  return user;
};

const getSafeUser = (id) => User.findById(id).select("-password -__v");

export const approveUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getReviewableUser(id, res);
    if (!user) return;

    if (user.approvalStatus === "approved") {
      return res.status(400).json({
        message: "User account is already approved.",
      });
    }

    user.approvalStatus = "approved";
    await user.save();
    const safeUser = await getSafeUser(user._id);

    res.status(200).json({
      message: "User account approved successfully.",
      user: safeUser,
    });
  } catch (err) {
    console.log("Error in approveUserAccount controller: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getReviewableUser(id, res);
    if (!user) return;

    if (user.approvalStatus === "rejected") {
      return res.status(400).json({
        message: "User account is already rejected.",
      });
    }

    user.approvalStatus = "rejected";
    await user.save();
    const safeUser = await getSafeUser(user._id);

    res.status(200).json({
      message: "User account rejected successfully.",
      user: safeUser,
    });
  } catch (err) {
    console.log("Error in rejectUserAccount controller: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    // name cannot be empty
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required." });
    }

    const admin = await Admin.findById(userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update their profile",
      });
    }

    admin.name = name.trim();

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
      admin.avatar = result.secure_url;
    }

    await admin.save();

    const updatedAdmin = await Admin.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: updatedAdmin,
    });

  } catch (err) {
    console.log("Error in updateAdminProfile controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};
