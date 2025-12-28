/**
 * Currency Formatter for Indian Rupee (INR)
 * 
 * Uses currency.js library configured for INR
 * Single source of truth for all currency formatting across all APIs
 * 
 * @see https://currency.js.org/
 */

import currency from 'currency.js';

/**
 * Configure currency.js for Indian Rupee
 * Pattern: ₹1,234.56
 */
const INR = value => currency(value, {
  symbol: '₹',
  decimal: '.',
  separator: ',',
  precision: 2,
  pattern: `!#`,  // Symbol before amount with space: ₹1,234.56
  negativePattern: `-!#`  // Negative: -₹1,234.56
});

/**
 * Format a number as INR currency string
 * 
 * @param {number|string} value - The value to format
 * @returns {string} Formatted currency string (e.g., "₹1,234.56")
 * 
 * @example
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1000) // "₹1,000.00"
 * formatCurrency(0) // "₹0.00"
 * formatCurrency(null) // "₹0.00"
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') {
    return INR(0).format();
  }
  return INR(value).format();
};

/**
 * Get currency object for mathematical operations
 * 
 * @param {number|string} value - The value to convert
 * @returns {currency} Currency object with math methods
 * 
 * @example
 * getCurrency(100).add(50).format() // "₹150.00"
 * getCurrency(200).multiply(0.1).format() // "₹20.00"
 */
export const getCurrency = (value) => {
  return INR(value);
};

/**
 * Default export
 */
export default {
  formatCurrency,
  getCurrency,
  INR
};
