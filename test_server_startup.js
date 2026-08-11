const express = require('express');
const app = express();
try {
    const models = require('./app/models/index');
    console.log('Models loaded:', Object.keys(models));

    const publicController = require('./app/controllers/publicController');
    console.log('Public Controller loaded');

    const adminController = require('./app/controllers/adminController');
    console.log('Admin Controller loaded');

    const authRoutes = require('./app/routes/authRoutes');
    console.log('Auth Routes loaded');

    const adminRoutes = require('./app/routes/adminRoutes');
    console.log('Admin Routes loaded');

    console.log('SUCCESS: All modules loaded without syntax errors.');
} catch (error) {
    console.error('ERROR LOADING MODULES:', error);
}
