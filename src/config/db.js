const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✓ MongoDB connected successfully');
      return true;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);

      if (retries < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return connect();
      }

      throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
    }
  };

  return connect();
};

module.exports = connectDB;
