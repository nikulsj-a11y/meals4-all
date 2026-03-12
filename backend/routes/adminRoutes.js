const express = require('express');
const router = express.Router();
const {
  createVendor,
  getAllVendors,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
  resetVendorPassword,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getAnalytics,
  changePassword
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and superadmin role
router.use(protect);
router.use(authorize('superadmin'));

// Profile management
router.put('/change-password', changePassword);

// Vendor management
router.route('/vendors')
  .get(getAllVendors)
  .post(createVendor);

router.route('/vendors/:id')
  .put(updateVendor)
  .delete(deleteVendor);

router.patch('/vendors/:id/toggle-status', toggleVendorStatus);
router.put('/vendors/:id/reset-password', resetVendorPassword);

// Category management
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Food item management
router.route('/food-items')
  .get(getAllFoodItems);

router.route('/food-items/:id')
  .put(updateFoodItem)
  .delete(deleteFoodItem);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;

