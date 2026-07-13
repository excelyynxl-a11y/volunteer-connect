import multer from 'multer';

// resume only accepts pdf
const resumeFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for resume uploads.'), false);
    }
}

// avatar only accepts png, jpeg, jpg
const avatarFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, JPEG, and JPG files are allowed for avatar uploads.'), false);
    }
}

// method to upload resume
const resumeUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: resumeFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit  
});
 
const handleUpload = (upload, fieldName, sizeErrorMessage) =>
    (req, res, next) => {
        upload.single(fieldName)(req, res, (error) => {
            if (!error) {
                next();
                return;
            }

            const message =
                error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
                    ? sizeErrorMessage
                    : error.message || 'Invalid file upload.';

            res.status(400).json({
                success: false,
                message,
            });
        });
    };

export const uploadResume = handleUpload(
    resumeUpload,
    'resume',
    'Resume must be 5MB or smaller.',
);


// method to upload avatar
const avatarUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: avatarFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadAvatar = handleUpload(
    avatarUpload,
    'profilePic',
    'Avatar must be 5MB or smaller.',
);
