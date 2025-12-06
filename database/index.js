/**
 * Database Module Entry Point
 * Provides database connection and utilities
 */

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
