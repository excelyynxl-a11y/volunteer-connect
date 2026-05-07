import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('public', 'resumes');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for resume uploads.'), false);
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit  
});
 
export const uploadResume = upload.single('resume');