export const formatLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const parseLocalDateTime = (value) => {
  if (!value) return null
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!parts) return null
  const [, year, month, day, hour, minute] = parts.map(Number)
  const date = new Date(value)
  // Reject dates that JavaScript silently normalises, such as 30 February.
  return Number.isFinite(date.getTime()) &&
    date.getFullYear() === year && date.getMonth() + 1 === month &&
    date.getDate() === day && date.getHours() === hour && date.getMinutes() === minute
    ? date : null
}

export const validateOpportunityDates = (
  { startAt, endAt, applicationDeadline },
  { creating = false, now = new Date() } = {},
) => {
  const errors = {}
  const start = parseLocalDateTime(startAt)
  const end = parseLocalDateTime(endAt)
  const deadline = parseLocalDateTime(applicationDeadline)

  if (startAt && !start) errors.startAt = 'Enter a valid start date and time.'
  if (endAt && !end) errors.endAt = 'Enter a valid end date and time.'
  if (applicationDeadline && !deadline) errors.applicationDeadline = 'Enter a valid application deadline.'

  if (creating) {
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    if (start && start < today) errors.startAt = 'Start date cannot be before today.'
    if (deadline && deadline < today) errors.applicationDeadline = "Application deadline cannot be before today's date"
  }

  if (start && end && end <= start) {
    errors.endAt = 'End date/time must be after the start date/time.'
  }
  if (start && deadline && deadline >= start) {
    errors.applicationDeadline = 'Application deadline must be before the start date/time.'
  }

  return { errors, start, end, deadline }
}
