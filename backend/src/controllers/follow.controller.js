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
 */
export const followOrganisation = (req, res) => {
  return sendNotImplemented(res, "Following an organisation");
};

/**
 * TODO(follow): Stop following an organisation.
 * Params: { organisationId: string }
 * Body: none
 * Success: { success, message }
 */
export const unfollowOrganisation = (req, res) => {
  return sendNotImplemented(res, "Unfollowing an organisation");
};

/**
 * TODO(follow): List organisations followed by the authenticated volunteer.
 * Body: none
 * Success: { success, count, data: organisation[] }
 */
export const getMyFollowedOrganisations = (req, res) => {
  return sendNotImplemented(res, "Followed organisation listing");
};

/**
 * TODO(follow): Check whether the authenticated volunteer follows an organisation.
 * Params: { organisationId: string }
 * Body: none
 * Success: { success, data: { isFollowing: boolean } }
 */
export const getFollowStatus = (req, res) => {
  return sendNotImplemented(res, "Follow status lookup");
};

/**
 * TODO(follow): List followers of an organisation.
 * Params: { organisationId: string }
 * Query: { limit?: number, cursor?: string }
 * Success: { success, count, data: volunteer[], meta?: { nextCursor } }
 * Rules: allow only the organisation owner or an admin.
 */
export const getOrganisationFollowers = (req, res) => {
  return sendNotImplemented(res, "Organisation follower listing");
};
