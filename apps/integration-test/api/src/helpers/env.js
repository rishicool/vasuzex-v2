/**
 * Environment Helper
 * Laravel-style env() helper for accessing environment variables
 */

export function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}
