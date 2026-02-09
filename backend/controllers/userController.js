const User = require('../models/User');
const Vendor = require('../models/Vendor');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const Category = require('../models/Category');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private/User
exports.updateProfile = async (req, res) => {
  try {
    const { name, latitude, longitude, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    
    if (latitude && longitude) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || user.location.address
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get nearby vendors (within 20km)
// @route   GET /api/user/vendors/nearby
// @access  Private/User
exports.getNearbyVendors = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Find vendors within 20km radius using $geoWithin and $centerSphere
    // Radius in radians = distance in km / Earth's radius in km (6378.1)
    const radiusInKm = 20;
    const radiusInRadians = radiusInKm / 6378.1;

    const vendors = await Vendor.find({
      isActive: true,
      'location.coordinates': { $exists: true, $ne: [0, 0] }, // Exclude vendors with no valid location
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians]
        }
      }
    }).select('-password');

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

// @desc    Get vendor menu
// @route   GET /api/user/vendors/:vendorId/menu
// @access  Private/User
exports.getVendorMenu = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findOne({ _id: vendorId, isActive: true });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const categories = await Category.find({ vendor: vendorId, isActive: true });
    
    const foodItems = await FoodItem.find({ 
      vendor: vendorId, 
      isAvailable: true 
    }).populate('category', 'name');

    // Group food items by category
    const menuByCategory = categories.map(cat => ({
      category: cat,
      items: foodItems.filter(item => item.category._id.toString() === cat._id.toString())
    }));

    res.status(200).json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        location: vendor.location
      },
      menu: menuByCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Place order
// @route   POST /api/user/orders
// @access  Private/User
exports.placeOrder = async (req, res) => {
  try {
    const { vendorId, items, deliveryAddress, latitude, longitude } = req.body;

    console.log('Place order request:', {
      vendorId,
      itemsCount: items?.length,
      deliveryAddress,
      latitude,
      longitude
    });

    // Validate required fields - use typeof and !== undefined for coordinates since 0 is valid
    if (!vendorId || !items || items.length === 0 || !deliveryAddress ||
        typeof latitude === 'undefined' || latitude === null ||
        typeof longitude === 'undefined' || longitude === null) {
      console.log('Validation failed:', {
        hasVendorId: !!vendorId,
        hasItems: !!items,
        itemsLength: items?.length,
        hasDeliveryAddress: !!deliveryAddress,
        latitudeType: typeof latitude,
        longitudeType: typeof longitude
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const vendor = await Vendor.findOne({ _id: vendorId, isActive: true });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or inactive'
      });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const foodItem = await FoodItem.findOne({
        _id: item.foodItemId,
        vendor: vendorId,
        isAvailable: true
      });

      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: `Food item ${item.foodItemId} not found or unavailable`
        });
      }

      const itemTotal = foodItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: item.quantity
      });
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      vendor: vendorId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      deliveryLocation: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      userMobile: req.user.mobileNumber,
      paymentMethod: 'cod'
    });

    await order.populate('vendor', 'name');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/user/orders
// @access  Private/User
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('vendor', 'name location')
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

// @desc    Get order by ID
// @route   GET /api/user/orders/:id
// @access  Private/User
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('vendor', 'name location')
      .populate('items.foodItem', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
