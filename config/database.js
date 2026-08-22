const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desa_wonowoso';

    connectionPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
    }).then(conn => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
    }).catch(error => {
        connectionPromise = undefined;
        throw error;
    });

    try {
        console.log('Attempting to connect to MongoDB...');
        return await connectionPromise;
    } catch (error) {
        console.error(`Error Connecting to MongoDB: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
