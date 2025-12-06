/**
 * Environment Helper
 * Laravel-style env() function for accessing environment variables
 */

export function env(key, defaultValue = null) {
  return process.env[key] ?? defaultValue;
}
