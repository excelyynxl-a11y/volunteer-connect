const LOCKED_APPLICATION_STATUSES = new Set([
  'pending',
  'approved',
  'rejected',
  'withdrawn',
]);

// 1. Plain strings (Fixes OpportunityCard, badges, buttons across Volunteer side)
export const APPLICATION_STATUS_LABELS = {
  pending: 'Application Pending',
  approved: 'Application Approved',
  rejected: 'Application Rejected',
  withdrawn: 'Application Withdrawn',
  full: 'Opportunity Full',
};

export const APPLICARION_TAB_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_TABS = ["All", "Pending", "Approved", "Rejected", "Withdrawn"];

// 2. Dedicated function for the banner in OpportunityDetailModal
export const getApplicationBannerMessage = (status, organisationName) => {
  const org = organisationName || 'this organisation';
  
  const messages = {
    pending: `Your application to ${org} is pending review.`,
    approved: `Your application to ${org} has been approved!`,
    rejected: `Your application to ${org} was not accepted.`,
    withdrawn: `You have withdrawn your application for ${org}.`,
    full: 'This opportunity is currently full.',
  };

  return messages[status] || null;
};

export const getApplicationDisplayStatus = (applicationStatus, spotsRemaining) => {
  const status = applicationStatus ? applicationStatus.toLowerCase() : null;
  const isFull = spotsRemaining !== null && spotsRemaining <= 0;

  if (status && LOCKED_APPLICATION_STATUSES.has(status)) {
    return { key: status, isLocked: true };
  }

  if (isFull) {
    return { key: 'full', isLocked: true };
  }

  return { key: null, isLocked: false };
};