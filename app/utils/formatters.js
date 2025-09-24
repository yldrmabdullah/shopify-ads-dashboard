/**
 * Utility functions for formatting data across the application
 */

/**
 * Format numbers for display with appropriate units
 * @param {number} num - Number to format
 * @returns {string} Formatted number with units
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  
  return num.toString();
}

/**
 * Format currency values for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage values for display
 * @param {number} percentage - Percentage to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage, decimals = 2) {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return '0.00%';
  }

  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format date for API usage (YYYY-MM-DD format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForAPI(date) {
  if (!date) {
    return '';
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // If it's already a string, assume it's in the correct format
  return date;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(date, locale = 'en-US') {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Parse input date value (DD/MM/YYYY format)
 * @param {string} value - Input value to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseInputDate(value) {
  if (!value || !value.includes('/')) {
    return null;
  }

  const [day, month, year] = value.split('/');
  const dayNum = Number(day);
  const monthNum = Number(month) - 1; // Month is 0-indexed
  const yearNum = Number(year);
  
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    return null;
  }
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 0 || monthNum > 11 || yearNum < 1900) {
    return null;
  }
  
  return new Date(yearNum, monthNum, dayNum);
}

/**
 * Format date to DD/MM/YYYY input format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string for input fields
 */
export function formatDateForInput(date) {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Generate a random delta percentage for demo purposes
 * In production, this would calculate actual period-over-period changes
 * @param {number} min - Minimum percentage (default: -20)
 * @param {number} max - Maximum percentage (default: 20)
 * @returns {number} Random delta percentage
 */
export function generateRandomDelta(min = -20, max = 20) {
  return (Math.random() * (max - min)) + min;
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}
