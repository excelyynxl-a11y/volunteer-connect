const LOCKED_APPLICATION_STATUSES = new Set([
  'pending',
  'approved',
  'rejected',
  'withdrawn',
])

export const APPLICATION_STATUS_LABELS = {
  pending: 'Application Pending',
  approved: 'Application Approved',
  rejected: 'Application Rejected',
  withdrawn: 'Application Withdrawn',
  full: 'Opportunity Full',
}

export const APPLICARION_TAB_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const APPLICATION_TABS = ["All", "Pending", "Approved", "Rejected", "Withdrawn"]

export const getApplicationDisplayStatus = (applicationStatus, spotsRemaining) => {
  const status = applicationStatus ? applicationStatus.toLowerCase() : null
  const isFull = spotsRemaining !== null && spotsRemaining <= 0

  if (status && LOCKED_APPLICATION_STATUSES.has(status)) {
    return { key: status, isLocked: true }
  }

  if (isFull) {
    return { key: 'full', isLocked: true }
  }

  return { key: null, isLocked: false }
}