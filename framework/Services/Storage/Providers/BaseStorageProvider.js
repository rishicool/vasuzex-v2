/**
 * Base Storage Provider
 * Interface for all storage providers (local, S3, etc.)
 */

export class BaseStorageProvider {
  /**
   * Put file contents
   * @param {string} path - File path
   * @param {Buffer|string} contents - File contents
   * @param {Object} options - Additional options
   * @returns {Promise<string>} File path
   */
  async put(path, contents, options = {}) {
    throw new Error('Method put() must be implemented');
  }

  /**
   * Get file contents
   * @param {string} path - File path
   * @returns {Promise<Buffer>}
   */
  async get(path) {
    throw new Error('Method get() must be implemented');
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    throw new Error('Method exists() must be implemented');
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @returns {Promise<boolean>}
   */
  async delete(path) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Get file URL
   * @param {string} path - File path
   * @returns {Promise<string>}
   */
  async url(path) {
    throw new Error('Method url() must be implemented');
  }

  /**
   * Get file size
   * @param {string} path - File path
   * @returns {Promise<number>}
   */
  async size(path) {
    throw new Error('Method size() must be implemented');
  }

  /**
   * List files in directory
   * @param {string} directory - Directory path
   * @returns {Promise<string[]>}
   */
  async files(directory = '') {
    throw new Error('Method files() must be implemented');
  }

  /**
   * Copy file
   * @param {string} from - Source path
   * @param {string} to - Destination path
   * @returns {Promise<boolean>}
   */
  async copy(from, to) {
    throw new Error('Method copy() must be implemented');
  }

  /**
   * Move file
   * @param {string} from - Source path
   * @param {string} to - Destination path
   * @returns {Promise<boolean>}
   */
  async move(from, to) {
    throw new Error('Method move() must be implemented');
  }
}

export default BaseStorageProvider;
