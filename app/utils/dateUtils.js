/**
 * Date utility functions for handling date ranges and presets
 */

import { DATE_RANGE_PRESETS } from '../constants/platforms.js';

/**
 * Get date range for a specific preset
 * @param {string} presetId - Preset identifier
 * @returns {Object} Date range object with start and end dates
 */
export function getPresetDateRange(presetId) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (presetId) {
    case DATE_RANGE_PRESETS.TODAY: {
      return { start: startOfToday, end: startOfToday };
    }
    
    case DATE_RANGE_PRESETS.YESTERDAY: {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    
    case DATE_RANGE_PRESETS.LAST_WEEK: {
      const end = new Date(startOfToday);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
    
    case DATE_RANGE_PRESETS.THIS_MONTH: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: startOfToday };
    }
    
    case DATE_RANGE_PRESETS.LAST_7_DAYS: {
      const end = new Date(startOfToday);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
    
    case DATE_RANGE_PRESETS.LAST_MONTH: {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    
    default: {
      // Default to this month
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: startOfToday };
    }
  }
}

/**
 * Get the start date of the last month
 * @returns {string} Formatted date string
 */
export function getLastMonthStart() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

/**
 * Get the end date of the last month
 * @returns {string} Formatted date string
 */
export function getLastMonthEnd() {
  const date = new Date();
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is valid
 * @param {Date|string} date - Date to validate
 * @returns {boolean} Whether the date is valid
 */
export function isValidDate(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Get date range duration in days
 * @param {Object} dateRange - Date range object with start and end
 * @returns {number} Number of days in the range
 */
export function getDateRangeDuration(dateRange) {
  if (!dateRange?.start || !dateRange?.end) {
    return 0;
  }

  const start = dateRange.start instanceof Date ? dateRange.start : new Date(dateRange.start);
  const end = dateRange.end instanceof Date ? dateRange.end : new Date(dateRange.end);

  if (!isValidDate(start) || !isValidDate(end)) {
    return 0;
  }

  const timeDiff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}

/**
 * Get previous period date range for comparison
 * @param {Object} dateRange - Current date range
 * @returns {Object} Previous period date range
 */
export function getPreviousPeriodRange(dateRange) {
  if (!dateRange?.start || !dateRange?.end) {
    return null;
  }

  const duration = getDateRangeDuration(dateRange);
  const currentStart = dateRange.start instanceof Date ? dateRange.start : new Date(dateRange.start);
  
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - duration + 1);

  return {
    start: previousStart,
    end: previousEnd
  };
}

/**
 * Check if two date ranges overlap
 * @param {Object} range1 - First date range
 * @param {Object} range2 - Second date range
 * @returns {boolean} Whether the ranges overlap
 */
export function dateRangesOverlap(range1, range2) {
  if (!range1?.start || !range1?.end || !range2?.start || !range2?.end) {
    return false;
  }

  const start1 = range1.start instanceof Date ? range1.start : new Date(range1.start);
  const end1 = range1.end instanceof Date ? range1.end : new Date(range1.end);
  const start2 = range2.start instanceof Date ? range2.start : new Date(range2.start);
  const end2 = range2.end instanceof Date ? range2.end : new Date(range2.end);

  return start1 <= end2 && start2 <= end1;
}

/**
 * Add a random variation to date range for forcing fresh data
 * @param {Object} dateRange - Original date range
 * @returns {Object} Date range with variation for cache busting
 */
export function addDateRangeVariation(dateRange) {
  return {
    ...dateRange,
    _variation: Math.random() // This will force new data generation
  };
}
