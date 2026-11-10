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
        if (file.fieldname === 'dokumen' || file.fieldname === 'userFiles' || file.fieldname === 'ktpFile' || file.fieldname === 'kkFile' || file.fieldname === 'requirementFiles') {
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
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

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

const rawUpload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

async function saveFileToDb(file) {
    if (!file || !file.path) return;
    try {
        const { UploadedFile } = require('../app/models');
        if (fs.existsSync(file.path)) {
            const data = fs.readFileSync(file.path);
            await UploadedFile.findOneAndUpdate(
                { filename: file.filename },
                {
                    filename: file.filename,
                    mimetype: file.mimetype || 'application/octet-stream',
                    data: data,
                    size: file.size || data.length
                },
                { upsert: true, new: true }
            );
            console.log(`[MongoDB Storage] Persisted ${file.filename} (${data.length} bytes) to MongoDB Atlas`);
        }
    } catch (err) {
        console.error(`[MongoDB Storage Error] Failed to persist ${file.filename}:`, err.message);
    }
}

async function persistReqFiles(req) {
    if (req.file) {
        await saveFileToDb(req.file);
    }
    if (req.files) {
        if (Array.isArray(req.files)) {
            for (const f of req.files) await saveFileToDb(f);
        } else if (typeof req.files === 'object') {
            for (const key of Object.keys(req.files)) {
                const arr = req.files[key];
                if (Array.isArray(arr)) {
                    for (const f of arr) await saveFileToDb(f);
                }
            }
        }
    }
}

function wrapMulter(middleware) {
    return (req, res, next) => {
        middleware(req, res, async (err) => {
            if (err) return next(err);
            try {
                await persistReqFiles(req);
            } catch (pErr) {
                console.error('[MongoDB Storage Error]:', pErr);
            }
            next();
        });
    };
}

const upload = {
    single: (name) => wrapMulter(rawUpload.single(name)),
    fields: (fieldsArr) => wrapMulter(rawUpload.fields(fieldsArr)),
    array: (name, max) => wrapMulter(rawUpload.array(name, max)),
    any: () => wrapMulter(rawUpload.any()),
    saveFileToDb
};

module.exports = upload;
