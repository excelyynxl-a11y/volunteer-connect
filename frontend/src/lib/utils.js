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

export function formatTime(dateValue) {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleTimeString('en-MY', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
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
