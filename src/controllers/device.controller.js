const Device = require('../models/Device');
const AccessPermission = require('../models/AccessPermission');
const AccessLog = require('../models/AccessLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const mqttService = require('../services/mqtt.service');
const permissionService = require('../services/permission.service');

/**
 * Create a new device
 */
const createDevice = catchAsync(async (req, res) => {
  const { name, deviceType, serialNumber, firmwareVersion, location } = req.body;

  // Validate required fields
  if (!name || !deviceType || !serialNumber) {
    throw ApiError.badRequest('Name, deviceType, and serialNumber are required');
  }

  // Check if serial number already exists
  const existingDevice = await Device.findOne({ serialNumber });
  if (existingDevice) {
    throw ApiError.badRequest('Device with this serial number already exists');
  }

  // Create device
  const device = await Device.create({
    name: name.trim(),
    deviceType,
    serialNumber: serialNumber.trim(),
    firmwareVersion: firmwareVersion?.trim(),
    ownerId: req.user._id,
    location,
    mqttTopic: `devices/${serialNumber.trim()}`,
    status: 'offline',
    currentState: 'locked',
  });

  // Subscribe to MQTT topics
  mqttService.subscribeToDevice(serialNumber.trim());

  res.status(201).json({
    success: true,
    message: 'Device created successfully',
    data: device,
  });
});

/**
 * Get all devices with filtering and pagination
 */
const getAllDevices = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, deviceType, status } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build query based on user role
  let query = {};

  if (userRole === 'admin') {
    // Admin sees all devices
    query = {};
  } else if (userRole === 'owner') {
    // Owner sees only their devices
    query = { ownerId: userId };
  } else {
    // Member sees devices they have permission for
    const permissions = await AccessPermission.find({
      userId,
      isRevoked: false,
    }).select('deviceId');
    const deviceIds = permissions.map(p => p.deviceId);
    query = { _id: { $in: deviceIds } };
  }

  // Apply filters
  if (deviceType) {
    query.deviceType = deviceType;
  }
  if (status) {
    query.status = status;
  }

  // Fetch devices
  const devices = await Device.find(query)
    .populate('ownerId', 'email fullName')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await Device.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Devices retrieved successfully',
    data: devices,
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
 * Get single device by ID
 */
const getDevice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find device
  const device = await Device.findById(id).populate('ownerId', 'email fullName');

  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Check permission
  const isOwner = device.ownerId._id.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    // Check if user has access permission
    const permission = await AccessPermission.findOne({
      userId,
      deviceId: id,
      isRevoked: false,
    });

    if (!permission) {
      throw ApiError.forbidden('You do not have access to this device');
    }
  }

  res.json({
    success: true,
    message: 'Device retrieved successfully',
    data: device,
  });
});

/**
 * Update device
 */
const updateDevice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, deviceType, firmwareVersion, location, isEnabled } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find device
  const device = await Device.findById(id);

  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Check permission (only owner and admin)
  const isOwner = device.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this device');
  }

  // Build update object (prevent changing serialNumber and ownerId)
  const allowedUpdates = {};
  if (name !== undefined) allowedUpdates.name = name.trim();
  if (deviceType !== undefined) allowedUpdates.deviceType = deviceType;
  if (firmwareVersion !== undefined) allowedUpdates.firmwareVersion = firmwareVersion?.trim();
  if (location !== undefined) allowedUpdates.location = location;
  if (isEnabled !== undefined) allowedUpdates.isEnabled = isEnabled;

  // Update device
  const updatedDevice = await Device.findByIdAndUpdate(id, allowedUpdates, {
    new: true,
    runValidators: true,
  }).populate('ownerId', 'email fullName');

  res.json({
    success: true,
    message: 'Device updated successfully',
    data: updatedDevice,
  });
});

/**
 * Delete device
 */
