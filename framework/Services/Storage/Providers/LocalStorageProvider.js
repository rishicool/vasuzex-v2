/**
 * Local Storage Provider
 * Stores files on local filesystem
 */

import { BaseStorageProvider } from './BaseStorageProvider.js';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export class LocalStorageProvider extends BaseStorageProvider {
  constructor(config = {}) {
    super();
    this.root = config.root || 'storage';
    this.baseUrl = config.url || '';
  }

  /**
   * Get full path
   * @private
   */
  getFullPath(filePath) {
    return path.join(this.root, filePath);
  }

  /**
   * Ensure directory exists
   * @private
   */
  async ensureDirectory(filePath) {
    const dir = path.dirname(this.getFullPath(filePath));
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Put file contents
   */
  async put(filePath, contents, options = {}) {
    await this.ensureDirectory(filePath);
    const fullPath = this.getFullPath(filePath);
    await fs.writeFile(fullPath, contents, options);
    return filePath;
  }

  /**
   * Get file contents
   */
  async get(filePath) {
    const fullPath = this.getFullPath(filePath);
    return await fs.readFile(fullPath);
  }

  /**
   * Check if file exists
   */
  async exists(filePath) {
    const fullPath = this.getFullPath(filePath);
    return existsSync(fullPath);
  }

  /**
   * Delete file
   */
  async delete(filePath) {
    try {
      const fullPath = this.getFullPath(filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file URL
   */
  async url(filePath) {
    return `${this.baseUrl}/${filePath}`;
  }

  /**
   * Get file size
   */
  async size(filePath) {
    const fullPath = this.getFullPath(filePath);
    const stats = await fs.stat(fullPath);
    return stats.size;
  }

  /**
   * List files in directory
   */
  async files(directory = '') {
    const fullPath = this.getFullPath(directory);
    
    if (!existsSync(fullPath)) {
      return [];
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile())
      .map(entry => path.join(directory, entry.name));
  }

  /**
   * Copy file
   */
  async copy(from, to) {
    await this.ensureDirectory(to);
    const fromPath = this.getFullPath(from);
    const toPath = this.getFullPath(to);
    await fs.copyFile(fromPath, toPath);
    return true;
  }

  /**
   * Move file
   */
  async move(from, to) {
    await this.ensureDirectory(to);
    const fromPath = this.getFullPath(from);
    const toPath = this.getFullPath(to);
    await fs.rename(fromPath, toPath);
    return true;
  }
}

export default LocalStorageProvider;
