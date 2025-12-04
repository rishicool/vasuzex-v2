/**
 * Upload Manager
 * Laravel Filesystem pattern for file uploads
 * 
 * Manages file uploads through multiple drivers (local, s3, spaces).
 * Includes validation, security scanning, and image processing.
 * 
 * @example
 * import { Upload } from '#framework';
 * 
 * // Upload single file
 * const result = await Upload.upload(file, {
 *   disk: 'local',
 *   path: 'uploads/images',
 *   validate: {
 *     maxSize: 5242880, // 5MB
 *     allowedTypes: ['image/jpeg', 'image/png']
 *   }
 * });
 * 
 * // Upload with image processing
 * const processed = await Upload.upload(file, {
 *   disk: 's3',
 *   path: 'products',
 *   process: {
 *     resize: { width: 800, height: 600 },
 *     thumbnails: [
 *       { width: 200, height: 200, suffix: '_thumb' },
 *       { width: 400, height: 400, suffix: '_medium' }
 *     ]
 *   }
 * });
 * 
 * // Multiple files
 * const results = await Upload.uploadMultiple(files, options);
 * 
 * // Get URL
 * const url = Upload.url('uploads/image.jpg');
 * 
 * // Delete file
 * await Upload.delete('uploads/image.jpg');
 */

export class UploadManager {
  constructor(app) {
    this.app = app;
    this.drivers = {};
    this.customCreators = {};
    this.validator = null;
    this.processor = null;
    this.scanner = null;
  }

  /**
   * Get disk instance
   */
  disk(name = null) {
    name = name || this.getDefaultDisk();

    if (!this.drivers[name]) {
      this.drivers[name] = this.resolve(name);
    }

    return this.drivers[name];
  }

  /**
   * Resolve disk driver
   * @private
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config || !config.driver) {
      throw new Error(`Disk [${name}] is not configured.`);
    }

    const driver = config.driver;

    if (this.customCreators[driver]) {
      return this.customCreators[driver](this.app, config);
    }

    const method = `create${this.capitalize(driver)}Driver`;
    
    if (typeof this[method] === 'function') {
      return this[method](config);
    }

    throw new Error(`Upload driver [${driver}] is not supported.`);
  }

  /**
   * Create Local driver
   * @private
   */
  createLocalDriver(config) {
    const { LocalDriver } = require('./Drivers/LocalDriver.js');
    return new LocalDriver(config);
  }

  /**
   * Create S3 driver
   * @private
   */
  createS3Driver(config) {
    const { S3Driver } = require('./Drivers/S3Driver.js');
    return new S3Driver(config);
  }

  /**
   * Create DigitalOcean Spaces driver
   * @private
   */
  createSpacesDriver(config) {
    const { DigitalOceanSpacesDriver } = require('./Drivers/DigitalOceanSpacesDriver.js');
    return new DigitalOceanSpacesDriver(config);
  }

  /**
   * Upload single file
   * 
   * @param {Object|Buffer|string} file - File object, buffer, or base64 string
   * @param {Object} options - Upload options
   * @param {string} options.disk - Disk name (default: config default)
   * @param {string} options.path - Upload path
   * @param {string} options.filename - Custom filename (optional)
   * @param {Object} options.validate - Validation rules
   * @param {Object} options.process - Image processing options
   * @param {boolean} options.scan - Enable security scanning (default: true)
   * @param {Object} options.metadata - Custom metadata
   * 
   * @returns {Promise<Object>} Upload result with path, url, size, etc.
   */
  async upload(file, options = {}) {
    const disk = this.disk(options.disk);
    
    // Parse file input
    const fileData = await this.parseFile(file);

    // Validate file
    if (options.validate !== false) {
      await this.validateFile(fileData, options.validate || {});
    }

    // Security scan
    if (options.scan !== false && this.app.config('upload.security.scan', false)) {
      await this.scanFile(fileData);
    }

    // Process image if needed
    let processedBuffer = fileData.buffer;
    let thumbnails = [];

    if (options.process && this.isImage(fileData.mimetype)) {
      const processed = await this.processImage(fileData.buffer, options.process);
      processedBuffer = processed.main;
      thumbnails = processed.thumbnails || [];
    }

    // Generate filename
    const filename = options.filename || this.generateFilename(fileData);
    const filepath = options.path ? `${options.path}/${filename}` : filename;

    // Upload main file
    const result = await disk.upload(processedBuffer, filepath, {
      mimetype: fileData.mimetype,
      metadata: options.metadata || {}
    });

    // Upload thumbnails
    const thumbnailResults = [];
    for (const thumb of thumbnails) {
      const thumbPath = this.generateThumbnailPath(filepath, thumb.suffix);
      const thumbResult = await disk.upload(thumb.buffer, thumbPath, {
        mimetype: fileData.mimetype,
        metadata: { ...options.metadata, thumbnail: true }
      });
      thumbnailResults.push(thumbResult);
    }

    return {
      ...result,
      thumbnails: thumbnailResults,
      disk: options.disk || this.getDefaultDisk()
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files, options = {}) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.upload(files[i], {
          ...options,
          filename: options.filenames?.[i]
        });
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    return {
      results,
      errors,
      success: errors.length === 0
    };
  }

