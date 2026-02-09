const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const defaultCategories = [
  'Veg',
  'Chicken',
  'Arabic Items',
  'Rice',
  'Bread',
  'Curry'
];

const seedDefaultCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Connected');

    // Get all vendors
    const vendors = await Vendor.find();

    if (vendors.length === 0) {
      console.log('No vendors found. Please create vendors first.');
      process.exit(0);
    }

    for (const vendor of vendors) {
      console.log(`\nSeeding categories for vendor: ${vendor.name}`);

      for (const categoryName of defaultCategories) {
        const existingCategory = await Category.findOne({
          name: categoryName,
          vendor: vendor._id
        });

        if (!existingCategory) {
          await Category.create({
            name: categoryName,
            vendor: vendor._id,
            isDefault: true
          });
          console.log(`  ✓ Created category: ${categoryName}`);
        } else {
          console.log(`  - Category already exists: ${categoryName}`);
        }
      }
    }

    console.log('\nDefault categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDefaultCategories();

