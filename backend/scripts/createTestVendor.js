require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const createTestVendor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if test vendor already exists
    const existingVendor = await Vendor.findOne({ email: 'vendor@test.com' });
    
    if (existingVendor) {
      console.log('\n✅ Test vendor already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: vendor@test.com');
      console.log('🔑 Password: Vendor@123');
      console.log('🌐 Login URL: http://localhost:3000/vendor/login');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(0);
    }

    // Create test vendor
    const vendor = await Vendor.create({
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: 'Vendor@123',
      phone: '9876543210',
      address: '123 Test Street, Test City',
      isActive: true,
      isFirstLogin: false // Set to false so no password change required
    });

    console.log('\n✅ Test vendor created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: vendor@test.com');
    console.log('🔑 Password: Vendor@123');
    console.log('🌐 Login URL: http://localhost:3000/vendor/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestVendor();

