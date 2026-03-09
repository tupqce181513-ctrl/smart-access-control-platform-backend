const constants = {
  // User Roles
  ROLES: {
    OWNER: 'owner',
    MEMBER: 'member',
    ADMIN: 'admin',
  },

  // Device Types
  DEVICE_TYPES: {
    DOOR: 'door',
    GATE: 'gate',
    CAMERA: 'camera',
    TURNSTILE: 'turnstile',
    BIOMETRIC: 'biometric',
    RFID_READER: 'rfid_reader',
    KEYPAD: 'keypad',
  },

  // Device Status
  DEVICE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
  },

  // Device State (Real-time)
  DEVICE_STATE: {
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
  },

  // Access Types (Permissions)
  ACCESS_TYPES: {
    PERMANENT: 'permanent',
    SCHEDULED: 'scheduled',
    ONE_TIME: 'one_time',
  },

  // Log Actions
  LOG_ACTIONS: {
    UNLOCK: 'unlock',
    LOCK: 'lock',
    LOGIN: 'login',
    LOGOUT: 'logout',
    STATUS_CHANGED: 'status_changed',
  },

  // Log Methods (How the action was performed)
  LOG_METHODS: {
    APP: 'app',
    AUTO: 'auto',
    SYSTEM: 'system',
    MANUAL: 'manual',
  },

  // Log Status
  LOG_STATUS: {
    SUCCESS: 'success',
    FAILURE: 'failure',
    PENDING: 'pending',
    TIMEOUT: 'timeout',
    UNKNOWN: 'unknown',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    ACCESS_ALERT: 'access_alert',
    DEVICE_OFFLINE: 'device_offline',
    PERMISSION_GRANTED: 'permission_granted',
    PERMISSION_REVOKED: 'permission_revoked',
  },
};

module.exports = constants;
