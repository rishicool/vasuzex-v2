/**
 * Currency Formatting Utilities
 * 
 * Provides currency formatting with Indian Rupee (INR) as default
 * using Intl.NumberFormat for proper locale support.
 */

/**
 * Format currency in Indian Rupees
 * 
 * @param {number} amount - Amount to format
 * @param {string} [locale="en-IN"] - Locale for formatting
 * @param {string} [currency="INR"] - Currency code
 * @param {number} [maxDecimals=0] - Maximum decimal places
 * @returns {string} Formatted currency
 * @example
 * formatCurrency(1000) // "₹1,000"
 * formatCurrency(1500.50, "en-IN", "INR", 2) // "₹1,500.50"
 */
export function formatCurrency(amount, locale = 'en-IN', currency = 'INR', maxDecimals = 0) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
}

/**
 * Format number with Indian number system (lakhs, crores)
 * 
 * @param {number} num - Number to format
 * @param {string} [locale="en-IN"] - Locale for formatting
 * @returns {string} Formatted number
 * @example
 * formatNumber(100000) // "1,00,000"
 * formatNumber(10000000) // "1,00,00,000"
 */
export function formatNumber(num, locale = 'en-IN') {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format percentage
 * 
 * @param {number} value - Value to format
 * @param {number} [decimals=0] - Decimal places
 * @returns {string} Formatted percentage
 * @example
 * formatPercentage(85) // "85%"
 * formatPercentage(85.5, 1) // "85.5%"
 */
export function formatPercentage(value, decimals = 0) {
  if (isNaN(value)) value = 0;
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
