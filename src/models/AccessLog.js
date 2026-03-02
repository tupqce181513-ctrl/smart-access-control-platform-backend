const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    enum: ['unlock', 'lock', 'access_denied'],
    required: true,
  },
  method: {
    type: String,
    enum: ['app', 'rfid', 'keypad', 'auto'],
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  failReason: {
    type: String,
    trim: true,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    rfidCardId: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient querying
accessLogSchema.index({ deviceId: 1, timestamp: -1 });
accessLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
