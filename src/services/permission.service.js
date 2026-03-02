/**
 * Permission Service - Business logic for access control
 * Implements all access permission validation rules
 */

/**
 * Check if a permission is currently active
 * @param {Object} permission - AccessPermission document
 * @returns {Object} { isActive: boolean, reason: string }
 */
function isPermissionActive(permission) {
  if (!permission) {
    return { isActive: false, reason: 'permission_not_found' };
  }

  // Always denied if revoked
  if (permission.isRevoked) {
    return { isActive: false, reason: 'revoked' };
  }

  // Permanent access = always active (unless revoked)
  if (permission.accessType === 'permanent') {
    return { isActive: true, reason: 'permanent' };
  }

  // One-time = active unless revoked
  if (permission.accessType === 'one_time') {
    return { isActive: true, reason: 'one_time' };
  }

  // Scheduled = validate time constraints
  if (permission.accessType === 'scheduled') {
    return validateScheduledAccess(permission.schedule);
  }

  return { isActive: false, reason: 'invalid_access_type' };
}

/**
 * Validate scheduled access against current date/time
 * @param {Object} schedule
 * @returns {Object} { isActive: boolean, reason: string }
 */
function validateScheduledAccess(schedule) {
  if (!schedule) {
    return { isActive: false, reason: 'no_schedule' };
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
  const currentDayOfWeek = now.getDay(); // 0-6

  // Check date range (startTime to endTime)
  if (schedule.startTime) {
    const startDate = new Date(schedule.startTime);
    if (now < startDate) {
      return { isActive: false, reason: 'before_start_date' };
    }
  }

  if (schedule.endTime) {
    const endDate = new Date(schedule.endTime);
    if (now > endDate) {
      return { isActive: false, reason: 'after_end_date' };
    }
  }

  // Check days of week
  if (schedule.daysOfWeek && Array.isArray(schedule.daysOfWeek) && schedule.daysOfWeek.length > 0) {
    if (!schedule.daysOfWeek.includes(currentDayOfWeek)) {
      return { isActive: false, reason: 'outside_schedule_days' };
    }
  }

  // Check time of day
  if (schedule.timeOfDay) {
    if (schedule.timeOfDay.from && currentTime < schedule.timeOfDay.from) {
      return { isActive: false, reason: 'before_time_of_day' };
    }
    if (schedule.timeOfDay.to && currentTime > schedule.timeOfDay.to) {
      return { isActive: false, reason: 'after_time_of_day' };
    }
  }

  return { isActive: true, reason: 'scheduled_active' };
}

/**
 * Get human-readable status of a permission
 * @param {Object} permission - AccessPermission document
 * @returns {string} Status: 'active' | 'revoked' | 'expired' | 'outside_schedule'
 */
function getPermissionStatus(permission) {
  if (!permission) return 'not_found';

  if (permission.isRevoked) return 'revoked';

  if (permission.accessType === 'permanent') {
    return 'active';
  }

  if (permission.accessType === 'one_time') {
    return 'active';
  }

  if (permission.accessType === 'scheduled') {
    const { isActive, reason } = validateScheduledAccess(permission.schedule);
    if (!isActive) {
      // Distinguish between expired and currently outside schedule
      if (reason === 'after_end_date') return 'expired';
      return 'outside_schedule';
    }
    return 'active';
  }

  return 'unknown';
}

/**
 * Format schedule into human-readable string
 * @param {Object} schedule
 * @returns {string} Formatted schedule description
 */
function formatSchedule(schedule) {
  if (!schedule) return 'No schedule';

  const parts = [];

  // Format days
  if (schedule.daysOfWeek && Array.isArray(schedule.daysOfWeek) && schedule.daysOfWeek.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayLabels = schedule.daysOfWeek.map((day) => dayNames[day]).join(', ');
    parts.push(dayLabels);
  }

  // Format time of day
  if (schedule.timeOfDay && (schedule.timeOfDay.from || schedule.timeOfDay.to)) {
    const from = schedule.timeOfDay.from || '00:00';
    const to = schedule.timeOfDay.to || '23:59';
    parts.push(`${from} - ${to}`);
  }

  // Format date range
  const dateRange = [];
  if (schedule.startTime) {
    const startDate = new Date(schedule.startTime);
    dateRange.push(startDate.toLocaleDateString('vi-VN'));
  }
  if (schedule.endTime) {
    const endDate = new Date(schedule.endTime);
    dateRange.push(endDate.toLocaleDateString('vi-VN'));
  }
  if (dateRange.length > 0) {
    parts.push(dateRange.join(' → '));
  }

  return parts.length > 0 ? parts.join(' | ') : 'Custom schedule';
}

module.exports = {
  isPermissionActive,
  validateScheduledAccess,
  getPermissionStatus,
  formatSchedule,
};
