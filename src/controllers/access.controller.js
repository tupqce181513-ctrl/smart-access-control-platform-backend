const AccessPermission = require('../models/AccessPermission');
const Device = require('../models/Device');
const User = require('../models/User');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');
const permissionService = require('../services/permission.service');

/**
 * Grant access permission to a user
 */
const grantAccess = catchAsync(async (req, res) => {
  const { userId, deviceId, accessType, schedule } = req.body;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 1-5: Required fields & objects exist
  // ═══════════════════════════════════════════════════
  
  if (!userId || !deviceId || !accessType) {
    throw ApiError.badRequest('userId, deviceId, and accessType are required');
  }

  if (!['permanent', 'scheduled', 'one_time'].includes(accessType)) {
    throw ApiError.badRequest('accessType must be permanent, scheduled, or one_time');
  }

  // Find device
  const device = await Device.findById(deviceId);
  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Find user to grant access
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 6-7: User status
  // ═══════════════════════════════════════════════════
  
  if (!user.isActive) {
    throw ApiError.badRequest('User account is locked. Cannot grant access to inactive user');
  }

  if (!user.isVerified) {
    throw ApiError.badRequest('User email is not verified. Cannot grant access to unverified user');
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 8: Permission to grant
  // ═══════════════════════════════════════════════════
  
  const isDeviceOwner = device.ownerId.toString() === requesterId.toString();
  const isAdmin = requesterRole === 'admin';

  if (!isDeviceOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to grant access to this device');
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 9-10: Self-grant & Owner grant
  // ═══════════════════════════════════════════════════
  
  if (userId === requesterId.toString()) {
    throw ApiError.badRequest('Cannot grant access to yourself');
  }

  if (userId === device.ownerId.toString()) {
    throw ApiError.badRequest('Device owner does not need access permission');
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 11: No duplicate active permission
  // ═══════════════════════════════════════════════════
  
  const existingPermission = await AccessPermission.findOne({
    userId,
    deviceId,
    isRevoked: false,
  });

  if (existingPermission) {
    throw ApiError.conflict('User already has an active permission for this device');
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION STEP 12: Schedule validation (if type=scheduled)
  // ═══════════════════════════════════════════════════
  
  if (accessType === 'scheduled') {
    const { startTime, endTime, daysOfWeek, timeOfDay } = schedule || {};

    // Must have at least 1 schedule field
    const hasAnyScheduleField = startTime || endTime || (daysOfWeek && daysOfWeek.length > 0) || timeOfDay;
    if (!hasAnyScheduleField) {
      throw ApiError.badRequest('Scheduled access must have at least one time constraint (startTime, endTime, daysOfWeek, or timeOfDay)');
    }

    // Validate date range if both provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        throw ApiError.badRequest('End time must be after start time');
      }
    }

    // Validate daysOfWeek format
    if (daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
      const validDays = daysOfWeek.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
      if (!validDays) {
        throw ApiError.badRequest('Days of week must be numbers between 0-6 (0=Sunday, 6=Saturday)');
      }
    }

    // Validate timeOfDay format (HH:mm)
    if (timeOfDay) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeOfDay.from && !timeRegex.test(timeOfDay.from)) {
        throw ApiError.badRequest('Start time must be in HH:mm format');
      }
      if (timeOfDay.to && !timeRegex.test(timeOfDay.to)) {
        throw ApiError.badRequest('End time must be in HH:mm format');
      }
      if (timeOfDay.from && timeOfDay.to) {
        if (timeOfDay.to <= timeOfDay.from) {
          throw ApiError.badRequest('Time range: end time must be after start time');
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════
  // CREATE PERMISSION
  // ═══════════════════════════════════════════════════
  
  const permission = await AccessPermission.create({
    userId,
    deviceId,
    accessType,
    schedule: schedule || {},
    createdBy: requesterId,
  });

  // Send email to user
  await emailService.sendAccessGrantedEmail(user, device, accessType);

  // Create notification for user
  await Notification.create({
    userId,
    type: 'permission_granted',
    title: 'Access Permission Granted',
    message: `You have been granted ${accessType} access to ${device.name}`,
    relatedDevice: deviceId,
  });

  // Populate references for response
  const populatedPermission = await AccessPermission.findById(permission._id)
    .populate('userId', 'email fullName')
    .populate('deviceId', 'name deviceType')
    .populate('createdBy', 'email fullName');

  res.status(201).json({
    success: true,
    message: 'Access permission granted successfully',
    data: populatedPermission,
  });
});

/**
 * Revoke access permission
 */
const revokeAccess = catchAsync(async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;

  // Find permission
  const permission = await AccessPermission.findById(id).populate('deviceId');

  if (!permission) {
    throw ApiError.notFound('Permission not found');
  }

  if (permission.isRevoked) {
    throw ApiError.badRequest('Permission has already been revoked');
  }

  // Check permission (only device owner or admin can revoke)
  const device = permission.deviceId;
  const isDeviceOwner = device.ownerId.toString() === requesterId.toString();
  const isAdmin = requesterRole === 'admin';

  if (!isDeviceOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to revoke this access');
  }

  // Revoke permission
  permission.isRevoked = true;
  permission.revokedAt = new Date();
  permission.revokedBy = requesterId;
  permission.revokedByType = 'user';
  await permission.save();

  // Fetch user and device details
  const user = await User.findById(permission.userId);

  // Send email to user
  await emailService.sendAccessRevokedEmail(user, device);

  // Create notification for user
  await Notification.create({
    userId: permission.userId,
    type: 'permission_revoked',
    title: 'Access Permission Revoked',
    message: `Your access permission to ${device.name} has been revoked`,
    relatedDevice: device._id,
  });

  // Populate references for response
  const populatedPermission = await AccessPermission.findById(permission._id)
    .populate('userId', 'email fullName')
    .populate('deviceId', 'name deviceType')
    .populate('createdBy', 'email fullName')
    .populate('revokedBy', 'email fullName');

  res.json({
    success: true,
    message: 'Access permission revoked successfully',
    data: populatedPermission,
  });
});

/**
 * Get all permissions for a device
 */
const getDevicePermissions = catchAsync(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  const { page = 1, limit = 10, status } = req.query;

  // Find device
  const device = await Device.findById(deviceId);
  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  // Check permission (only device owner or admin)
  const isDeviceOwner = device.ownerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isDeviceOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to view this device permissions');
  }

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build query with optional status filter
  const query = { deviceId };
  
  // Status filter: active | revoked | expired
  if (status === 'active') {
    query.isRevoked = false;
  } else if (status === 'revoked') {
    query.isRevoked = true;
  } else if (status === 'expired') {
    query.isRevoked = false;
    query.$expr = {
      $and: [
        { $lt: ['$schedule.endTime', new Date()] },
        { $ne: ['$accessType', 'permanent'] },
      ],
    };
  }

  const permissions = await AccessPermission.find(query)
    .populate('userId', 'email fullName phone')
    .populate('createdBy', 'email fullName')
    .populate('revokedBy', 'email fullName')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await AccessPermission.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Device permissions retrieved successfully',
    data: permissions,
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
 * Get all permissions for a user
 */
const getUserPermissions = catchAsync(async (req, res) => {
  const { userId: paramUserId } = req.params;
  const requesterId = req.user._id;
  const requesterRole = req.user.role;
  const { page = 1, limit = 10, status } = req.query;

  // Check permission (admin or requesting own permissions)
  const isAdmin = requesterRole === 'admin';
  const isRequester = paramUserId === requesterId.toString();

  if (!isAdmin && !isRequester) {
    throw ApiError.forbidden('You do not have permission to view this user permissions');
  }

  // Find user
  const user = await User.findById(paramUserId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build query with optional status filter
  const query = { userId: paramUserId };
  
  // Status filter: active | revoked | expired (defaults to active if not specified)
  if (status === 'revoked') {
    query.isRevoked = true;
  } else if (status === 'expired') {
    query.isRevoked = false;
    query.$expr = {
      $and: [
        { $lt: ['$schedule.endTime', new Date()] },
        { $ne: ['$accessType', 'permanent'] },
      ],
    };
  } else {
    // Default to active permissions
    query.isRevoked = false;
  }

  const permissions = await AccessPermission.find(query)
    .populate('userId', 'email fullName')
    .populate('deviceId', 'name deviceType serialNumber ownerId')
    .populate('createdBy', 'email fullName')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await AccessPermission.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'User permissions retrieved successfully',
    data: permissions,
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
 * Check if user has access to device
 */
const checkAccess = catchAsync(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const device = await Device.findById(deviceId);
  if (!device) {
    throw ApiError.notFound('Device not found');
  }

  const isAdmin = userRole === 'admin';
  const isOwner = device.ownerId.toString() === userId.toString();

  if (isAdmin || isOwner) {
    return res.json({
      success: true,
      data: {
        hasAccess: true,
        permission: {
          permissionId: null,
          accessType: isAdmin ? 'admin' : 'owner',
          grantedAt: null,
        },
      },
    });
  }

  // Find active, non-revoked permission
  const permission = await AccessPermission.findOne({
    userId,
    deviceId,
    isRevoked: false,
  });

  // If no permission found
  if (!permission) {
    return res.json({
      success: true,
      data: {
        hasAccess: false,
        permission: null,
      },
    });
  }

  const { isActive, reason } = permissionService.isPermissionActive(permission);

  res.json({
    success: true,
    data: {
      hasAccess: isActive,
      permission: isActive
        ? {
            permissionId: permission._id,
            accessType: permission.accessType,
            grantedAt: permission.createdAt,
            reason,
          }
        : null,
    },
  });
});

module.exports = {
  grantAccess,
  revokeAccess,
  getDevicePermissions,
  getUserPermissions,
  checkAccess,
};
