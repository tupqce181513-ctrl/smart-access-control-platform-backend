const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Device = require('../models/Device');
const AccessLog = require('../models/AccessLog');
const Notification = require('../models/Notification');
const websocketService = require('./websocket.service');
const deviceEventService = require('./deviceEvent.service');
require('dotenv').config();

class MqttService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.offlineCheckInterval = null;
    // Time in ms after which a device is considered offline (default: 2 minutes)
    this.offlineThreshold = parseInt(process.env.DEVICE_OFFLINE_THRESHOLD) || 2 * 60 * 1000;
    // How often to check for offline devices (default: every 60 seconds)
    this.offlineCheckFrequency = parseInt(process.env.DEVICE_OFFLINE_CHECK_FREQ) || 60 * 1000;
  }

  /**
   * Connect to MQTT broker
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const brokerUrl = `${mqttConfig.brokerUrl}:${mqttConfig.port}`;
        
        this.client = mqtt.connect(brokerUrl, mqttConfig.options);

        // Event: Connection successful
        this.client.on('connect', () => {
          this.isConnected = true;
          console.log('✓ Connected to MQTT broker');
          this.subscribeToAllDevices();
          this.startOfflineCheck();
          resolve(this);
        });

        // Event: Connection error
        this.client.on('error', (error) => {
          console.error('✗ MQTT connection error:', error.message);
          reject(error);
        });

        // Event: Reconnection attempt
        this.client.on('reconnect', () => {
          console.log('⟳ Attempting to reconnect to MQTT broker');
        });

        // Event: Incoming message
        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

        // Event: Offline
        this.client.on('offline', () => {
          this.isConnected = false;
          console.log('✗ MQTT client offline');
        });

        // Event: Close
        this.client.on('close', () => {
          this.isConnected = false;
          console.log('✗ MQTT connection closed');
        });
      } catch (error) {
        console.error('✗ Failed to connect to MQTT broker:', error.message);
        reject(error);
      }
    });
  }

  /**
   * Publish command to device
   * @param {string} serialNumber - Device serial number
   * @param {string} command - Command to send (unlock, lock, etc.)
   */
  publishCommand(serialNumber, command) {
    if (!this.isConnected || !this.client) {
      console.error('✗ MQTT client not connected');
      return false;
    }

    try {
      const topic = `devices/${serialNumber}/command`;
      const payload = JSON.stringify({
        action: command,
        timestamp: Date.now(),
      });

      this.client.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error(`✗ Failed to publish command to ${topic}:`, error.message);
        } else {
          console.log(`✓ Command published to ${topic}: ${command}`);
        }
      });

      return true;
    } catch (error) {
      console.error('✗ Error in publishCommand:', error.message);
      return false;
    }
  }

  /**
   * Subscribe to device status and heartbeat
   * @param {string} serialNumber - Device serial number
   */
  subscribeToDevice(serialNumber) {
    if (!this.isConnected || !this.client) {
      console.error('✗ MQTT client not connected');
      return false;
    }

    try {
      const topics = [
        `devices/${serialNumber}/status`,
        `devices/${serialNumber}/heartbeat`,
      ];

      topics.forEach((topic) => {
        this.client.subscribe(topic, { qos: 1 }, (error) => {
          if (error) {
            console.error(`✗ Failed to subscribe to ${topic}:`, error.message);
          } else {
            console.log(`✓ Subscribed to ${topic}`);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('✗ Error in subscribeToDevice:', error.message);
      return false;
    }
  }

  /**
   * Subscribe to all devices in database
   */
  async subscribeToAllDevices() {
    try {
      const devices = await Device.find({ isEnabled: true });

      devices.forEach((device) => {
        this.subscribeToDevice(device.serialNumber);
      });

      console.log(`✓ Subscribed to ${devices.length} device(s)`);
    } catch (error) {
      console.error('✗ Error in subscribeToAllDevices:', error.message);
    }
  }

  /**
   * Handle incoming MQTT messages
   * @param {string} topic - MQTT topic
   * @param {Buffer} message - Message payload
   */
  async handleMessage(topic, message) {
    try {
      // Parse topic: devices/{serialNumber}/{messageType}
      const topicParts = topic.split('/');
      
      if (topicParts[0] !== 'devices' || topicParts.length < 3) {
        console.warn(`✗ Invalid topic format: ${topic}`);
        return;
      }

      const serialNumber = topicParts[1];
      const messageType = topicParts[2];
      const payload = JSON.parse(message.toString());

      // Find device by serial number
      const device = await Device.findOne({ serialNumber });

      if (!device) {
        console.warn(`✗ Device not found: ${serialNumber}`);
        return;
      }

      // Handle different message types
      if (messageType === 'status') {
        await this.handleStatusMessage(device, payload);
      } else if (messageType === 'heartbeat') {
        await this.handleHeartbeatMessage(device, payload);
      } else {
        console.warn(`✗ Unknown message type: ${messageType}`);
      }
    } catch (error) {
      console.error('✗ Error handling MQTT message:', error.message);
    }
  }

  /**
   * Handle device status message
   * @param {Object} device - Device document
   * @param {Object} payload - Message payload
   */
  async handleStatusMessage(device, payload) {
    try {
      const { state, timestamp } = payload;

      if (!state) {
        console.warn('✗ Status message missing state');
        return;
      }

      // Update device state and status
      device.currentState = state;
      device.status = 'online';
      device.lastHeartbeat = new Date(timestamp || Date.now());
      await device.save();

      console.log(`✓ Updated device status: ${device.name} -> ${state}`);

      // Create access log for state change
      await AccessLog.create({
        deviceId: device._id,
        action: state === 'unlocked' ? 'unlock' : 'lock',
        method: 'auto',
        status: 'success',
        metadata: {
          source: 'mqtt',
        },
      });

      // Emit WebSocket event for real-time update to all permitted users
      await deviceEventService.notifyUsers(
        device._id,
        device.ownerId,
        'device_status_changed',
        {
          deviceId: device._id,
          state,
          status: 'online',
          timestamp: device.lastHeartbeat,
        }
      );
    } catch (error) {
      console.error('✗ Error handling status message:', error.message);
    }
  }

  /**
   * Handle device heartbeat message
   * @param {Object} device - Device document
   * @param {Object} payload - Message payload
   */
  async handleHeartbeatMessage(device, payload) {
    try {
      const { timestamp, signal_strength } = payload;

      // Update device heartbeat and status
      device.lastHeartbeat = new Date(timestamp || Date.now());
      device.status = 'online';
      await device.save();

      console.log(`✓ Received heartbeat from device: ${device.name}`);

      // Emit WebSocket event for real-time heartbeat update to all permitted users
      await deviceEventService.notifyUsers(
        device._id,
        device.ownerId,
        'device_status_changed',
        {
          deviceId: device._id,
          status: 'online',
          timestamp: device.lastHeartbeat,
        }
      );
    } catch (error) {
      console.error('✗ Error handling heartbeat message:', error.message);
    }
  }

  /**
   * Unsubscribe from device topics
   * @param {string} serialNumber - Device serial number
   */
  unsubscribeFromDevice(serialNumber) {
    if (!this.isConnected || !this.client) {
      console.error('✗ MQTT client not connected');
      return false;
    }

    try {
      const topics = [
        `devices/${serialNumber}/status`,
        `devices/${serialNumber}/heartbeat`,
      ];

      topics.forEach((topic) => {
        this.client.unsubscribe(topic, (error) => {
          if (error) {
            console.error(`✗ Failed to unsubscribe from ${topic}:`, error.message);
          } else {
            console.log(`✓ Unsubscribed from ${topic}`);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('✗ Error in unsubscribeFromDevice:', error.message);
      return false;
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    this.stopOfflineCheck();
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      console.log('✓ Disconnected from MQTT broker');
    }
  }

  /**
   * Check if connected to MQTT broker
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Start periodic offline device check
   */
  startOfflineCheck() {
    this.stopOfflineCheck();
    console.log(`✓ Starting offline device check (every ${this.offlineCheckFrequency / 1000}s, threshold: ${this.offlineThreshold / 1000}s)`);

    this.offlineCheckInterval = setInterval(() => {
      this.checkOfflineDevices();
    }, this.offlineCheckFrequency);
  }

  /**
   * Stop periodic offline device check
   */
  stopOfflineCheck() {
    if (this.offlineCheckInterval) {
      clearInterval(this.offlineCheckInterval);
      this.offlineCheckInterval = null;
    }
  }

  /**
   * Check all enabled devices and mark as offline if heartbeat is stale
   */
  async checkOfflineDevices() {
    try {
      const threshold = new Date(Date.now() - this.offlineThreshold);

      // Find devices that are currently online but have not sent a heartbeat within the threshold
      const staleDevices = await Device.find({
        isEnabled: true,
        status: 'online',
        $or: [
          { lastHeartbeat: { $lt: threshold } },
          { lastHeartbeat: { $exists: false } },
        ],
      });

      for (const device of staleDevices) {
        device.status = 'offline';
        await device.save();

        console.log(`⚠ Device went offline: ${device.name} (${device.serialNumber})`);

        // Emit WebSocket updates and store notification
        await deviceEventService.notifyUsers(
          device._id,
          device.ownerId,
          'device_status_changed',
          {
            deviceId: device._id,
            status: 'offline',
            timestamp: new Date(),
          },
          {
            type: 'device_offline',
            title: 'Thiết bị mất kết nối',
            message: `Thiết bị "${device.name}" (${device.serialNumber}) đã chuyển sang trạng thái offline do không nhận được tín hiệu.`,
          }
        );
      }

      if (staleDevices.length > 0) {
        console.log(`⚠ Marked ${staleDevices.length} device(s) as offline`);
      }
    } catch (error) {
      console.error('✗ Error checking offline devices:', error.message);
    }
  }
}

// Export singleton instance
module.exports = new MqttService();
