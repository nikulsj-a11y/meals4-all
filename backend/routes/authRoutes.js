const express = require('express');
const router = express.Router();
const {
  adminLogin,
  vendorLogin,
  sendUserOTP,
  verifyUserOTP,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Admin routes
router.post('/admin/login', adminLogin);

// Vendor routes
router.post('/vendor/login', vendorLogin);

// User routes
router.post('/user/send-otp', sendUserOTP);
router.post('/user/verify-otp', verifyUserOTP);

// Get current user (all roles)
router.get('/me', protect, getMe);

module.exports = router;

