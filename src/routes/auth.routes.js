const express = require('express');
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate({
    email: {
      required: true,
      pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      required: true,
      minLength: 6,
    },
    fullName: {
      required: true,
      type: 'string',
    },
    phone: {
      type: 'string',
    },
  }),
  authController.register
);

/**
 * GET /api/auth/verify-email
 * Verify email address
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * POST /api/auth/login
 * User login
 */
router.post(
  '/login',
  validate({
    email: {
      required: true,
      pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      required: true,
    },
  }),
  authController.login
);

/**
 * POST /api/auth/refresh-token
 * Refresh access token
 */
router.post(
  '/refresh-token',
  validate({
    refreshToken: {
      required: true,
      type: 'string',
    },
  }),
  authController.refreshAccessToken
);

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', auth, authController.logout);

module.exports = router;
