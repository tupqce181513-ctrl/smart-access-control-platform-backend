require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const deviceRoutes = require('./routes/device.routes');
const accessRoutes = require('./routes/access.routes');
const logRoutes = require('./routes/log.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import error handler
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting middleware
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // limit each IP to 20 requests per windowMs
//   message: 'Too many authentication attempts, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Apply rate limiting to API routes
// app.use('/api/', apiLimiter);
// app.use('/api/auth/', authLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Access Control Platform is running',
    timestamp: new Date(),
  });
});

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler middleware (MUST be last)
app.use(errorHandler);

module.exports = app;
