/**
 * Database Module Entry Point
 * Provides database connection and utilities
 */

// Export all models (named exports, not default)
export { User } from './models/User.js';
export { Post } from './models/Post.js';
export { Comment } from './models/Comment.js';
export { Task } from './models/Task.js';

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
