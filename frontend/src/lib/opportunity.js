const getValidDate = (dateValue) => {
  if (!dateValue) return null

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatOpportunityDate = (dateValue, fallback = '') => {
  const date = getValidDate(dateValue)
  if (!date) return fallback

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatOpportunityTime = (dateValue) => {
  const date = getValidDate(dateValue)
  if (!date) return ''

  return new Intl.DateTimeFormat('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toLowerCase()
}

export const formatOpportunityDateTime = (dateValue, fallback = '') => {
  const date = getValidDate(dateValue)
  if (!date) return fallback

  return date.toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatOpportunityTimeRange = (startAt, endAt, fallback = '') => {
  const startTime = formatOpportunityTime(startAt)
  const endTime = formatOpportunityTime(endAt)

  return startTime && endTime ? `${startTime} - ${endTime}` : fallback
}

export const getOpportunityStatusClass = (status = 'pending') =>
  String(status).trim().toLowerCase().replace(/\s+/g, '-') || 'pending'

export const getOpportunityImage = (opportunity) => {
  if (!Array.isArray(opportunity?.images)) return ''
  return opportunity.images.find(Boolean) || ''
}

export const getOrganisationName = (opportunity) =>
  opportunity?.organisationId?.name ||
  opportunity?.organisationName ||
  'Organisation'

export const opportunityMatchesSearch = (opportunity, searchQuery) => {
  const terms = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return true

  const searchableText = [
    opportunity?.title,
    opportunity?.details,
    opportunity?.location,
    opportunity?.requirements,
    getOrganisationName(opportunity),
    ...(Array.isArray(opportunity?.category) ? opportunity.category : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return terms.every((term) => searchableText.includes(term))
}

export const getSpotsRemaining = (opportunity) =>
  Math.max(
    (opportunity?.maxVolunteers || 0) -
      (opportunity?.approvedVolunteersCount || 0),
    0,
  )

export const getRequirementItems = (requirements = '') =>
  requirements
    .split(/\n|\u2022|-/)
    .map((requirement) => requirement.trim())
    .filter(Boolean)

export const getOpportunitySortTimestamp = (opportunity) => {
  const date = getValidDate(
    opportunity?.startAt || opportunity?.publishedAt || opportunity?.createdAt,
  )
  return date?.getTime() ?? 0
}

export const getOpportunityPublishedTimestamp = (opportunity) => {
  const date = getValidDate(opportunity?.publishedAt || opportunity?.createdAt)
  return date?.getTime() ?? 0
}

export const getUpcomingOpportunities = (
  opportunities = [],
  now = Date.now(),
) =>
  opportunities
    .filter((opportunity) => getOpportunitySortTimestamp(opportunity) >= now)
    .sort(
      (first, second) =>
        getOpportunitySortTimestamp(first) -
        getOpportunitySortTimestamp(second),
    )

export const sortOpportunitiesByMostRecent = (opportunities = []) =>
  [...opportunities].sort(
    (first, second) =>
      getOpportunitySortTimestamp(second) -
      getOpportunitySortTimestamp(first),
  )

export const splitOpportunitiesByStatus = (opportunities = []) => ({
  activeOpportunities: opportunities.filter(
    (opportunity) => opportunity.status?.toLowerCase() === 'active',
  ),
  closedOpportunities: opportunities.filter((opportunity) =>
    ['closed', 'completed'].includes(opportunity.status?.toLowerCase()),
  ),
  cancelledOpportunities: opportunities.filter(
    (opportunity) => opportunity.status?.toLowerCase() === 'cancelled',
  ),
})
