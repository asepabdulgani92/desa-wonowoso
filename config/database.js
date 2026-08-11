const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Use 127.0.0.1 to avoid IPv4/IPv6 resolution issues with 'localhost'
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desa_wonowoso', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error Connecting to MongoDB: ${error.message}`);
        console.error('Make sure MongoDB is installed and running!');
        process.exit(1);
    }
};

module.exports = connectDB;
