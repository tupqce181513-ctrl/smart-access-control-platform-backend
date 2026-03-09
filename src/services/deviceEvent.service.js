const Notification = require('../models/Notification');
const AccessPermission = require('../models/AccessPermission');
const User = require('../models/User');
const websocketService = require('./websocket.service');

class DeviceEventService {
  /**
   * Broadcast a notification and websocket event to all appropriate users.
   * Target audience: Device Owner, System Admins, and Permitted Users.
   *
   * @param {Object|String} deviceId - ID of the device to associate the event with
   * @param {Object|String} ownerId - ID of the device owner
   * @param {Object} socketPayload - Payload for the websocket service
   * @param {String} socketEventName - Event name for the websocket connection
   * @param {Object} [notificationPayload] - Payload if a Database Notification needs to be created.
   *                 (should include { type, title, message })
   */
  async notifyUsers(deviceId, ownerId, socketEventName, socketPayload, notificationPayload = null) {
    try {
      const targetUserIds = new Set();
      
      // 1. Add Device Owner
      if (ownerId) {
        targetUserIds.add(ownerId.toString());
      }

      // 2. Add Admins
      const admins = await User.find({ role: 'admin' }).select('_id');
      admins.forEach((admin) => targetUserIds.add(admin._id.toString()));

      // 3. Add Permitted Users (Not revoked)
      if (deviceId) {
        const permissions = await AccessPermission.find({
          deviceId,
          isRevoked: false,
        }).select('userId');
        permissions.forEach((p) => targetUserIds.add(p.userId.toString()));
      }

      // Convert Set to Array
      const usersToNotify = Array.from(targetUserIds);

      // Distribute Websocket Events
      usersToNotify.forEach((userId) => {
        websocketService.emitToUser(userId, socketEventName, socketPayload);
      });

      // Optionally Create Database Notifications
      if (notificationPayload) {
        const notificationsToInsert = usersToNotify.map((userId) => ({
          ...notificationPayload,
          userId,
          relatedDevice: deviceId,
        }));

        if (notificationsToInsert.length > 0) {
          await Notification.insertMany(notificationsToInsert);

          // Tell clients to pull new notification metrics via socket
          usersToNotify.forEach((userId) => {
            websocketService.emitToUser(userId, 'new_notification', {
              ...notificationPayload,
              relatedDevice: deviceId, // Emitting mock version over websocket for real-time toaster
              userId,
              createdAt: new Date()
            });
          });
        }
      }
    } catch (error) {
      console.error('✗ Error in DeviceEventService notifyUsers:', error.message);
    }
  }
}

module.exports = new DeviceEventService();
