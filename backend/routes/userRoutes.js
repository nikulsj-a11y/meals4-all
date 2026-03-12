const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getNearbyVendors,
  getVendorMenu,
  placeOrder,
  getOrders,
  getOrderById,
  rateOrder
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and user role
router.use(protect);
router.use(authorize('user'));

// Profile management
router.put('/profile', updateProfile);

// Vendor discovery
router.get('/vendors/nearby', getNearbyVendors);
router.get('/vendors/:vendorId/menu', getVendorMenu);

// Order management
router.post('/orders', placeOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders/:id/rate', rateOrder);

module.exports = router;