  /**
   * Delete file
   */
  async delete(path, disk = null) {
    return await this.disk(disk).delete(path);
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(paths, disk = null) {
    const diskInstance = this.disk(disk);
    const results = await Promise.allSettled(
      paths.map(path => diskInstance.delete(path))
    );
    
    return {
      deleted: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }

  /**
   * Check if file exists
   */
  async exists(path, disk = null) {
    return await this.disk(disk).exists(path);
  }

  /**
   * Get file URL
   */
  url(path, disk = null) {
    return this.disk(disk).url(path);
  }

  /**
   * Get file metadata
   */
  async getMetadata(path, disk = null) {
    return await this.disk(disk).getMetadata(path);
  }

  /**
   * Download file
   */
  async download(path, disk = null) {
    return await this.disk(disk).download(path);
  }

  /**
   * Copy file
   */
  async copy(from, to, disk = null) {
    const diskInstance = this.disk(disk);
    const file = await diskInstance.download(from);
    return await diskInstance.upload(file, to);
  }

  /**
   * Move file
   */
  async move(from, to, disk = null) {
    await this.copy(from, to, disk);
    await this.delete(from, disk);
    return true;
  }

  /**
   * Parse file input (handles Buffer, base64, file object)
   * @private
   */
  async parseFile(file) {
    // Buffer
    if (Buffer.isBuffer(file)) {
      return {
        buffer: file,
        size: file.length,
        mimetype: 'application/octet-stream',
        originalname: 'file'
      };
    }

    // Base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      const matches = file.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const buffer = Buffer.from(matches[2], 'base64');
        return {
          buffer,
          size: buffer.length,
          mimetype: matches[1],
          originalname: 'file'
        };
      }
    }

    // File object (from multer or similar)
    if (file.buffer) {
      return {
        buffer: file.buffer,
        size: file.size,
        mimetype: file.mimetype,
        originalname: file.originalname
      };
    }

    throw new Error('Invalid file input. Expected Buffer, base64 string, or file object.');
  }

  /**
   * Validate file
   * @private
   */
  async validateFile(fileData, rules) {
    if (!this.validator) {
      const { FileValidator } = await import('./FileValidator.js');
      this.validator = new FileValidator(this.app);
    }

    return await this.validator.validate(fileData, rules);
  }

  /**
   * Scan file for security threats
   * @private
   */
  async scanFile(fileData) {
    if (!this.scanner) {
      const { SecurityScanner } = await import('./SecurityScanner.js');
      this.scanner = new SecurityScanner(this.app);
    }

    return await this.scanner.scan(fileData);
  }

  /**
   * Process image
   * @private
   */
  async processImage(buffer, options) {
    if (!this.processor) {
      const { ImageProcessor } = await import('./ImageProcessor.js');
      this.processor = new ImageProcessor(this.app);
    }

    return await this.processor.process(buffer, options);
  }

  /**
   * Check if MIME type is image
   * @private
   */
  isImage(mimetype) {
    return mimetype && mimetype.startsWith('image/');
  }

  /**
   * Generate unique filename
   * @private
   */
  generateFilename(fileData) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = this.getExtension(fileData.originalname || fileData.mimetype);
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Get file extension
   * @private
   */
  getExtension(filename) {
    if (filename.includes('.')) {
      return filename.substring(filename.lastIndexOf('.'));
    }
    return '';
  }

  /**
   * Generate thumbnail path
   * @private
   */
  generateThumbnailPath(originalPath, suffix) {
    const lastDot = originalPath.lastIndexOf('.');
    if (lastDot === -1) {
      return `${originalPath}${suffix}`;
    }
    return `${originalPath.substring(0, lastDot)}${suffix}${originalPath.substring(lastDot)}`;
  }

  /**
   * Get available disks
   */
  availableDisks() {
    const disks = this.app.config('upload.disks', {});
    return Object.keys(disks);
  }

  /**
   * Register custom driver creator
   */
  extend(driver, creator) {
    this.customCreators[driver] = creator;
    return this;
  }

  /**
   * Get config
   * @private
   */
  getConfig(name) {
    const disks = this.app.config('upload.disks', {});
    return disks[name];
  }

  /**
   * Get default disk
   * @private
   */
  getDefaultDisk() {
    return this.app.config('upload.default', 'local');
  }

  /**
   * Capitalize
   * @private
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default UploadManager;
