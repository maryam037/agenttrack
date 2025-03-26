require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const connectDB = require('../config/db');

const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const clearDatabase = async () => {
  try {
    await connectDB();
    log('Connected to database');
    
    const result = await Review.deleteMany({});
    log(`Successfully deleted ${result.deletedCount} reviews`);
    
    await mongoose.disconnect();
    log('Disconnected from database');
    process.exit(0);
  } catch (error) {
    log(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

clearDatabase(); 