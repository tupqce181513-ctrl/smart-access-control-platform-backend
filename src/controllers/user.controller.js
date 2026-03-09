const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get user profile
 */
const getProfile = catchAsync(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: user.toJSON(),
  });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const { fullName, phone, avatar } = req.body;
  const userId = req.user._id;

  // Only allow updating fullName, phone, avatar
  const allowedUpdates = {};
  if (fullName !== undefined) allowedUpdates.fullName = fullName;
  if (phone !== undefined) allowedUpdates.phone = phone;
  if (avatar !== undefined) allowedUpdates.avatar = avatar;

  // Update user
  const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user.toJSON(),
  });
});

/**
 * Change user password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  // Find user with password field
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Get all users (Admin and Owner only)
 */
const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const currentUser = req.user;

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build search query
  const query = {};
  
  // If user is owner, only get members and exclude themselves
  if (currentUser.role === 'owner') {
    query.role = 'member';
    query._id = { $ne: currentUser._id };
  }
  
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
    ];
  }

  // Fetch users
  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
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
 * Toggle user active status (Admin only)
 */
const toggleActive = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate user ID
  if (!id) {
    throw ApiError.badRequest('User ID is required');
  }

  // Find user
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.forbidden('Cannot deactivate your own account');
  }

  // Toggle active status
  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user.toJSON(),
  });
});

/**
 * Update user role (Admin only)
 */
const updateRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate user ID and role
  if (!id) {
    throw ApiError.badRequest('User ID is required');
  }

  if (!role || !['owner', 'member', 'admin'].includes(role)) {
    throw ApiError.badRequest('A valid role is required');
  }

  // Find user
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent admin from changing their own role
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.forbidden('Cannot change your own role');
  }

  // Update role
  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role successfully updated to ${role}`,
    data: user.toJSON(),
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleActive,
  updateRole,
};
