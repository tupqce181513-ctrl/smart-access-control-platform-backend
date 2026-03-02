const mongoose = require('mongoose');

const accessPermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  accessType: {
    type: String,
    enum: ['permanent', 'scheduled', 'one_time'],
    required: true,
  },
  schedule: {
    startTime: Date,
    endTime: Date,
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
    timeOfDay: {
      from: String, // HH:MM format
      to: String,   // HH:MM format
    },
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revokedByType: {
    type: String,
    enum: ['user', 'system'],
    default: 'user',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient user-device permission lookups
accessPermissionSchema.index({ userId: 1, deviceId: 1 });

module.exports = mongoose.model('AccessPermission', accessPermissionSchema);
