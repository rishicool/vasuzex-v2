/**
 * Relative Time Formatting Utilities
 * 
 * Provides human-readable relative time strings like "2 hours ago", "just now", etc.
 */

import { formatDate } from './DateFormatter.js';

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * 
 * Displays time relative to current moment. Falls back to formatted date
 * if more than 30 days ago.
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string or '-' if invalid
 * @example
 * formatRelativeTime(new Date()) // "just now"
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000 * 2)) // "2 days ago"
 */
export function formatRelativeTime(date) {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Check if d is actually a Date object and is valid
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  // If more than 30 days, show formatted date
  return formatDate(d);
}

/**
 * Truncate text with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (including ellipsis)
 * @returns {string} Truncated text with ellipsis if needed
 * @example
 * truncateText("Hello World", 8) // "Hello..."
 * truncateText("Hi", 10) // "Hi"
 */
export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of text
 * 
 * @param {string} text - Text to capitalize
 * @returns {string} Text with first letter capitalized
 * @example
 * capitalize("hello world") // "Hello world"
 * capitalize("HELLO") // "Hello"
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
