const express = require('express');
const logController = require('../controllers/log.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const validateQuery = require('../middlewares/validateQuery.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * GET /api/logs
 * Get access logs with role-based filtering
 * Admin: all logs, Owner: logs for owned devices, Member: own logs
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
    deviceId: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    action: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
  }),
  logController.getLogs
);

/**
 * GET /api/logs/device/:deviceId
 * Get access logs for a specific device
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
    userId: {
      type: 'string',
    },
    action: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
  }),
  logController.getDeviceLogs
);

/**
 * GET /api/logs/user/:userId
 * Get access logs for a specific user
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
    deviceId: {
      type: 'string',
    },
    action: {
      type: 'string',
    },
    status: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
  }),
  logController.getUserLogs
);

module.exports = router;
