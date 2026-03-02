const crypto = require("crypto");
const User = require("../models/User");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const RefreshToken = require("../models/RefreshToken");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const authService = require("../services/auth.service");
const emailService = require("../services/email.service");

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
  const { email, password, fullName, phone } = req.body;
  // Validate input
  if (!email || !password || !fullName) {
    throw ApiError.badRequest("Email, password, and fullName are required");
  }

  if (password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest("Email already registered");
  }

  // Create new user
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    fullName,
    phone,
    isVerified: false,
  });

  // Generate verification token (expires in 24 hours)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await EmailVerificationToken.create({
    userId: user._id,
    token,
    expiresAt,
  });

  // Send verification email
  await emailService.sendVerificationEmail(user, token);

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
    data: {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
});

/**
 * Verify email address
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw ApiError.badRequest("Verification token is required");
  }

  // Find verification token
  const verificationToken = await EmailVerificationToken.findOne({ token });

  if (!verificationToken) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  // Check if token has expired
  if (verificationToken.expiresAt < new Date()) {
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });
    throw ApiError.badRequest("Verification token has expired");
  }

  // Update user as verified
  const user = await User.findByIdAndUpdate(
    verificationToken.userId,
    { isVerified: true },
    { new: true },
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Delete verification token
  await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

  // Send welcome email
  await emailService.sendWelcomeEmail(user);

  res.json({
    success: true,
    message: "Email verified successfully. Welcome to Smart Access Control!",
    data: {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  // Validate input
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  // Find user and include password
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Check if user account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const lockTimeRemaining = Math.ceil(
      (user.lockUntil - new Date()) / 1000 / 60,
    );
    throw ApiError.forbidden(
      `Account is locked. Try again in ${lockTimeRemaining} minutes`,
    );
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment failed login attempts
    user.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 30 minutes
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }

    await user.save();
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email first");
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.forbidden("Account is inactive");
  }

  // Reset failed login attempts
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  user.lastLoginIP = clientIp;
  await user.save();

  // Generate tokens
  const accessToken = authService.generateAccessToken(
    user._id.toString(),
    user.role,
  );
  const refreshTokenValue = authService.generateRefreshToken();

  // Save refresh token to database
  const refreshTokenExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  );

  await RefreshToken.create({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt: refreshTokenExpiry,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    },
  });
});

/**
 * Refresh access token
 */
const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  // Find refresh token in database
  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    revoked: false,
  }).populate("userId");

  if (!storedToken) {
    throw ApiError.unauthorized("Invalid or revoked refresh token");
  }

  // Check if token has expired
  if (storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token has expired");
  }

  const user = storedToken.userId;

  // Check if user is still active
  if (!user.isActive) {
    throw ApiError.forbidden("User account is inactive");
  }

  // Revoke old refresh token
  await RefreshToken.findByIdAndUpdate(
    storedToken._id,
    { revoked: true },
    { new: true },
  );

  // Generate new tokens
  const newAccessToken = authService.generateAccessToken(
    user._id.toString(),
    user.role,
  );
  const newRefreshTokenValue = authService.generateRefreshToken();

  // Save new refresh token to database
  const newRefreshTokenExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  );

  await RefreshToken.create({
    userId: user._id,
    token: newRefreshTokenValue,
    expiresAt: newRefreshTokenExpiry,
  });

  res.json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    },
  });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required for logout");
  }

  // Revoke refresh token
  const revokedToken = await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { revoked: true },
    { new: true },
  );
  if (!revokedToken) {
    throw ApiError.badRequest("Invalid refresh token");
  }

  res.json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  refreshAccessToken,
  logout,
};
