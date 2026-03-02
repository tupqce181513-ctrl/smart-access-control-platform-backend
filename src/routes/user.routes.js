const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', userController.getProfile);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put(
  '/profile',
  validate({
    fullName: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    avatar: {
      type: 'string',
    },
  }),
  userController.updateProfile
);

/**
 * PUT /api/users/change-password
 * Change user password
 */
router.put(
  '/change-password',
  validate({
    currentPassword: {
      required: true,
      type: 'string',
    },
    newPassword: {
      required: true,
      minLength: 6,
    },
  }),
  userController.changePassword
);

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authorize('admin'), userController.getAllUsers);

/**
 * PUT /api/users/:id/toggle-active
 * Toggle user active status (Admin only)
 */
router.put('/:id/toggle-active', authorize('admin'), userController.toggleActive);

module.exports = router;
