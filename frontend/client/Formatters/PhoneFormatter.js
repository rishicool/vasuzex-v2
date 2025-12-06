/**
 * Phone Number Formatting Utilities
 * 
 * Provides phone number formatting for Indian phone numbers (10 digits)
 * with space formatting for better readability.
 */

/**
 * Format phone number with space
 * 
 * Formats 10-digit Indian phone numbers as "XXXXX XXXXX" for readability.
 * 
 * @param {string} phone - Phone number (10 digits expected)
 * @returns {string} Formatted phone number
 * @example
 * formatPhone("9876543210") // "98765 43210"
 * formatPhone("12345") // "12345" (returns as-is if not 10 digits)
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  const phoneStr = String(phone);
  
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`;
  }
  
  return phoneStr;
}
