const constants = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    GUEST: 'guest',
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
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OFFLINE: 'offline',
    MAINTENANCE: 'maintenance',
    DISABLED: 'disabled',
  },

  // Device State (Real-time)
  DEVICE_STATE: {
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    OPEN: 'open',
    CLOSED: 'closed',
    TRIGGERED: 'triggered',
    ARMED: 'armed',
    DISARMED: 'disarmed',
  },

  // Access Types
  ACCESS_TYPES: {
    CARD: 'card',
    PIN: 'pin',
    BIOMETRIC: 'biometric',
    FACIAL: 'facial',
    RFID: 'rfid',
    MOBILE: 'mobile',
    MANUAL: 'manual',
  },

  // Log Actions
  LOG_ACTIONS: {
    ACCESS_GRANTED: 'access_granted',
    ACCESS_DENIED: 'access_denied',
    CARD_SCANNED: 'card_scanned',
    PIN_ENTERED: 'pin_entered',
    DEVICE_UNLOCKED: 'device_unlocked',
    DEVICE_LOCKED: 'device_locked',
    TAMPER_DETECTED: 'tamper_detected',
    OFFLINE: 'offline',
    ONLINE: 'online',
    CONFIG_CHANGED: 'config_changed',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
  },

  // Log Methods (How the action was performed)
  LOG_METHODS: {
    CARD: 'card',
    PIN: 'pin',
    BIOMETRIC: 'biometric',
    MOBILE_APP: 'mobile_app',
    REMOTE_CONTROL: 'remote_control',
    SCHEDULE: 'schedule',
    EMERGENCY: 'emergency',
    API: 'api',
    USER_ACTION: 'user_action',
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
    ACCESS_GRANTED: 'access_granted',
    ACCESS_DENIED: 'access_denied',
    TAMPER_ALERT: 'tamper_alert',
    OFFLINE_ALERT: 'offline_alert',
    BATTERY_LOW: 'battery_low',
    DEVICE_MALFUNCTION: 'device_malfunction',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    SCHEDULE_REMINDER: 'schedule_reminder',
    MAINTENANCE_DUE: 'maintenance_due',
    SYSTEM_ALERT: 'system_alert',
  },
};

module.exports = constants;
