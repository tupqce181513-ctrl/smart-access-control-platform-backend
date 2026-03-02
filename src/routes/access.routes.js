const express = require('express');
const accessController = require('../controllers/access.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const validateQuery = require('../middlewares/validateQuery.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/access/grant
 * Grant access permission to a user
 */
router.post(
  '/grant',
  validate({
    userId: {
      required: true,
      type: 'string',
    },
    deviceId: {
      required: true,
      type: 'string',
    },
    accessType: {
      required: true,
      enum: ['permanent', 'scheduled', 'one_time'],
    },
    schedule: {
      type: 'object',
    },
  }),
  accessController.grantAccess
);

/**
 * PUT /api/access/revoke/:id
 * Revoke access permission
 */
router.put('/revoke/:id', accessController.revokeAccess);

/**
 * GET /api/access/device/:deviceId
 * Get all permissions for a device
 */
router.get(
  '/device/:deviceId',
  validateQuery({
    page: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
  }),
  accessController.getDevicePermissions
);

/**
 * GET /api/access/user/:userId
 * Get all permissions for a user
 */
router.get(
  '/user/:userId',
  validateQuery({
    page: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
  }),
  accessController.getUserPermissions
);

/**
 * GET /api/access/check/:deviceId
 * Check if current user has access to a device
 */
router.get('/check/:deviceId', accessController.checkAccess);

module.exports = router;
