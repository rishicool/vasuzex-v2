/**
 * Database Module Entry Point
 * Provides database connection and utilities
 */

// Export all models
export { default as User } from './models/User.js';
export { default as Post } from './models/Post.js';
export { default as Comment } from './models/Comment.js';
export { default as Task } from './models/Task.js';

/**
 * Get database connection instance
 */
export function getDatabase() {
  // Mock database for now - real implementation would use DatabaseManager
  return {
    connection: null,
    query: async () => [],
  };
}

export default {
  getDatabase
};
