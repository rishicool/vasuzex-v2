/**
 * Thumbnail Generator
 * 
 * Generate thumbnails in multiple sizes with various options.
 * 
 * @example
 * import { ThumbnailGenerator } from '#framework';
 * 
 * const generator = new ThumbnailGenerator(app);
 * 
 * // Generate single thumbnail
 * await generator.generate('./photo.jpg', {
 *   width: 200,
 *   height: 200,
 *   output: './photo_thumb.jpg'
 * });
 * 
 * // Generate multiple sizes
 * await generator.generateMultiple('./photo.jpg', [
 *   { width: 150, height: 150, suffix: '_small' },
 *   { width: 300, height: 300, suffix: '_medium' },
 *   { width: 600, height: 600, suffix: '_large' }
 * ]);
 */

export class ThumbnailGenerator {
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
   * Generate single thumbnail
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Thumbnail options
   * @param {number} options.width - Width
   * @param {number} options.height - Height
   * @param {string} options.fit - Fit mode (cover, contain, fill)
   * @param {string} options.position - Position
   * @param {number} options.quality - Quality (1-100)
   * @param {string} options.format - Output format
   * @param {string} options.output - Output path
   */
  async generate(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    // Rotate based on EXIF
    image = image.rotate();

    // Resize
    image = image.resize({
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover',
      position: options.position || 'center',
      withoutEnlargement: options.withoutEnlargement || false,
      background: options.background || { r: 255, g: 255, b: 255, alpha: 1 },
    });

    // Format
    if (options.format) {
      image = this.applyFormat(image, options.format, options.quality || 80);
    } else if (options.quality) {
      const metadata = await sharp(input).metadata();
      image = this.applyFormat(image, metadata.format, options.quality);
    }

    if (options.output) {
      await image.toFile(options.output);
      return options.output;
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Generate multiple thumbnail sizes
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Array<Object>} sizes - Array of size options
   * @param {string} baseOutput - Base output path (optional)
   */
  async generateMultiple(input, sizes, baseOutput = null) {
    const results = [];

    for (const size of sizes) {
      let output = size.output;

      // Generate output path if baseOutput provided
      if (baseOutput && !output && typeof input === 'string') {
        output = this.generateOutputPath(input, size.suffix || `_${size.width}x${size.height}`, baseOutput);
      }

      try {
        const result = await this.generate(input, {
          ...size,
          output,
        });

        results.push({
          width: size.width,
          height: size.height,
          output: result,
          success: true,
        });
      } catch (error) {
        results.push({
          width: size.width,
          height: size.height,
          error: error.message,
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * Generate thumbnails with preset sizes
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {string} preset - Preset name
   * @param {string} baseOutput - Base output path (optional)
   */
  async generateFromPreset(input, preset, baseOutput = null) {
    const presets = this.getPresets();
    const sizes = presets[preset];

    if (!sizes) {
      throw new Error(`Unknown preset: ${preset}`);
    }

    return await this.generateMultiple(input, sizes, baseOutput);
  }

  /**
   * Generate smart crop thumbnails
   * Smart crop focuses on most important part of image
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   */
  async generateSmartCrop(input, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(input);

    // Get original dimensions
    const metadata = await image.metadata();

    // Calculate smart crop region
    const targetRatio = options.width / options.height;
    const imageRatio = metadata.width / metadata.height;

    let cropWidth, cropHeight, left, top;

    if (imageRatio > targetRatio) {
      // Image is wider than target
      cropHeight = metadata.height;
      cropWidth = Math.round(cropHeight * targetRatio);
      left = Math.round((metadata.width - cropWidth) / 2);
      top = 0;
    } else {
      // Image is taller than target
      cropWidth = metadata.width;
      cropHeight = Math.round(cropWidth / targetRatio);
      left = 0;
      top = Math.round((metadata.height - cropHeight) / 2);
    }

    // Extract smart crop
    image = image.extract({
      left,
      top,
      width: cropWidth,
      height: cropHeight,
    });

    // Resize to final size
    image = image.resize({
      width: options.width,
      height: options.height,
      fit: 'cover',
    });

    // Apply format
    if (options.format) {
      image = this.applyFormat(image, options.format, options.quality || 80);
    }

    if (options.output) {
      await image.toFile(options.output);
      return options.output;
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Generate circular thumbnail (avatar)
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {number} size - Diameter
   * @param {Object} options - Additional options
   */
  async generateCircular(input, size, options = {}) {
    const sharp = await this.getSharp();
    
    // Create circular mask
    const circle = Buffer.from(
      `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`
    );

    let image = sharp(input)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .composite([{
        input: circle,
        blend: 'dest-in',
      }]);

    // Make background transparent
    image = image.png();

    if (options.output) {
      await image.toFile(options.output);
      return options.output;
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Generate rounded corner thumbnail
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {Object} options - Options
   * @param {number} options.width - Width
   * @param {number} options.height - Height
   * @param {number} options.radius - Corner radius
   */
  async generateRounded(input, options = {}) {
    const sharp = await this.getSharp();
    const width = options.width;
    const height = options.height;
    const radius = options.radius || 10;

    // Create rounded rectangle mask
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></svg>`
    );

    let image = sharp(input)
      .resize(width, height, { fit: 'cover' })
      .composite([{
        input: roundedCorners,
        blend: 'dest-in',
      }]);

    image = image.png();

    if (options.output) {
      await image.toFile(options.output);
      return options.output;
    } else {
      return await image.toBuffer();
    }
  }

  /**
   * Generate aspect ratio thumbnails
   * Maintains specific aspect ratio while fitting within dimensions
   * 
   * @param {string|Buffer} input - Image path or buffer
   * @param {number} width - Max width
   * @param {number} aspectRatio - Aspect ratio (e.g., 16/9, 4/3, 1)
   * @param {Object} options - Additional options
   */
  async generateWithAspectRatio(input, width, aspectRatio, options = {}) {
    const height = Math.round(width / aspectRatio);

    return await this.generate(input, {
      width,
      height,
      fit: options.fit || 'cover',
      ...options,
    });
  }

  /**
   * Batch generate thumbnails from multiple images
   * 
   * @param {Array<string|Buffer>} inputs - Array of images
   * @param {Array<Object>} sizes - Thumbnail sizes
   * @param {Function} outputCallback - Callback to generate output paths
   */
  async batchGenerate(inputs, sizes, outputCallback = null) {
    const results = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const imageResults = [];

      for (const size of sizes) {
        let output = size.output;

        if (outputCallback && !output) {
          output = outputCallback(input, size, i);
        }

        try {
          const result = await this.generate(input, {
            ...size,
            output,
          });

          imageResults.push({
            ...size,
            output: result,
            success: true,
          });
        } catch (error) {
          imageResults.push({
            ...size,
            error: error.message,
            success: false,
          });
        }
      }

      results.push({
        input,
        thumbnails: imageResults,
        success: imageResults.every(r => r.success),
      });
    }

    return results;
  }

  /**
   * Get thumbnail presets
   */
  getPresets() {
    return {
      avatar: [
        { width: 32, height: 32, suffix: '_tiny' },
        { width: 64, height: 64, suffix: '_small' },
        { width: 128, height: 128, suffix: '_medium' },
        { width: 256, height: 256, suffix: '_large' },
      ],

      product: [
        { width: 150, height: 150, suffix: '_thumb' },
        { width: 300, height: 300, suffix: '_small' },
        { width: 600, height: 600, suffix: '_medium' },
        { width: 1200, height: 1200, suffix: '_large' },
      ],

      blog: [
        { width: 400, height: 300, suffix: '_thumb', fit: 'cover' },
        { width: 800, height: 600, suffix: '_medium', fit: 'cover' },
        { width: 1600, height: 1200, suffix: '_large', fit: 'cover' },
      ],

      gallery: [
        { width: 200, height: 200, suffix: '_thumb', fit: 'cover' },
        { width: 400, height: 400, suffix: '_small', fit: 'cover' },
        { width: 800, height: 800, suffix: '_medium', fit: 'cover' },
        { width: 1600, height: 1600, suffix: '_large', fit: 'inside' },
      ],

      responsive: [
        { width: 320, suffix: '_xs' },
        { width: 640, suffix: '_sm' },
        { width: 1024, suffix: '_md' },
        { width: 1920, suffix: '_lg' },
      ],
    };
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
      default:
        return image;
    }
  }

  /**
   * Generate output path
   * @private
   */
  generateOutputPath(input, suffix, baseOutput) {
    const path = require('path');
    const ext = path.extname(input);
    const base = path.basename(input, ext);
    const dir = baseOutput || path.dirname(input);
    
    return path.join(dir, `${base}${suffix}${ext}`);
  }
}

export default ThumbnailGenerator;
