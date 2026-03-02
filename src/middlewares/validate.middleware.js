const ApiError = require('../utils/ApiError');

/**
 * Factory function to create validation middleware
 * @param {Object} schema - Validation schema object
 * Example schema:
 * {
 *   email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *   password: { required: true, minLength: 6 },
 *   fullName: { required: true, type: 'string' }
 * }
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};
    const data = req.body;

    // Validate each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check if field is required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip validation if field is not provided and not required
      if (!value) continue;

      // Validate type
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors[field] = `${field} must be of type ${rules.type}`;
          continue;
        }
      }

      // Validate pattern (regex)
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
        continue;
      }

      // Validate minLength
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        continue;
      }

      // Validate maxLength
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        continue;
      }

      // Validate enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
        continue;
      }

      // Validate min value
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        continue;
      }

      // Validate max value
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`;
        continue;
      }
    }

    // If there are validation errors, throw 400
    if (Object.keys(errors).length > 0) {
      throw ApiError.badRequest('Validation failed');
    }

    next();
  };
};

module.exports = validate;
