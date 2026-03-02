const express = require('express');
const deviceController = require('../controllers/device.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const validateQuery = require('../middlewares/validateQuery.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/devices
 * Create a new device (Owner and Admin only)
 */
router.post(
  '/',
  authorize('owner', 'admin'),
  validate({
    name: {
      required: true,
      type: 'string',
    },
    deviceType: {
      required: true,
      enum: ['door', 'gate', 'locker'],
    },
    serialNumber: {
      required: true,
      type: 'string',
    },
    firmwareVersion: {
      type: 'string',
    },
    location: {
      type: 'object',
    },
  }),
  deviceController.createDevice
);

/**
 * GET /api/devices
 * Get all devices (with filtering)
 */
router.get(
  '/',
  validateQuery({
    page: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
    deviceType: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
  }),
  deviceController.getAllDevices
);

/**
 * GET /api/devices/:id
 * Get single device
 */
router.get('/:id', deviceController.getDevice);

/**
 * PUT /api/devices/:id
 * Update device
 */
router.put(
  '/:id',
  validate({
    name: {
      type: 'string',
    },
    deviceType: {
      enum: ['door', 'gate', 'locker'],
    },
    firmwareVersion: {
      type: 'string',
    },
    location: {
      type: 'object',
    },
    isEnabled: {
      type: 'boolean',
    },
  }),
  deviceController.updateDevice
);

/**
 * DELETE /api/devices/:id
 * Delete device
 */
router.delete('/:id', deviceController.deleteDevice);

/**
 * POST /api/devices/:id/command
 * Send command to device
 */
router.post(
  '/:id/command',
  validate({
    action: {
      required: true,
      enum: ['unlock', 'lock'],
    },
  }),
  deviceController.sendCommand
);

module.exports = router;
