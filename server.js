const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', false); // Disable default layout, opt-in for admin

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride('_method'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads from local disk, Vercel /tmp, or MongoDB Atlas fallback
app.get('/uploads/*', async (req, res, next) => {
    const rawPath = req.params[0] || '';
    const filename = path.basename(rawPath);

    // 1. Check local static disk in public/uploads
    const publicPath = path.join(__dirname, 'public', 'uploads', rawPath);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        return res.sendFile(publicPath);
    }

    // 2. Check temporary disk on Vercel
    if (process.env.VERCEL) {
        const tmpPath = path.join('/tmp', 'desa-wonowoso-uploads', rawPath);
        if (fs.existsSync(tmpPath) && fs.statSync(tmpPath).isFile()) {
            return res.sendFile(tmpPath);
        }
    }

    // 3. Fallback: stream file from MongoDB Atlas!
    try {
        await connectDB();
        const { UploadedFile } = require('./app/models');
        const fileDoc = await UploadedFile.findOne({ filename: filename });
        if (fileDoc && fileDoc.data) {
            res.set('Content-Type', fileDoc.mimetype || 'image/jpeg');
            // Cache on Vercel CDN Edge for 1 year
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
            return res.send(fileDoc.data);
        }
    } catch (dbErr) {
        console.error('Error fetching file from MongoDB Atlas:', dbErr);
    }

    next();
});

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Flash messages
app.use(flash());

// Global variables
app.use(async (req, res, next) => {
    try {
        await connectDB();
        const { SiteSettings } = require('./app/models');
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        console.log(`[${req.method} ${req.originalUrl}] Extracted Flash Error:`, res.locals.error);
        res.locals.user = req.session.adminId || null;
        res.locals.siteSettings = await SiteSettings.findOne() || {};
    } catch (error) {
        console.error('Global site settings error:', error);
        res.locals.siteSettings = {};
    }
    next();
});

// Routes
app.use('/', require('./app/routes/publicRoutes'));
app.use('/admin', require('./app/routes/authRoutes')); // /admin/login
app.use('/admin', require('./app/routes/adminRoutes')); // /admin/dashboard etc.

// Error handler
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 Not Found', page: '404' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(error => {
            console.error(`Unable to start server: ${error.message}`);
            process.exitCode = 1;
        });
}

module.exports = app;