const deleteDevice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find device
  const device = await Device.findById(id);

  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Check permission (only owner and admin)
  const isOwner = device.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this device');
  }

  // Unsubscribe from MQTT
  mqttService.unsubscribeFromDevice(device.serialNumber);

  // Delete related access permissions
  await AccessPermission.deleteMany({ deviceId: id });

  // Delete device
  await Device.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Device deleted successfully',
  });
});

/**
 * Send command to device
 */
const sendCommand = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!action || !['unlock', 'lock'].includes(action)) {
    throw ApiError.badRequest('Action must be unlock or lock');
  }

  const device = await Device.findById(id).populate('ownerId', 'email fullName');

  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  if (!device.isEnabled) {
    await AccessLog.create({
      deviceId: id,
      userId,
      action,
      method: 'app',
      status: 'failed',
      failReason: 'Device is disabled',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    throw ApiError.badRequest('Device is disabled');
  }

  if (device.status !== 'online') {
    await AccessLog.create({
      deviceId: id,
      userId,
      action,
      method: 'app',
      status: 'failed',
      failReason: 'Device is offline',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    throw ApiError.badRequest('Device is offline');
  }

  const isOwner = device.ownerId._id.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  let permissionResult = {
    allowed: false,
    reason: 'no_permission',
    accessType: null,
    permission: null,
  };

  if (isAdmin) {
    permissionResult = { allowed: true, reason: 'admin', accessType: 'admin', permission: null };
  } else if (isOwner) {
    permissionResult = { allowed: true, reason: 'owner', accessType: 'owner', permission: null };
  } else {
    const permission = await AccessPermission.findOne({
      userId,
      deviceId: id,
      isRevoked: false,
    });

    if (!permission) {
      permissionResult.reason = 'no_permission';
    } else {
      const { isActive, reason } = permissionService.isPermissionActive(permission);

      if (isActive) {
        permissionResult = {
          allowed: true,
          reason: 'permission_granted',
          accessType: permission.accessType,
          permission,
        };
      } else {
        permissionResult.reason = reason;
      }
    }
  }

  if (!permissionResult.allowed) {
    const failReasonMap = {
      no_permission: 'No active permission for this device',
      outside_schedule_days: 'Current day is outside allowed schedule',
      before_time_of_day: 'Current time is before allowed time range',
      after_time_of_day: 'Current time is after allowed time range',
      before_start_date: 'Permission has not started yet',
      after_end_date: 'Permission has expired',
      revoked: 'Permission has been revoked',
    };

    const failReason = failReasonMap[permissionResult.reason] || 'Access denied';

    await AccessLog.create({
      deviceId: id,
      userId,
      action,
      method: 'app',
      status: 'failed',
      failReason: permissionResult.reason,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    if (!isOwner && !isAdmin) {
      const user = await User.findById(userId);
      await Notification.create({
        userId: device.ownerId._id,
        type: 'access_alert',
        title: 'Access Denied',
        message: `${user?.fullName || 'Unknown user'} was denied access to ${device.name}. Reason: ${failReason}`,
        relatedDevice: id,
      });
    }

    throw ApiError.forbidden(failReason);
  }

  mqttService.publishCommand(device.serialNumber, action);
  const user = await User.findById(userId);

  await AccessLog.create({
    deviceId: id,
    userId,
    action,
    method: 'app',
    status: 'success',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  if (!isOwner && !isAdmin) {
    await Notification.create({
      userId: device.ownerId._id,
      type: 'access_alert',
      title: `Device ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${user?.fullName || 'A user'} has ${action}ed the ${device.name} device.`,
      relatedDevice: id,
    });
  }

  if (permissionResult.accessType === 'one_time' && permissionResult.permission) {
    await AccessPermission.findByIdAndUpdate(permissionResult.permission._id, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy: null,
      revokedByType: 'system',
    });
  }

  res.json({
    success: true,
    message: `Command sent successfully to ${device.name}`,
    data: {
      deviceId: id,
      action,
      timestamp: new Date(),
    },
  });
});
module.exports = {
  createDevice,
  getAllDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  sendCommand,
};
