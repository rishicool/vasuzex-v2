/**
 * Routes Index
 * Central export for all routes
 */

import { authRoutes } from './auth.js';

/**
 * Get all API routes
 * Returns array of { path, router } objects
 */
export function getAllRoutes() {
  return [
    { path: '/api/auth', router: authRoutes },
  ];
}
