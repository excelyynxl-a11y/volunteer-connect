// reusable method to format time for frontend
export function formatMessageTime(date) {
    return new Date(date).toLocaleDateString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, 
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

export const getInitials = (name) => {
    return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
}