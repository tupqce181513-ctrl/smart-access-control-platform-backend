const mongoose = require('mongoose');

const deviceGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('DeviceGroup', deviceGroupSchema);
