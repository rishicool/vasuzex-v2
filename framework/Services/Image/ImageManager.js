/**
 * Image Manager
 * Laravel-style image manipulation service
 * 
 * Provides comprehensive image manipulation capabilities using Sharp.
 * 
 * @example
 * import { Image } from '#framework';
 * 
 * // Resize image
 * const resized = await Image.resize('./photo.jpg', {
 *   width: 800,
 *   height: 600
 * });
 * 
 * // Create thumbnail
 * const thumb = await Image.thumbnail('./photo.jpg', 200, 200);
 * 
 * // Optimize image
 * const optimized = await Image.optimize('./photo.jpg', { quality: 80 });
 * 
 * // Batch process
 * await Image.batch(['img1.jpg', 'img2.jpg'], {
 *   resize: { width: 1200 },
 *   optimize: true
 * });
 */

export class ImageManager {
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
   * Resize image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Resize options
   * @param {number} options.width - Target width
   * @param {number} options.height - Target height
   * @param {string} options.fit - Fit mode (cover, contain, fill, inside, outside)
   * @param {string} options.position - Position (center, top, bottom, left, right)
   * @param {Object} options.background - Background color
   * @param {string} options.output - Output path (optional)
   * 
   * @returns {Promise<Buffer|void>} Buffer if no output path, void otherwise
   */
  async resize(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    const resizeOptions = {
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover',
      position: options.position || 'center',
      background: options.background || { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: options.withoutEnlargement || false,
    };

    image = image.resize(resizeOptions);

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Crop image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Crop options
   * @param {number} options.x - X coordinate
   * @param {number} options.y - Y coordinate
   * @param {number} options.width - Crop width
   * @param {number} options.height - Crop height
   * @param {string} options.output - Output path (optional)
   */
  async crop(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.extract({
      left: options.x || 0,
      top: options.y || 0,
      width: options.width,
      height: options.height,
    });

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Rotate image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {number} angle - Rotation angle (degrees)
   * @param {Object} options - Additional options
   */
  async rotate(input, angle, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.rotate(angle, {
      background: options.background || { r: 255, g: 255, b: 255, alpha: 1 },
    });

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Flip image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {string} direction - 'horizontal' or 'vertical'
   * @param {Object} options - Additional options
   */
  async flip(input, direction = 'horizontal', options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    if (direction === 'horizontal') {
      image = image.flop();
    } else if (direction === 'vertical') {
      image = image.flip();
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Add watermark to image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} watermark - Watermark options
   * @param {string|Buffer} watermark.image - Watermark image path or buffer
   * @param {string} watermark.position - Position
   * @param {number} watermark.opacity - Opacity (0-1)
   * @param {number} watermark.width - Watermark width
   * @param {number} watermark.height - Watermark height
   * @param {number} watermark.padding - Padding
   */
  async watermark(input, watermarkOptions, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    // Load watermark
    let watermark = sharp(watermarkOptions.image);

    // Resize watermark if specified
    if (watermarkOptions.width || watermarkOptions.height) {
      watermark = watermark.resize({
        width: watermarkOptions.width,
        height: watermarkOptions.height,
        fit: 'inside',
      });
    }

    // Apply opacity
    if (watermarkOptions.opacity && watermarkOptions.opacity < 1) {
      const alpha = Math.round(watermarkOptions.opacity * 255);
      watermark = watermark.composite([{
        input: Buffer.from([255, 255, 255, alpha]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      }]);
    }

    const watermarkBuffer = await watermark.toBuffer();

    // Get position
    const position = this.getWatermarkPosition(
      watermarkOptions.position || 'bottom-right',
      watermarkOptions.padding || 10
    );

    image = image.composite([{
      input: watermarkBuffer,
      gravity: position.gravity,
    }]);

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Get watermark position
   * @private
   */
  getWatermarkPosition(position, padding) {
    const positions = {
      'top-left': { gravity: 'northwest' },
      'top-center': { gravity: 'north' },
      'top-right': { gravity: 'northeast' },
      'center-left': { gravity: 'west' },
      'center': { gravity: 'center' },
      'center-right': { gravity: 'east' },
      'bottom-left': { gravity: 'southwest' },
      'bottom-center': { gravity: 'south' },
      'bottom-right': { gravity: 'southeast' },
    };

    return positions[position] || positions['bottom-right'];
  }

  /**
   * Create thumbnail
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @param {Object} options - Additional options
   */
  async thumbnail(input, width, height, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    image = image.resize({
      width,
      height,
      fit: options.fit || 'cover',
      position: options.position || 'center',
    });

    // Apply quality if specified
    if (options.quality) {
      const metadata = await sharp(input).metadata();
      image = this.applyQuality(image, metadata.format, options.quality);
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Optimize image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Optimization options
   * @param {number} options.quality - Quality (1-100)
   * @param {boolean} options.progressive - Progressive/interlaced
   * @param {boolean} options.stripMetadata - Remove metadata
   * @param {number} options.compressionLevel - PNG compression level (0-9)
   */
  async optimize(input, options = {}) {
    const sharp = await this.getSharp();
    const metadata = await sharp(input).metadata();
    let image = sharp(input);

    // Auto-orient
    image = image.rotate();

    // Strip metadata if requested
    if (options.stripMetadata !== false) {
      image = image.withMetadata({
        orientation: undefined,
      });
    }

    // Apply format-specific optimization
    const quality = options.quality || 80;
    const progressive = options.progressive !== false;

    switch (metadata.format) {
      case 'jpeg':
        image = image.jpeg({
          quality,
          progressive,
          mozjpeg: true,
        });
        break;

      case 'png':
        image = image.png({
          compressionLevel: options.compressionLevel || 9,
          progressive,
          quality,
        });
        break;

      case 'webp':
        image = image.webp({
          quality,
          lossless: options.lossless || false,
        });
        break;

      case 'avif':
        image = image.avif({
          quality,
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
   * Convert image format
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {string} format - Target format (jpeg, png, webp, avif, etc.)
   * @param {Object} options - Conversion options
   */
  async convert(input, format, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    const quality = options.quality || 80;

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality, progressive: true });
        break;

      case 'png':
        image = image.png({ 
          quality,
          compressionLevel: options.compressionLevel || 9,
        });
        break;

      case 'webp':
        image = image.webp({ quality });
        break;

      case 'avif':
        image = image.avif({ quality });
        break;

      case 'tiff':
        image = image.tiff({ quality });
        break;

      case 'gif':
        image = image.gif();
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Apply quality to image
   * @private
   */
  applyQuality(image, format, quality) {
    switch (format) {
      case 'jpeg':
        return image.jpeg({ quality, progressive: true });
      case 'png':
        return image.png({ quality, compressionLevel: 9 });
      case 'webp':
        return image.webp({ quality });
      case 'avif':
        return image.avif({ quality });
      default:
        return image;
    }
  }

  /**
   * Apply filters
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} filters - Filters to apply
   * @param {boolean} filters.grayscale - Convert to grayscale
   * @param {number} filters.blur - Blur amount (0.3-1000)
   * @param {number} filters.sharpen - Sharpen amount
   * @param {number} filters.brightness - Brightness (-1 to 1)
   * @param {number} filters.saturation - Saturation (-1 to 1)
   * @param {boolean} filters.negate - Invert colors
   */
  async filter(input, filters = {}, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    if (filters.grayscale) {
      image = image.grayscale();
    }

    if (filters.blur) {
      image = image.blur(filters.blur);
    }

    if (filters.sharpen) {
      image = image.sharpen(filters.sharpen);
    }

    if (filters.negate) {
      image = image.negate();
    }

    if (filters.brightness || filters.saturation) {
      const modulate = {};
      if (filters.brightness) {
        modulate.brightness = 1 + filters.brightness;
      }
      if (filters.saturation) {
        modulate.saturation = 1 + filters.saturation;
      }
      image = image.modulate(modulate);
    }

    if (options.output) {
      await image.toFile(options.output);
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Get image metadata
   * 
   * @param {string|Buffer} input - Image path or buffer
   */
  async metadata(input) {
    const sharp = await this.getSharp();
    const metadata = await sharp(input).metadata();

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
      isProgressive: metadata.isProgressive,
    };
  }

  /**
   * Batch process images
   * 
   * @param {Array<string|Buffer>} inputs - Array of image paths or buffers
   * @param {Object} operations - Operations to apply
   * @param {Object} operations.resize - Resize options
   * @param {Object} operations.crop - Crop options
   * @param {Object} operations.filters - Filter options
   * @param {boolean} operations.optimize - Enable optimization
   * @param {string} operations.format - Convert format
   * @param {Array<string>} outputs - Output paths (optional)
   */
  async batch(inputs, operations = {}, outputs = []) {
    const results = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const output = outputs[i];

      try {
        const sharp = await this.getSharp();
        let image = sharp(input);

        // Apply operations
        if (operations.resize) {
          image = image.resize(operations.resize);
        }

        if (operations.crop) {
          image = image.extract({
            left: operations.crop.x || 0,
            top: operations.crop.y || 0,
            width: operations.crop.width,
            height: operations.crop.height,
          });
        }

        if (operations.filters) {
          if (operations.filters.grayscale) image = image.grayscale();
          if (operations.filters.blur) image = image.blur(operations.filters.blur);
          if (operations.filters.sharpen) image = image.sharpen(operations.filters.sharpen);
        }

        if (operations.format) {
          image = this.applyFormat(image, operations.format, operations.quality || 80);
        }

        if (operations.optimize) {
          const metadata = await sharp(input).metadata();
          image = this.applyQuality(image, metadata.format, operations.quality || 80);
        }

        if (output) {
          await image.toFile(output);
          results.push({ input, output, success: true });
        } else {
          const buffer = await image.toBuffer();
          results.push({ input, buffer, success: true });
        }
      } catch (error) {
        results.push({ input, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Apply format
   * @private
   */
  applyFormat(image, format, quality) {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return image.jpeg({ quality, progressive: true });
      case 'png':
        return image.png({ quality, compressionLevel: 9 });
      case 'webp':
        return image.webp({ quality });
      case 'avif':
        return image.avif({ quality });
      case 'tiff':
        return image.tiff({ quality });
      case 'gif':
        return image.gif();
      default:
        return image;
    }
  }

  /**
   * Generate responsive images
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Array<number>} widths - Array of widths
   * @param {Object} options - Additional options
   */
  async responsive(input, widths = [320, 640, 1024, 1920], options = {}) {
    const sharp = await this.getSharp();
    const results = [];

    for (const width of widths) {
      let image = sharp(input);
      
      image = image.resize({
        width,
        withoutEnlargement: true,
      });

      if (options.format) {
        image = this.applyFormat(image, options.format, options.quality || 80);
      }

      const buffer = await image.toBuffer();
      const metadata = await sharp(buffer).metadata();

      results.push({
        width: metadata.width,
        height: metadata.height,
        buffer,
        size: buffer.length,
      });
    }

    return results;
  }
}

export default ImageManager;
