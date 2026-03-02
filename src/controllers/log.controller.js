const AccessLog = require('../models/AccessLog');
const Device = require('../models/Device');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get access logs with role-based filtering
 * Admin: all logs, Owner: logs for owned devices, Member: own logs
 */
const getLogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, deviceId, userId, action, status, startDate, endDate } = req.query;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  let query = {};

  // Apply role-based filtering
  if (requesterRole === 'admin') {
    // Admin can view all logs
    if (deviceId) query.deviceId = deviceId;
    if (userId) query.userId = userId;
  } else if (requesterRole === 'owner') {
    // Owner can only view logs for their devices
    const ownedDevices = await Device.find({ ownerId: requesterId });
    const ownedDeviceIds = ownedDevices.map((d) => d._id);
    query.deviceId = { $in: ownedDeviceIds };

    if (deviceId && ownedDeviceIds.some((id) => id.toString() === deviceId)) {
      query.deviceId = deviceId;
    }
  } else if (requesterRole === 'member') {
    // Member can only view their own logs
    query.userId = requesterId;
  }

  if (action) {
    query.action = action;
  }

  if (status) {
    query.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Fetch logs
  const logs = await AccessLog.find(query)
    .populate('deviceId', 'name deviceType serialNumber')
    .populate('userId', 'email fullName phone')
    .skip(skip)
    .limit(limitNum)
    .sort({ timestamp: -1 });

  // Get total count
  const total = await AccessLog.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Access logs retrieved successfully',
    data: logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

/**
 * Get access logs for a specific device
 */
const getDeviceLogs = catchAsync(async (req, res) => {
  const { deviceId } = req.params;
  const { page = 1, limit = 20, userId, action, status, startDate, endDate } = req.query;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;

  // Find device
  const device = await Device.findById(deviceId);
  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Check permission (device owner or admin)
  const isDeviceOwner = device.ownerId.toString() === requesterId.toString();
  const isAdmin = requesterRole === 'admin';

  if (!isDeviceOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to view logs for this device');
  }

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = { deviceId };

  if (userId) {
    query.userId = userId;
  }

  if (action) {
    query.action = action;
  }

  if (status) {
    query.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Fetch logs
  const logs = await AccessLog.find(query)
    .populate('deviceId', 'name deviceType serialNumber')
    .populate('userId', 'email fullName phone')
    .skip(skip)
    .limit(limitNum)
    .sort({ timestamp: -1 });

  // Get total count
  const total = await AccessLog.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Device access logs retrieved successfully',
    data: logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

/**
 * Get access logs for a specific user
 */
const getUserLogs = catchAsync(async (req, res) => {
  const { userId: paramUserId } = req.params;
  const { page = 1, limit = 20, deviceId, action, status, startDate, endDate } = req.query;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;

  // Check permission (admin or requesting own logs)
  const isAdmin = requesterRole === 'admin';
  const isRequester = paramUserId === requesterId.toString();

  if (!isAdmin && !isRequester) {
    throw ApiError.forbidden('You do not have permission to view logs for this user');
  }

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = { userId: paramUserId };

  if (deviceId) {
    query.deviceId = deviceId;
  }

  if (action) {
    query.action = action;
  }

  if (status) {
    query.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Fetch logs
  const logs = await AccessLog.find(query)
    .populate('deviceId', 'name deviceType serialNumber')
    .populate('userId', 'email fullName phone')
    .skip(skip)
    .limit(limitNum)
    .sort({ timestamp: -1 });

  // Get total count
  const total = await AccessLog.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'User access logs retrieved successfully',
    data: logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

module.exports = {
  getLogs,
  getDeviceLogs,
  getUserLogs,
};
