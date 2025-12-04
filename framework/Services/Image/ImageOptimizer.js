/**
 * Image Optimizer
 * 
 * Optimize images for web delivery with compression, format conversion,
 * and metadata management.
 * 
 * @example
 * import { ImageOptimizer } from '#framework';
 * 
 * const optimizer = new ImageOptimizer(app);
 * 
 * // Optimize single image
 * await optimizer.optimize('./photo.jpg', {
 *   quality: 80,
 *   stripMetadata: true
 * });
 * 
 * // Convert to WebP
 * await optimizer.toWebP('./photo.jpg', { quality: 85 });
 * 
 * // Batch optimize
 * await optimizer.batchOptimize(['img1.jpg', 'img2.jpg'], {
 *   quality: 80
 * });
 */

export class ImageOptimizer {
  constructor(app) {
    this.app = app;
    this.sharp = null;
  }

  /**
   * Get Sharp instance (lazy loading)
   * @private
   */
  async getSharp() {
    if (!this.sharp) {
      const sharpModule = await import('sharp');
      this.sharp = sharpModule.default;
    }
    return this.sharp;
  }

  /**
   * Optimize image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Optimization options
   * @param {number} options.quality - Quality (1-100)
   * @param {boolean} options.progressive - Progressive/interlaced
   * @param {boolean} options.stripMetadata - Remove EXIF/metadata
   * @param {number} options.compressionLevel - PNG compression (0-9)
   * @param {boolean} options.lossless - WebP lossless mode
   * @param {string} options.output - Output path
   */
  async optimize(input, options = {}) {
    const sharp = await this.getSharp();
    const metadata = await sharp(input).metadata();
    let image = sharp(input);

    // Auto-orient based on EXIF
    image = image.rotate();

    // Strip metadata if requested
    if (options.stripMetadata !== false) {
      image = image.withMetadata({
        orientation: undefined,
        exif: undefined,
        icc: undefined,
      });
    }

    // Apply format-specific optimization
    const quality = options.quality || this.getDefaultQuality(metadata.format);
    const progressive = options.progressive !== false;

    switch (metadata.format) {
      case 'jpeg':
        image = image.jpeg({
          quality,
          progressive,
          mozjpeg: true,
          optimiseScans: true,
          trellisQuantisation: true,
          overshootDeringing: true,
        });
        break;

      case 'png':
        image = image.png({
          compressionLevel: options.compressionLevel || 9,
          progressive,
          quality,
          palette: true,
        });
        break;

      case 'webp':
        image = image.webp({
          quality,
          lossless: options.lossless || false,
          nearLossless: !options.lossless,
          smartSubsample: true,
        });
        break;

      case 'avif':
        image = image.avif({
          quality,
          lossless: options.lossless || false,
        });
        break;

      case 'gif':
        image = image.gif({
          progressive,
        });
        break;
    }

    if (options.output) {
      await image.toFile(options.output);
      
      // Return compression stats
      const fs = await import('fs/promises');
      const originalSize = Buffer.isBuffer(input) 
        ? input.length 
        : (await fs.stat(input)).size;
      const optimizedSize = (await fs.stat(options.output)).size;
      
      return {
        originalSize,
        optimizedSize,
        savings: originalSize - optimizedSize,
        savingsPercent: ((originalSize - optimizedSize) / originalSize * 100).toFixed(2),
      };
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Convert to WebP
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Conversion options
   */
  async toWebP(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.rotate().webp({
      quality: options.quality || 85,
      lossless: options.lossless || false,
      nearLossless: !options.lossless,
      smartSubsample: true,
      effort: options.effort || 4,
    });

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Convert to AVIF
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Conversion options
   */
  async toAVIF(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.rotate().avif({
      quality: options.quality || 85,
      lossless: options.lossless || false,
      effort: options.effort || 4,
    });

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Lossless optimization
   * Optimize without quality loss
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   */
  async lossless(input, options = {}) {
    const sharp = await this.getSharp();
    const metadata = await sharp(input).metadata();
    let image = sharp(input);

    image = image.rotate();

    switch (metadata.format) {
      case 'jpeg':
        // For JPEG, convert to PNG for lossless
        image = image.png({
          compressionLevel: 9,
          palette: true,
        });
        break;

      case 'png':
        image = image.png({
          compressionLevel: 9,
          palette: true,
        });
        break;

      case 'webp':
        image = image.webp({
          lossless: true,
          effort: 6,
        });
        break;

      case 'avif':
        image = image.avif({
          lossless: true,
        });
        break;
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Aggressive optimization (maximum compression)
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   */
  async aggressive(input, options = {}) {
    return await this.optimize(input, {
      quality: options.quality || 60,
      progressive: true,
      stripMetadata: true,
      compressionLevel: 9,
      ...options,
    });
  }

  /**
   * Batch optimize images
   * 
   * @param {Array<string|Buffer>} inputs - Array of images
   * @param {Object} options - Optimization options
   * @param {Function} outputCallback - Callback to generate output paths
   */
  async batchOptimize(inputs, options = {}, outputCallback = null) {
    const results = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      let output = options.output;

      if (outputCallback && !output) {
        output = outputCallback(input, i);
      } else if (!output && typeof input === 'string') {
        output = this.generateOptimizedPath(input);
      }

      try {
        const result = await this.optimize(input, {
          ...options,
          output,
        });

        results.push({
          input,
          output,
          ...result,
          success: true,
        });
      } catch (error) {
        results.push({
          input,
          error: error.message,
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * Convert multiple images to WebP
   * 
   * @param {Array<string>} inputs - Image paths
   * @param {Object} options - Conversion options
   */
  async batchToWebP(inputs, options = {}) {
    const results = [];

    for (const input of inputs) {
      const output = options.output || this.replaceExtension(input, '.webp');

      try {
        await this.toWebP(input, { ...options, output });
        results.push({ input, output, success: true });
      } catch (error) {
        results.push({ input, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Smart optimization based on image characteristics
   * Analyzes image and applies optimal settings
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   */
  async smartOptimize(input, options = {}) {
    const sharp = await this.getSharp();
    const metadata = await sharp(input).metadata();
    const stats = await sharp(input).stats();

    // Determine optimal quality based on image characteristics
    let quality = options.quality;

    if (!quality) {
      // High detail images need higher quality
      const isDetailed = stats.channels.some(ch => ch.stdev > 50);
      
      // Large images can use lower quality
      const isLarge = metadata.width > 2000 || metadata.height > 2000;

      if (isDetailed && !isLarge) {
        quality = 85;
      } else if (isDetailed && isLarge) {
        quality = 80;
      } else if (!isDetailed && isLarge) {
        quality = 70;
      } else {
        quality = 75;
      }
    }

    // Choose optimal format
    let format = options.format || metadata.format;

    if (options.modernFormats && metadata.format !== 'gif') {
      // Convert to WebP for better compression
      format = 'webp';
    }

    let image = sharp(input).rotate();

    // Apply optimization
    switch (format) {
      case 'jpeg':
        image = image.jpeg({
          quality,
          progressive: true,
          mozjpeg: true,
        });
        break;

      case 'png':
        image = image.png({
          quality,
          compressionLevel: 9,
          palette: metadata.channels === 4, // Use palette for images with alpha
        });
        break;

      case 'webp':
        image = image.webp({
          quality,
          nearLossless: true,
          smartSubsample: true,
        });
        break;
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Strip metadata from image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   */
  async stripMetadata(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.withMetadata({
      orientation: undefined,
      exif: undefined,
      icc: undefined,
      xmp: undefined,
      iptc: undefined,
    });

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Get optimization statistics
   * 
   * @param {string|Buffer} original - Original image
   * @param {string|Buffer} optimized - Optimized image
   */
  async getStats(original, optimized) {
    const sharp = await this.getSharp();
    const fs = await import('fs/promises');

    const originalSize = Buffer.isBuffer(original)
      ? original.length
      : (await fs.stat(original)).size;

    const optimizedSize = Buffer.isBuffer(optimized)
      ? optimized.length
      : (await fs.stat(optimized)).size;

    const originalMeta = await sharp(original).metadata();
    const optimizedMeta = await sharp(optimized).metadata();

    return {
      original: {
        size: originalSize,
        format: originalMeta.format,
        width: originalMeta.width,
        height: originalMeta.height,
      },
      optimized: {
        size: optimizedSize,
        format: optimizedMeta.format,
        width: optimizedMeta.width,
        height: optimizedMeta.height,
      },
      savings: originalSize - optimizedSize,
      savingsPercent: ((originalSize - optimizedSize) / originalSize * 100).toFixed(2),
      compression: (optimizedSize / originalSize * 100).toFixed(2),
    };
  }

  /**
   * Get default quality for format
   * @private
   */
  getDefaultQuality(format) {
    const defaults = {
      jpeg: 80,
      png: 80,
      webp: 85,
      avif: 85,
      gif: 80,
    };

    return defaults[format] || 80;
  }

  /**
   * Generate optimized output path
   * @private
   */
  generateOptimizedPath(input) {
    const path = require('path');
    const ext = path.extname(input);
    const base = path.basename(input, ext);
    const dir = path.dirname(input);
    
    return path.join(dir, `${base}_optimized${ext}`);
  }

  /**
   * Replace file extension
   * @private
   */
  replaceExtension(filepath, newExt) {
    const path = require('path');
    const ext = path.extname(filepath);
    return filepath.replace(ext, newExt);
  }
}

export default ImageOptimizer;
