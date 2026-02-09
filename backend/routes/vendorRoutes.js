const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getOrders,
  updateOrderStatus,
  getSalesSummary,
  getCustomers,
  getAnalytics
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and vendor role
router.use(protect);
router.use(authorize('vendor'));

// Profile management
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Category management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Food item management
router.get('/food-items', getFoodItems);
router.post('/food-items', createFoodItem);
router.put('/food-items/:id', updateFoodItem);
router.delete('/food-items/:id', deleteFoodItem);

// Order management
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Sales summary
router.get('/sales-summary', getSalesSummary);

// Customers
router.get('/customers', getCustomers);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;

