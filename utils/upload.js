const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel functions can write only to /tmp, while local uploads use the project folder.
const uploadsRoot = process.env.VERCEL
    ? path.join('/tmp', 'desa-wonowoso-uploads')
    : path.join(__dirname, '..', 'public', 'uploads');
const uploadDir = uploadsRoot;
const userDocsDir = path.join(uploadsRoot, 'user_docs');
const adminDocsDir = path.join(uploadsRoot, 'admin_docs');
const templateDocsDir = path.join(uploadsRoot, 'template_docs');

[uploadDir, userDocsDir, adminDocsDir, templateDocsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'dokumen' || file.fieldname === 'userFiles' || file.fieldname === 'ktpFile' || file.fieldname === 'kkFile') {
            cb(null, userDocsDir);
        } else if (file.fieldname === 'adminFile') {
            cb(null, adminDocsDir);
        } else if (file.fieldname === 'templateDoc') {
            cb(null, templateDocsDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type (basic check, can be expanded)
    // const mimetype = allowedTypes.test(file.mimetype); 
    // Mimetype check can be tricky for doc/docx, let's rely on extension + generic check or list all mimes
    // For simplicity and avoiding issues with various Office mimes, we check extension mainly here, 
    // but usually mimetype check is safer.
    // Common mimes: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

    // Let's broaden the mimetype check or just check extension for simplicity in this context if strict security isn't paramount.
    // However, to be safe, let's include mimes.
    const mimetypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (extname && (mimetypes.includes(file.mimetype) || file.mimetype.includes('image/') || file.mimetype.includes('pdf'))) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file PDF, JPG, PNG, DOC, dan DOCX yang diperbolehkan!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
