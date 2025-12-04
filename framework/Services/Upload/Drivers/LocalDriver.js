/**
 * Local Disk Driver
 * 
 * Stores files on local filesystem.
 * 
 * @example
 * const driver = new LocalDriver({
 *   root: '/var/www/storage',
 *   url: 'https://example.com/storage',
 *   visibility: 'public'
 * });
 * 
 * await driver.upload(buffer, 'uploads/file.jpg');
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export class LocalDriver {
  constructor(config) {
    this.config = config;
    this.root = config.root || './storage';
    this.baseUrl = config.url || '';
    this.visibility = config.visibility || 'public';
  }

  /**
   * Upload file
   */
  async upload(buffer, filepath, options = {}) {
    const fullPath = this.getFullPath(filepath);
    
    // Create directory if not exists
    await this.ensureDirectory(path.dirname(fullPath));

    // Write file
    await fs.writeFile(fullPath, buffer);

    // Set permissions based on visibility
    if (this.visibility === 'public') {
      await fs.chmod(fullPath, 0o644);
    } else {
      await fs.chmod(fullPath, 0o600);
    }

    // Get file stats
    const stats = await fs.stat(fullPath);

    return {
      path: filepath,
      url: this.url(filepath),
      size: stats.size,
      mimetype: options.mimetype,
      driver: 'local'
    };
  }

  /**
   * Delete file
   */
  async delete(filepath) {
    const fullPath = this.getFullPath(filepath);
    
    if (!existsSync(fullPath)) {
      return false;
    }

    await fs.unlink(fullPath);
    return true;
  }

  /**
   * Check if file exists
   */
  async exists(filepath) {
    const fullPath = this.getFullPath(filepath);
    return existsSync(fullPath);
  }

  /**
   * Get file URL
   */
  url(filepath) {
    if (this.baseUrl) {
      return `${this.baseUrl}/${filepath}`;
    }
    return filepath;
  }

  /**
   * Get file metadata
   */
  async getMetadata(filepath) {
    const fullPath = this.getFullPath(filepath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    const stats = await fs.stat(fullPath);

    return {
      path: filepath,
      size: stats.size,
      lastModified: stats.mtime,
      created: stats.birthtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  }

  /**
   * Download file (get buffer)
   */
  async download(filepath) {
    const fullPath = this.getFullPath(filepath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    return await fs.readFile(fullPath);
  }

  /**
   * List files in directory
   */
  async listFiles(directory = '') {
    const fullPath = this.getFullPath(directory);
    
    if (!existsSync(fullPath)) {
      return [];
    }

    const files = await fs.readdir(fullPath, { withFileTypes: true });
    
    return files.map(file => ({
      name: file.name,
      path: directory ? `${directory}/${file.name}` : file.name,
      isFile: file.isFile(),
      isDirectory: file.isDirectory()
    }));
  }

  /**
   * Get full filesystem path
   * @private
   */
  getFullPath(filepath) {
    return path.join(this.root, filepath);
  }

  /**
   * Ensure directory exists
   * @private
   */
  async ensureDirectory(dir) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

export default LocalDriver;
