/**
 * Date and Time Formatting Utilities
 * 
 * Provides consistent date/time formatting across the application
 * using Indian locale (en-IN) as default.
 */

/**
 * Format date to readable string
 * 
 * @param {Date|string} date - Date to format
 * @param {"short"|"long"} [format="short"] - Format type (short: DD/MM/YYYY, long: DD Month YYYY)
 * @returns {string} Formatted date or '-' if invalid
 * @example
 * formatDate(new Date()) // "05/12/2025"
 * formatDate("2025-12-05", "long") // "05 December 2025"
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Check if d is actually a Date object and is valid
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

  if (format === 'short') {
    return d.toLocaleDateString('en-IN');
  }

  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time to readable string
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time (HH:MM) or '-' if invalid
 * @example
 * formatTime(new Date()) // "14:30"
 */
export function formatTime(date) {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Check if d is actually a Date object and is valid
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time together
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime or '-' if invalid
 * @example
 * formatDateTime(new Date()) // "05/12/2025 14:30"
 */
export function formatDateTime(date) {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Check if d is actually a Date object and is valid
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

  return `${formatDate(d)} ${formatTime(d)}`;
}
