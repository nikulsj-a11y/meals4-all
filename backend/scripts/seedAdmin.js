const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: process.env.SUPER_ADMIN_EMAIL 
    });

    if (existingAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    // Create super admin
    const admin = await Admin.create({
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD
    });

    console.log('Super Admin created successfully');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.SUPER_ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();

