const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/database');
const { Layanan } = require('./app/models/index');

const checkLayanan = async () => {
    await connectDB();
    const layanans = await Layanan.find({});
    console.log('Layanan Records:', layanans.map(l => ({ title: l.title, templateDoc: l.templateDoc })));
    process.exit();
};

checkLayanan();
