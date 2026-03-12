const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const { sendVendorCredentials } = require('../utils/emailService');

// @desc    Create vendor account
// @route   POST /api/admin/vendors
// @access  Private/SuperAdmin
exports.createVendor = async (req, res) => {
  try {
    const { name, email, password, phone, address, latitude, longitude } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vendor name and email'
      });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email already exists'
      });
    }

    // Use provided password or generate temporary password
    const vendorPassword = password || Math.random().toString(36).slice(-8);

    // Prepare vendor data
    const vendorData = {
      name,
      email,
      password: vendorPassword,
      createdBy: req.user._id,
      isFirstLogin: !password // Only first login if password was auto-generated
    };

    // Add optional fields if provided
    if (phone) vendorData.phone = phone;
    if (address) vendorData.address = address;

    // Add location if coordinates provided
    if (latitude && longitude) {
      vendorData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || ''
      };
    }

    const vendor = await Vendor.create(vendorData);

    // Send credentials via email only if password was auto-generated
    if (!password) {
      await sendVendorCredentials(email, vendorPassword);
    }

    res.status(201).json({
      success: true,
      message: password
        ? 'Vendor created successfully.'
        : 'Vendor created successfully. Credentials sent to email.',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        isActive: vendor.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/SuperAdmin
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle vendor status (enable/disable)
// @route   PATCH /api/admin/vendors/:id/toggle-status
// @access  Private/SuperAdmin
exports.toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Vendor ${vendor.isActive ? 'enabled' : 'disabled'} successfully`,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        isActive: vendor.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/admin/vendors/:id
// @access  Private/SuperAdmin
exports.updateVendor = async (req, res) => {
  try {
    const { name, email, phone, address, latitude, longitude } = req.body;

    console.log('Update vendor request:', { name, email, phone, address, latitude, longitude });

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== vendor.email) {
      const existingVendor = await Vendor.findOne({ email });
      if (existingVendor) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    vendor.name = name || vendor.name;
    vendor.email = email || vendor.email;
    vendor.phone = phone !== undefined ? phone : vendor.phone;
    vendor.address = address !== undefined ? address : vendor.address;

    // Update location if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      console.log('Updating location:', { latitude, longitude, address });
      vendor.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || (vendor.location && vendor.location.address) || ''
      };
    }

    await vendor.save();
    console.log('Vendor updated successfully:', vendor._id);

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        isActive: vendor.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private/SuperAdmin
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if vendor has any food items
    const foodItemsCount = await FoodItem.countDocuments({ vendor: vendor._id });

    if (foodItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vendor. They have ${foodItemsCount} food items. Please delete or reassign them first.`
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/SuperAdmin
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create category (global)
// @route   POST /api/admin/categories
// @access  Private/SuperAdmin
exports.createCategory = async (req, res) => {
  try {
    const { name, vendor } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name'
      });
    }

    const category = await Category.create({
      name,
      vendor: vendor || null // null means global category
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/SuperAdmin
exports.updateCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/SuperAdmin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has food items
    const foodItemsCount = await FoodItem.countDocuments({ category: category._id });

    if (foodItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${foodItemsCount} food items.`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all food items
// @route   GET /api/admin/food-items
// @access  Private/SuperAdmin
exports.getAllFoodItems = async (req, res) => {
  try {
    const { vendor, category } = req.query;

    const filter = {};
    if (vendor) filter.vendor = vendor;
    if (category) filter.category = category;

    const foodItems = await FoodItem.find(filter)
      .populate('vendor', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foodItems.length,
      foodItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update food item
// @route   PUT /api/admin/food-items/:id
// @access  Private/SuperAdmin
exports.updateFoodItem = async (req, res) => {
  try {
    const { name, description, price, isAvailable } = req.body;

    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (name) foodItem.name = name;
    if (description !== undefined) foodItem.description = description;
    if (price) foodItem.price = price;
    if (isAvailable !== undefined) foodItem.isAvailable = isAvailable;

    await foodItem.save();
    await foodItem.populate(['vendor', 'category']);

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      foodItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/admin/food-items/:id
// @access  Private/SuperAdmin
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    await foodItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private/SuperAdmin
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    // Get total orders and sales per vendor
    const vendorStats = await Order.aggregate([
      {
        $group: {
          _id: '$vendor',
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      {
        $unwind: '$vendorInfo'
      },
      {
        $project: {
          vendorId: '$_id',
          vendorName: '$vendorInfo.name',
          totalOrders: 1,
          totalSales: 1
        }
      }
    ]);

    // Get daily/monthly sales summary
    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const salesSummary = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        vendorStats,
        salesSummary: salesSummary[0] || { totalOrders: 0, totalSales: 0 },
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset vendor password (by admin)
// @route   PUT /api/admin/vendors/:id/reset-password
// @access  Private/SuperAdmin
exports.resetVendorPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password with at least 6 characters'
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.password = newPassword;
    vendor.isFirstLogin = true;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private/SuperAdmin
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const admin = await Admin.findById(req.user._id).select('+password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
