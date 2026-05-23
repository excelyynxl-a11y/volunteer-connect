// reusable method to format time for frontend
export function formatMessageTime(date) {
    return new Date(date).toLocaleDateString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, 
    });
}

export function formatApprovalStatus(status) {
    if (!status) {
        return 'Unknown';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(dateValue) {
    if (!dateValue) {
        return 'Date unavailable';
    }

    return new Date(dateValue).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}



export const validateEmail = (email) => {
    if (!email.trim()) {
        return 'Email is required';
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.'
    }

    return '';
};

export const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    } 

    if (password.length < 8) {
        return 'Password must be at least 8 character.'
    }
    const passwordRegex1 = /(?=.*[a-z])/;
    if (!passwordRegex1.test(password)) {
        return 'Password must contain at least one lowercase letter.'
    };
    const passwordRegex2 = /(?=.*[A-Z])/;
    if (!passwordRegex2.test(password)) {
        return 'Password must contain at least one uppercase letter.'
    };
    const passwordRegex3 = /(?=.*[0-9])/;
    if (!passwordRegex3.test(password)) {
        return 'Password must contain at least one number.'
    };
}

export function getInitials(name) {
    if (!name) {
        return 'VC';
    }

    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
}

export const opportunityCategories = [
    'Environment',
    'Education',
    'Health',
    'Community',
    'Animal Welfare',
    'Elderly Care',
    'Disability Support',
    'Event Support',
    'Fundraising',
    'Other',
];

export const defaultAvailabilityPreview = [
    { dayOfWeek: 'Monday', startTime: '08:00', endTime: '19:00' },
    { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00' },
];

const availabilityDayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export const getMinutesFromTime = (timeValue) => {
    if (!timeValue) return null;

    const [hours, minutes] = timeValue.split(':').map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
};

export const sortAvailabilitySlots = (availabilitySlots = []) =>
    [...availabilitySlots].sort((firstSlot, secondSlot) => {
        const firstDayIndex = availabilityDayOrder.indexOf(firstSlot.dayOfWeek);
        const secondDayIndex = availabilityDayOrder.indexOf(secondSlot.dayOfWeek);
        const firstDayOrder =
            firstDayIndex === -1 ? availabilityDayOrder.length : firstDayIndex;
        const secondDayOrder =
            secondDayIndex === -1 ? availabilityDayOrder.length : secondDayIndex;

        if (firstDayOrder !== secondDayOrder) {
            return firstDayOrder - secondDayOrder;
        }

        return (
            (getMinutesFromTime(firstSlot.startTime) ?? 0) -
            (getMinutesFromTime(secondSlot.startTime) ?? 0)
        );
    });

export const formatAvailabilitySlot = (slot) =>
    `${slot.dayOfWeek}, ${slot.startTime} - ${slot.endTime}`;

export const formatOpportunityDate = (dateValue) => {
    if (!dateValue) return '';

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateValue));
};

const formatOpportunityTime = (dateValue) => {
    if (!dateValue) return '';

    return new Intl.DateTimeFormat('en-MY', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
        .format(new Date(dateValue))
        .toLowerCase();
};

export const formatOpportunityTimeRange = (startAt, endAt, fallback = '') => {
    if (!startAt || !endAt) return fallback;

    return `${formatOpportunityTime(startAt)} - ${formatOpportunityTime(endAt)}`;
};

export const shortDay = (day) => (day ? day.slice(0, 3) : 'Day');

export const getOpportunityImage = (opportunity) => {
    if (!Array.isArray(opportunity?.images)) return '';
    return opportunity.images.find(Boolean) || '';
};

export const getOrganisationName = (opportunity) =>
    opportunity?.organisationId?.name ||
    opportunity?.organisationName ||
    'Organisation';

export const opportunityMatchesSearch = (opportunity, searchQuery) => {
    const terms = searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    if (terms.length === 0) return true;

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
        .toLowerCase();

    return terms.every((term) => searchableText.includes(term));
};

export const getSpotsRemaining = (opportunity) =>
    Math.max(
        (opportunity?.maxVolunteers || 0) -
            (opportunity?.approvedVolunteersCount || 0),
        0,
    );

export const getRequirementItems = (requirements = '') =>
    requirements
        .split(/\n|\u2022|-/)
        .map((requirement) => requirement.trim())
        .filter(Boolean);

const getWeekdayName = (dateValue) => {
    if (!dateValue) return '';

    return new Intl.DateTimeFormat('en-MY', {
        weekday: 'long',
    }).format(new Date(dateValue));
};

const getMinutesFromDate = (dateValue) => {
    if (!dateValue) return null;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.getHours() * 60 + date.getMinutes();
};

export const isOpportunityInsideAvailability = (
    opportunity,
    availabilitySlots = [],
) => {
    if (
        !opportunity?.startAt ||
        !opportunity?.endAt ||
        availabilitySlots.length === 0
    ) {
        return false;
    }

    const opportunityStartDay = getWeekdayName(opportunity.startAt);
    const opportunityEndDay = getWeekdayName(opportunity.endAt);

    if (opportunityStartDay !== opportunityEndDay) {
        return false;
    }

    const opportunityStart = getMinutesFromDate(opportunity.startAt);
    const opportunityEnd = getMinutesFromDate(opportunity.endAt);

    if (opportunityStart === null || opportunityEnd === null) {
        return false;
    }

    return availabilitySlots.some((slot) => {
        const slotStart = getMinutesFromTime(slot.startTime);
        const slotEnd = getMinutesFromTime(slot.endTime);

        if (slotStart === null || slotEnd === null) {
            return false;
        }

        return (
            slot.dayOfWeek === opportunityStartDay &&
            opportunityStart >= slotStart &&
            opportunityEnd <= slotEnd
        );
    });
};
