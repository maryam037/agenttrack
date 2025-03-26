require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../models/User');
const connectDB = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminUser = new UserModel({
      firstname: 'Admin',
      lastname: 'User',
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$32Lq2oUHZLwkgfHF9iI8WuMohPzVuEn4EdaEKfZK16/NecVb7Jad.',
      role: 'admin',
      status: 'active'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 