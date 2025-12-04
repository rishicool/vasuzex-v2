/**
 * File Validator
 * 
 * Validates uploaded files against rules.
 * 
 * @example
 * const validator = new FileValidator(app);
 * 
 * await validator.validate(fileData, {
 *   maxSize: 5242880, // 5MB
 *   minSize: 1024, // 1KB
 *   allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
 *   allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
 *   dimensions: {
 *     minWidth: 100,
 *     maxWidth: 4000,
 *     minHeight: 100,
 *     maxHeight: 4000
 *   }
 * });
 */

export class FileValidator {
  constructor(app) {
    this.app = app;
  }

  /**
   * Validate file
   */
  async validate(fileData, rules = {}) {
    const errors = [];

    // Max size
    if (rules.maxSize && fileData.size > rules.maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatBytes(rules.maxSize)}`);
    }

    // Min size
    if (rules.minSize && fileData.size < rules.minSize) {
      errors.push(`File size is below minimum required size of ${this.formatBytes(rules.minSize)}`);
    }

    // Allowed MIME types
    if (rules.allowedTypes && !rules.allowedTypes.includes(fileData.mimetype)) {
      errors.push(`File type ${fileData.mimetype} is not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`);
    }

    // Blocked MIME types
    if (rules.blockedTypes && rules.blockedTypes.includes(fileData.mimetype)) {
      errors.push(`File type ${fileData.mimetype} is blocked`);
    }

    // Allowed extensions
    if (rules.allowedExtensions) {
      const ext = this.getExtension(fileData.originalname);
      if (!rules.allowedExtensions.includes(ext)) {
        errors.push(`File extension ${ext} is not allowed. Allowed extensions: ${rules.allowedExtensions.join(', ')}`);
      }
    }

    // Blocked extensions
    if (rules.blockedExtensions) {
      const ext = this.getExtension(fileData.originalname);
      if (rules.blockedExtensions.includes(ext)) {
        errors.push(`File extension ${ext} is blocked`);
      }
    }

    // Image dimensions (if image)
    if (rules.dimensions && this.isImage(fileData.mimetype)) {
      await this.validateDimensions(fileData.buffer, rules.dimensions, errors);
    }

    // Custom validator
    if (rules.customValidator && typeof rules.customValidator === 'function') {
      try {
        await rules.customValidator(fileData);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('File validation failed', errors);
    }

    return true;
  }

  /**
   * Validate image dimensions
   * @private
   */
  async validateDimensions(buffer, rules, errors) {
    try {
      const sharp = await import('sharp');
      const metadata = await sharp.default(buffer).metadata();

      if (rules.minWidth && metadata.width < rules.minWidth) {
        errors.push(`Image width ${metadata.width}px is below minimum ${rules.minWidth}px`);
      }

      if (rules.maxWidth && metadata.width > rules.maxWidth) {
        errors.push(`Image width ${metadata.width}px exceeds maximum ${rules.maxWidth}px`);
      }

      if (rules.minHeight && metadata.height < rules.minHeight) {
        errors.push(`Image height ${metadata.height}px is below minimum ${rules.minHeight}px`);
      }

      if (rules.maxHeight && metadata.height > rules.maxHeight) {
        errors.push(`Image height ${metadata.height}px exceeds maximum ${rules.maxHeight}px`);
      }

      if (rules.aspectRatio) {
        const ratio = metadata.width / metadata.height;
        const expectedRatio = rules.aspectRatio;
        const tolerance = rules.aspectRatioTolerance || 0.01;

        if (Math.abs(ratio - expectedRatio) > tolerance) {
          errors.push(`Image aspect ratio ${ratio.toFixed(2)} does not match expected ${expectedRatio}`);
        }
      }

      if (rules.exactWidth && metadata.width !== rules.exactWidth) {
        errors.push(`Image width must be exactly ${rules.exactWidth}px`);
      }

      if (rules.exactHeight && metadata.height !== rules.exactHeight) {
        errors.push(`Image height must be exactly ${rules.exactHeight}px`);
      }

    } catch (error) {
      errors.push(`Failed to validate image dimensions: ${error.message}`);
    }
  }

  /**
   * Check if MIME type is image
   * @private
   */
  isImage(mimetype) {
    return mimetype && mimetype.startsWith('image/');
  }

  /**
   * Get file extension
   * @private
   */
  getExtension(filename) {
    if (!filename || !filename.includes('.')) {
      return '';
    }
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Format bytes to human-readable
   * @private
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Preset validation rules
   */
  static presets = {
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },

    avatar: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png'],
      allowedExtensions: ['.jpg', '.jpeg', '.png'],
      dimensions: {
        minWidth: 100,
        minHeight: 100,
        maxWidth: 2000,
        maxHeight: 2000
      }
    },

    document: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.pdf', '.doc', '.docx']
    },

    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
      allowedExtensions: ['.mp4', '.mpeg', '.mov', '.webm']
    },

    audio: {
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      allowedExtensions: ['.mp3', '.wav', '.ogg']
    }
  };

  /**
   * Get preset rules
   */
  static getPreset(name) {
    return this.presets[name] || {};
  }
}

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export default FileValidator;
