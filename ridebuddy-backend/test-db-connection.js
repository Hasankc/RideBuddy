const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB successfully!');
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    console.error('MongoDB URI:', process.env.MONGODB_URI);
  } finally {
    process.exit(0);
  }
};

connectDB();