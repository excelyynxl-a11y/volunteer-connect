import { volunteerAvailabilityDays } from './data'

const time24HourRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const getMinutesFromTime = (timeValue) => {
  if (typeof timeValue !== 'string' || !time24HourRegex.test(timeValue)) {
    return null
  }

  const [hours, minutes] = timeValue.split(':').map(Number)
  return hours * 60 + minutes
}

export const sortAvailabilitySlots = (availabilitySlots = []) =>
  [...availabilitySlots].sort((firstSlot, secondSlot) => {
    const firstDayIndex = volunteerAvailabilityDays.indexOf(firstSlot.dayOfWeek)
    const secondDayIndex = volunteerAvailabilityDays.indexOf(secondSlot.dayOfWeek)
    const firstDayOrder =
      firstDayIndex === -1 ? volunteerAvailabilityDays.length : firstDayIndex
    const secondDayOrder =
      secondDayIndex === -1 ? volunteerAvailabilityDays.length : secondDayIndex

    if (firstDayOrder !== secondDayOrder) {
      return firstDayOrder - secondDayOrder
    }

    return (
      (getMinutesFromTime(firstSlot.startTime) ?? 0) -
      (getMinutesFromTime(secondSlot.startTime) ?? 0)
    )
  })

export const formatAvailabilitySlot = (slot) =>
  `${slot.dayOfWeek}, ${slot.startTime} - ${slot.endTime}`

export const shortDay = (day) => (day ? day.slice(0, 3) : 'Day')

export const availabilitySlotsOverlap = (firstSlot, secondSlot) => {
  if (firstSlot.dayOfWeek !== secondSlot.dayOfWeek) {
    return false
  }

  const firstStart = getMinutesFromTime(firstSlot.startTime)
  const firstEnd = getMinutesFromTime(firstSlot.endTime)
  const secondStart = getMinutesFromTime(secondSlot.startTime)
  const secondEnd = getMinutesFromTime(secondSlot.endTime)

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null
  ) {
    return false
  }

  return firstStart < secondEnd && secondStart < firstEnd
}

export const getNewAvailabilitySlotError = (newSlot, existingSlots = []) => {
  const startMinutes = getMinutesFromTime(newSlot.startTime)
  const endMinutes = getMinutesFromTime(newSlot.endTime)

  if (!newSlot.dayOfWeek || startMinutes === null || endMinutes === null) {
    return 'Please fill in all availability fields.'
  }

  if (startMinutes >= endMinutes) {
    return 'End time must be later than start time.'
  }

  if (existingSlots.some((slot) => availabilitySlotsOverlap(slot, newSlot))) {
    return 'Availability time ranges on the same day cannot overlap.'
  }

  return ''
}

const getWeekdayName = (dateValue) => {
  if (!dateValue) return ''

  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
  }).format(new Date(dateValue))
}

const getMinutesFromDate = (dateValue) => {
  if (!dateValue) return null

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.getHours() * 60 + date.getMinutes()
}

export const isOpportunityInsideAvailability = (
  opportunity,
  availabilitySlots = [],
) => {
  if (
    !opportunity?.startAt ||
    !opportunity?.endAt ||
    availabilitySlots.length === 0
  ) {
    return false
  }

  const opportunityStartDay = getWeekdayName(opportunity.startAt)
  const opportunityEndDay = getWeekdayName(opportunity.endAt)

  if (opportunityStartDay !== opportunityEndDay) {
    return false
  }

  const opportunityStart = getMinutesFromDate(opportunity.startAt)
  const opportunityEnd = getMinutesFromDate(opportunity.endAt)

  if (opportunityStart === null || opportunityEnd === null) {
    return false
  }

  return availabilitySlots.some((slot) => {
    const slotStart = getMinutesFromTime(slot.startTime)
    const slotEnd = getMinutesFromTime(slot.endTime)

    if (slotStart === null || slotEnd === null) {
      return false
    }

    return (
      slot.dayOfWeek === opportunityStartDay &&
      opportunityStart >= slotStart &&
      opportunityEnd <= slotEnd
    )
  })
}
