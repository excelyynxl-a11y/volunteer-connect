import mongoose from "mongoose";
import Follow from "../models/follow.model.js";
import { Organisation } from "../models/user.model.js";

const sendNotImplemented = (res, feature) =>
  res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet`,
  });

/**
 * TODO(follow): Follow an approved organisation as the authenticated volunteer.
 * Params: { organisationId: string }
 * Body: none
 * Success: { success, message, data: follow }
 * Rules: allow only volunteers; the organisation must be approved; an existing
 * follow relationship must not create a duplicate record.
 */
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

    const follow = await Follow.create({
      volunteerId,
      organisationId,
    });

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

/**
 * TODO(follow): Stop following an organisation.
 * Params: { organisationId: string }
 * Body: none
 * Success: { success, message }
 * Rules: allow only volunteers and treat an already-unfollowed organisation as
 * a successful final state.
 */
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

/**
 * TODO(follow): List organisations followed by the authenticated volunteer.
 * Body: none
 * Success: { success, count, data: organisation[] }
 */
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

/**
 * TODO(follow): Check whether the authenticated volunteer follows an organisation.
 * Params: { organisationId: string }
 * Body: none
 * Success: { success, data: { isFollowing: boolean } }
 */
export const getFollowStatus = (req, res) => {
  return res.status(200).json({ 
    success: true, 
    data: {
      isFollowing: true,
    },
  });
};

/**
 * TODO(follow): List followers of an organisation.
 * Params: { organisationId: string }
 * Query: { limit?: number, cursor?: string }
 * Success: {
 *   success,
 *   count,
 *   data: Array<{ _id, name, avatar }>,
 *   meta?: { nextCursor }
 * }
 * Rules: allow only the organisation owner or an admin and expose only the
 * volunteer fields required by the follower list.
 */
export const getOrganisationFollowers = (req, res) => {
  return sendNotImplemented(res, "Organisation follower listing");
};
