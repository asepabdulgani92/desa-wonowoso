const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Admin } = require('../app/models/index'); // Adjust path as needed
const connectDB = require('../config/database');

dotenv.config();

const seedDB = async () => {
    try {
        await connectDB();

        // Check if admin exists
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin
        const admin = new Admin({
            username: 'admin',
            password: 'password123' // Will be hashed by pre-save hook
        });

        await admin.save();
        console.log('Admin user seeded successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedDB();
