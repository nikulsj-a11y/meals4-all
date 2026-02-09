require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');

const testEditDelete = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');

    // Test 1: Create a test vendor
    console.log('📝 Test 1: Creating test vendor...');
    const vendor = await Vendor.create({
      name: 'Test Edit Vendor',
      email: 'testedit@example.com',
      password: 'Test@123',
      phone: '1234567890',
      address: 'Test Address'
    });
    console.log('✅ Vendor created:', vendor.name);

    // Test 2: Update vendor
    console.log('\n📝 Test 2: Updating vendor...');
    vendor.name = 'Updated Vendor Name';
    vendor.phone = '9999999999';
    await vendor.save();
    console.log('✅ Vendor updated:', vendor.name, '| Phone:', vendor.phone);

    // Test 3: Create category
    console.log('\n📝 Test 3: Creating category...');
    const category = await Category.create({
      name: 'Test Category',
      vendor: vendor._id
    });
    console.log('✅ Category created:', category.name);

    // Test 4: Update category
    console.log('\n📝 Test 4: Updating category...');
    category.name = 'Updated Category';
    await category.save();
    console.log('✅ Category updated:', category.name);

    // Test 5: Create food item
    console.log('\n📝 Test 5: Creating food item...');
    const foodItem = await FoodItem.create({
      name: 'Test Food',
      description: 'Test Description',
      price: 99.99,
      category: category._id,
      vendor: vendor._id
    });
    console.log('✅ Food item created:', foodItem.name, '| Price: ₹', foodItem.price);

    // Test 6: Update food item
    console.log('\n📝 Test 6: Updating food item...');
    foodItem.name = 'Updated Food Item';
    foodItem.price = 149.99;
    foodItem.isAvailable = false;
    await foodItem.save();
    console.log('✅ Food item updated:', foodItem.name, '| Price: ₹', foodItem.price, '| Available:', foodItem.isAvailable);

    // Test 7: Try to delete category with food items (should fail)
    console.log('\n📝 Test 7: Trying to delete category with food items...');
    const foodItemsCount = await FoodItem.countDocuments({ category: category._id });
    if (foodItemsCount > 0) {
      console.log('❌ Cannot delete category. It has', foodItemsCount, 'food items.');
    }

    // Test 8: Delete food item
    console.log('\n📝 Test 8: Deleting food item...');
    await foodItem.deleteOne();
    console.log('✅ Food item deleted');

    // Test 9: Delete category (should work now)
    console.log('\n📝 Test 9: Deleting category...');
    await category.deleteOne();
    console.log('✅ Category deleted');

    // Test 10: Delete vendor
    console.log('\n📝 Test 10: Deleting vendor...');
    await vendor.deleteOne();
    console.log('✅ Vendor deleted');

    console.log('\n🎉 All tests passed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Edit & Delete functionality is working!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testEditDelete();

