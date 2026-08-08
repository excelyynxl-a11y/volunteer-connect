import mongoose from "mongoose";
import Follow from "../models/follow.model.js";
import { Organisation } from "../models/user.model.js";

export const followOrganisation = async (req, res) => {
  try{
    const volunteerId = req.user._id;
    const { organisationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organisationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    const organisation = await Organisation.findOne({
      _id: organisationId,
      approvalStatus: "approved",
    });

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
    }

    const existingFollow = await Follow.findOne({
      volunteerId,
      organisationId,
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "Organisation is already followed",
      });
    }

    let follow;

    try {
      follow = await Follow.create({
        volunteerId,
        organisationId,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Organisation is already followed",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Organisation followed successfully",
      data: follow,
    });

  } catch (error){
    console.error("Error following organisation:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
  
};

export const unfollowOrganisation = async (req, res) => {
  try{

    const volunteerId = req.user._id;
    const { organisationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organisationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    await Follow.findOneAndDelete({
      volunteerId,
      organisationId,
    });

    return res.status(200).json({
      success: true,
      message: "Organisation unfollowed successfully",
    });

  } catch (error){
    console.error("Error unfollowing organisation:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

export const getMyFollowedOrganisations = async (req, res) => {
  try{
    const volunteerId = req.user._id;

    const follows = await Follow.find({ volunteerId }).populate({
      path: "organisationId",
      select: "_id name avatar biodata",
      match: {
        approvalStatus: "approved",
      },
    });

    const organisations = follows
      .map((follow) => follow.organisationId)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: organisations.length,
      data: organisations,
    });

  } catch (error){
    console.error(
      "Error getting followed organisations:",
      error.message,
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFollowStatus = async (req, res) => {
  try{
    const volunteerId = req.user._id;
    const { organisationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organisationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    const follow = await Follow.findOne({
      volunteerId,
      organisationId,
    });

    return res.status(200).json({
      success: true,
      data: {
        isFollowing: Boolean(follow),
      },
    });

  } catch (error){
    console.error("Error getting follow status:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getOrganisationFollowers = async (req, res) => {
  try {
    const { organisationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organisationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(req.user._id) === String(organisationId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own followers",
      });
    }

    const organisation = await Organisation.findOne({
      _id: organisationId,
      approvalStatus: "approved",
    }).select("_id");

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
    }

    const follows = await Follow.find({ organisationId }).populate({
      path: "volunteerId",
      select: "_id name avatar",
      match: {
        role: "volunteer",
        approvalStatus: "approved",
      },
    });

    const volunteers = follows
      .map((follow) => follow.volunteerId)
      .filter(Boolean)
      .map(({ _id, name, avatar }) => ({ _id, name, avatar }));

    return res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    console.error("Error getting organisation followers:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
