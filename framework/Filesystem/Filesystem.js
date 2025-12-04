/**
 * Filesystem
 * Laravel-inspired filesystem operations
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class Filesystem {
  /**
   * Check if file/directory exists
   */
  exists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Check if file/directory is missing
   */
  missing(filePath) {
    return !this.exists(filePath);
  }

  /**
   * Get file contents
   */
  get(filePath, throwError = true) {
    if (this.isFile(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }

    if (throwError) {
      throw new Error(`File does not exist at path ${filePath}`);
    }

    return null;
  }

  /**
   * Get JSON file contents
   */
  getJson(filePath) {
    const contents = this.get(filePath);
    return JSON.parse(contents);
  }

  /**
   * Require a file
   */
  getRequire(filePath) {
    if (this.isFile(filePath)) {
      return require(filePath);
    }

    throw new Error(`File does not exist at path ${filePath}`);
  }

  /**
   * Get file hash (MD5)
   */
  hash(filePath) {
    const contents = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(contents).digest('hex');
  }

  /**
   * Write contents to file
   */
  put(filePath, contents, lock = false) {
    const dir = path.dirname(filePath);
    
    if (!this.exists(dir)) {
      this.makeDirectory(dir, 0o755, true);
    }

    fs.writeFileSync(filePath, contents);
    return true;
  }

  /**
   * Write contents atomically
   */
  replace(filePath, contents) {
    const dir = path.dirname(filePath);
    const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp`);

    fs.writeFileSync(tempPath, contents);
    fs.renameSync(tempPath, filePath);
  }

  /**
   * Prepend to file
   */
  prepend(filePath, data) {
    if (this.exists(filePath)) {
      const existing = this.get(filePath);
      return this.put(filePath, data + existing);
    }

    return this.put(filePath, data);
  }

  /**
   * Append to file
   */
  append(filePath, data) {
    fs.appendFileSync(filePath, data);
    return true;
  }

  /**
   * Delete file(s)
   */
  delete(paths) {
    const pathsArray = Array.isArray(paths) ? paths : [paths];
    let success = true;

    for (const filePath of pathsArray) {
      try {
        if (this.exists(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        success = false;
      }
    }

    return success;
  }

  /**
   * Move file
   */
  move(source, target) {
    fs.renameSync(source, target);
    return true;
  }

  /**
   * Copy file
   */
  copy(source, target) {
    fs.copyFileSync(source, target);
    return true;
  }

  /**
   * Get file name
   */
  name(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Get file basename
   */
  basename(filePath) {
    return path.basename(filePath);
  }

  /**
   * Get directory name
   */
  dirname(filePath) {
    return path.dirname(filePath);
  }

  /**
   * Get file extension
   */
  extension(filePath) {
    return path.extname(filePath).substring(1);
  }

  /**
   * Get file type (MIME)
   */
  type(filePath) {
    // Simple MIME type detection
    const ext = this.extension(filePath);
    const mimeTypes = {
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get file size
   */
  size(filePath) {
    return fs.statSync(filePath).size;
  }

  /**
   * Get last modified time
   */
  lastModified(filePath) {
    return fs.statSync(filePath).mtimeMs;
  }

  /**
   * Check if path is directory
   */
  isDirectory(filePath) {
    return this.exists(filePath) && fs.statSync(filePath).isDirectory();
  }

  /**
   * Check if path is file
   */
  isFile(filePath) {
    return this.exists(filePath) && fs.statSync(filePath).isFile();
  }

  /**
   * Check if file is readable
   */
  isReadable(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if file is writable
   */
  isWritable(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.W_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all files in directory
   */
  files(directory, recursive = false) {
    if (!this.isDirectory(directory)) {
      return [];
    }

    if (!recursive) {
      return fs.readdirSync(directory)
        .map(file => path.join(directory, file))
        .filter(file => this.isFile(file));
    }

    return this.allFiles(directory);
  }

  /**
   * Get all files recursively
   */
  allFiles(directory) {
    let files = [];

    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);

      if (this.isDirectory(fullPath)) {
        files = files.concat(this.allFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Get all directories
   */
  directories(directory) {
    if (!this.isDirectory(directory)) {
      return [];
    }

    return fs.readdirSync(directory)
      .map(dir => path.join(directory, dir))
      .filter(dir => this.isDirectory(dir));
  }

  /**
   * Create directory
   */
  makeDirectory(dirPath, mode = 0o755, recursive = false) {
    if (recursive) {
      fs.mkdirSync(dirPath, { recursive: true, mode });
    } else {
      fs.mkdirSync(dirPath, { mode });
    }

    return true;
  }

  /**
   * Move directory
   */
  moveDirectory(from, to, overwrite = false) {
    if (overwrite && this.exists(to)) {
      this.deleteDirectory(to);
    }

    return this.move(from, to);
  }

  /**
   * Copy directory
   */
  copyDirectory(from, to) {
    if (!this.isDirectory(from)) {
      return false;
    }

    this.makeDirectory(to, 0o755, true);

    const items = fs.readdirSync(from);

    for (const item of items) {
      const source = path.join(from, item);
      const target = path.join(to, item);

      if (this.isDirectory(source)) {
        this.copyDirectory(source, target);
      } else {
        this.copy(source, target);
      }
    }

    return true;
  }

  /**
   * Delete directory
   */
  deleteDirectory(directory, preserve = false) {
    if (!this.isDirectory(directory)) {
      return false;
    }

    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);

      if (this.isDirectory(fullPath)) {
        this.deleteDirectory(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }

    if (!preserve) {
      fs.rmdirSync(directory);
    }

    return true;
  }

  /**
   * Empty directory contents
   */
  cleanDirectory(directory) {
    return this.deleteDirectory(directory, true);
  }

  /**
   * Get file glob pattern matches
   */
  glob(pattern, flags = 0) {
    const glob = require('glob');
    return glob.sync(pattern, { nodir: true });
  }

  /**
   * Chmod file/directory
   */
  chmod(filePath, mode = null) {
    if (mode !== null) {
      fs.chmodSync(filePath, mode);
      return true;
    }

    return fs.statSync(filePath).mode;
  }
}

export default Filesystem;
