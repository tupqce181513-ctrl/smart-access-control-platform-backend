const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  deviceType: {
    type: String,
    enum: ['door', 'gate', 'locker'],
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firmwareVersion: {
    type: String,
    trim: true,
  },
  mqttTopic: {
    type: String,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
  currentState: {
    type: String,
    enum: ['locked', 'unlocked'],
    default: 'locked',
  },
  lastHeartbeat: {
    type: Date,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for owner queries
deviceSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Device', deviceSchema);
