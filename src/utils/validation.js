/**
 * Validation utility functions for form inputs
 */

/**
 * Remove non-alphanumeric characters from input
 * @param {string} value - Input value to sanitize
 * @returns {string} Sanitized value with only alphanumeric characters
 */
export function sanitizeAlphanumeric(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Validate if value length is within constraints
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if valid, false otherwise
 */
export function validateLength(value, maxLength) {
  return value.length <= maxLength;
}

/**
 * Create an input change handler with validation and length constraints
 * @param {Function} setValue - State setter function
 * @param {Object} options - Configuration options
 * @param {number} options.maxLength - Maximum allowed length (default: 20)
 * @param {boolean} options.alphanumericOnly - Only allow alphanumeric characters (default: true)
 * @returns {Function} Input change handler
 */
export function createInputHandler(setValue, options = {}) {
  const {
    maxLength = 20,
    alphanumericOnly = true,
  } = options;

  return (value) => {
    let filteredValue = value;

    // Apply alphanumeric filter if enabled
    if (alphanumericOnly) {
      filteredValue = sanitizeAlphanumeric(filteredValue);
    }

    // Apply length constraint
    if (validateLength(filteredValue, maxLength)) {
      setValue(filteredValue);
    }
  };
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} errorMessage - Error message to return if validation fails
 * @returns {string} Error message or empty string if valid
 */
export function validateRequired(value, errorMessage) {
  return !value.trim() ? errorMessage : '';
}
