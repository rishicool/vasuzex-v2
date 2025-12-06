/**
 * Route Registry
 * Central place to register all routes
 */

import { authRoutes } from './auth.routes.js';
// import postRoutes from './post.routes.js';

/**
 * Health check route (can be used separately)
 */
export const healthRoutes = (req, res) => {
  res.json({
    success: true,
    service: process.env.APP_NAME,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get all routes with their base paths
 * @returns {Array} Array of route definitions
 */
export function getAllRoutes() {
  return [
    { path: '/health', handler: healthRoutes },
    { path: '/api/auth', router: authRoutes },
    // { path: '/api/posts', router: postRoutes },
    // Add more routes here as your app grows
    // { path: '/api/users', router: userRoutes },
  ];
}
