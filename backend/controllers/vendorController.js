const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

// @desc    Update vendor profile
// @route   PUT /api/vendor/profile
// @access  Private/Vendor
exports.updateProfile = async (req, res) => {
  try {
    const { name, latitude, longitude, address } = req.body;

    const vendor = await Vendor.findById(req.user._id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (name) vendor.name = name;
    
    if (latitude && longitude) {
      vendor.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || vendor.location.address
      };
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/vendor/change-password
// @access  Private/Vendor
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const vendor = await Vendor.findById(req.user._id).select('+password');

    const isMatch = await vendor.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    vendor.password = newPassword;
    vendor.isFirstLogin = false;
    await vendor.save();

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

// @desc    Get vendor categories
// @route   GET /api/vendor/categories
// @access  Private/Vendor
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ vendor: req.user._id, isActive: true });

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

// @desc    Create category
// @route   POST /api/vendor/categories
// @access  Private/Vendor
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name'
      });
    }

    const category = await Category.create({
      name,
      vendor: req.user._id
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
// @route   PUT /api/vendor/categories/:id
// @access  Private/Vendor
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
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
// @route   DELETE /api/vendor/categories/:id
// @access  Private/Vendor
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

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
        message: 'Cannot delete category with existing food items'
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

// @desc    Get food items
// @route   GET /api/vendor/food-items
// @access  Private/Vendor
exports.getFoodItems = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { vendor: req.user._id };
    if (category) filter.category = category;

    const foodItems = await FoodItem.find(filter).populate('category', 'name');

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

// @desc    Create food item
// @route   POST /api/vendor/food-items
// @access  Private/Vendor
exports.createFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    // Verify category belongs to vendor
    const categoryDoc = await Category.findOne({
      _id: category,
      vendor: req.user._id
    });

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const foodItem = await FoodItem.create({
      name,
      description,
      price,
      category,
      vendor: req.user._id,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await foodItem.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      foodItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update food item
// @route   PUT /api/vendor/food-items/:id
// @access  Private/Vendor
exports.updateFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

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

    if (category) {
      const categoryDoc = await Category.findOne({
        _id: category,
        vendor: req.user._id
      });

      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      foodItem.category = category;
    }

    await foodItem.save();
    await foodItem.populate('category', 'name');

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
// @route   DELETE /api/vendor/food-items/:id
// @access  Private/Vendor
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

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

// @desc    Get vendor orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { vendor: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'mobileNumber name')
      .populate('items.foodItem', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/vendor/orders/:id/status
// @access  Private/Vendor
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales summary
// @route   GET /api/vendor/sales-summary
// @access  Private/Vendor
exports.getSalesSummary = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const summary = await Order.aggregate([
      {
        $match: {
          vendor: req.user._id,
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
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
      summary: summary[0] || { totalOrders: 0, totalSales: 0 },
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor customers
// @route   GET /api/vendor/customers
// @access  Private/Vendor
exports.getCustomers = async (req, res) => {
  try {
    // Get unique customers who have ordered from this vendor
    const customers = await Order.aggregate([
      {
        $match: {
          vendor: req.user._id,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
          userMobile: { $first: '$userMobile' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$userDetails.name', 'Guest'] },
          mobileNumber: { $ifNull: ['$userDetails.mobileNumber', '$userMobile'] },
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor analytics
// @route   GET /api/vendor/analytics
// @access  Private/Vendor
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Sales summary
    const salesSummary = await Order.aggregate([
      {
        $match: {
          vendor: req.user._id,
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          vendor: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling items
    const topItems = await Order.aggregate([
      {
        $match: {
          vendor: req.user._id,
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        salesSummary: salesSummary[0] || { totalOrders: 0, totalSales: 0, avgOrderValue: 0 },
        ordersByStatus,
        topItems
      },
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
