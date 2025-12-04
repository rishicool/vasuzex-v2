/**
 * Image Processor
 * 
 * Process images using Sharp library.
 * Supports resize, crop, rotate, compress, format conversion, and thumbnails.
 * 
 * @example
 * const processor = new ImageProcessor(app);
 * 
 * const result = await processor.process(buffer, {
 *   resize: { width: 800, height: 600, fit: 'cover' },
 *   format: 'webp',
 *   quality: 80,
 *   thumbnails: [
 *     { width: 200, height: 200, suffix: '_thumb' },
 *     { width: 400, height: 400, suffix: '_medium' }
 *   ]
 * });
 */

export class ImageProcessor {
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
   * Process image
   */
  async process(buffer, options = {}) {
    const sharp = await this.getSharp();
    let image = sharp(buffer);

    // Get original metadata
    const metadata = await image.metadata();

    // Rotate based on EXIF orientation
    if (options.autoOrient !== false) {
      image = image.rotate();
    }

    // Resize
    if (options.resize) {
      image = this.applyResize(image, options.resize);
    }

    // Crop
    if (options.crop) {
      image = this.applyCrop(image, options.crop);
    }

    // Format conversion
    if (options.format) {
      image = this.applyFormat(image, options.format, options.quality);
    } else if (options.quality) {
      // Apply quality to original format
      image = this.applyQuality(image, metadata.format, options.quality);
    }

    // Watermark
    if (options.watermark) {
      image = await this.applyWatermark(image, options.watermark);
    }

    // Sharpen
    if (options.sharpen) {
      image = image.sharpen(options.sharpen);
    }

    // Blur
    if (options.blur) {
      image = image.blur(options.blur);
    }

    // Grayscale
    if (options.grayscale) {
      image = image.grayscale();
    }

    // Process main image
    const mainBuffer = await image.toBuffer();

    // Generate thumbnails
    const thumbnails = [];
    if (options.thumbnails && Array.isArray(options.thumbnails)) {
      for (const thumbOptions of options.thumbnails) {
        const thumb = await this.generateThumbnail(buffer, thumbOptions);
        thumbnails.push(thumb);
      }
    }

    return {
      main: mainBuffer,
      thumbnails,
      metadata: {
        original: metadata,
        processed: await sharp(mainBuffer).metadata()
      }
    };
  }

  /**
   * Apply resize
   * @private
   */
  applyResize(image, options) {
    const resizeOptions = {
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover', // cover, contain, fill, inside, outside
      position: options.position || 'center',
      background: options.background || { r: 255, g: 255, b: 255, alpha: 1 }
    };

    return image.resize(resizeOptions);
  }

  /**
   * Apply crop
   * @private
   */
  applyCrop(image, options) {
    return image.extract({
      left: options.x || 0,
      top: options.y || 0,
      width: options.width,
      height: options.height
    });
  }

  /**
   * Apply format conversion
   * @private
   */
  applyFormat(image, format, quality = 80) {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return image.jpeg({ quality, progressive: true });
      
      case 'png':
        return image.png({ 
          quality, 
          compressionLevel: 9,
          progressive: true 
        });
      
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
   * Apply quality to original format
   * @private
   */
  applyQuality(image, format, quality) {
    return this.applyFormat(image, format, quality);
  }

  /**
   * Apply watermark
   * @private
   */
  async applyWatermark(image, options) {
    const sharp = await this.getSharp();
    
    // If watermark is a buffer or path
    let watermarkBuffer = options.image;
    
    if (typeof options.image === 'string') {
      const fs = await import('fs/promises');
      watermarkBuffer = await fs.readFile(options.image);
    }

    const watermark = sharp(watermarkBuffer);
    const watermarkMetadata = await watermark.metadata();

    // Resize watermark if specified
    if (options.width || options.height) {
      watermark.resize({
        width: options.width,
        height: options.height,
        fit: 'inside'
      });
    }

    // Set opacity
    if (options.opacity && options.opacity < 1) {
      watermark.composite([{
        input: await watermark.toBuffer(),
        blend: 'over',
        opacity: options.opacity
      }]);
    }

    const watermarkBuffer2 = await watermark.toBuffer();

    // Determine position
    const position = this.getWatermarkPosition(
      options.position || 'bottom-right',
      options.padding || 10
    );

    return image.composite([{
      input: watermarkBuffer2,
      gravity: position.gravity,
      ...position.offset
    }]);
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
      'bottom-right': { gravity: 'southeast' }
    };

    return positions[position] || positions['bottom-right'];
  }

  /**
   * Generate thumbnail
   * @private
   */
  async generateThumbnail(buffer, options) {
    const sharp = await this.getSharp();
    let thumb = sharp(buffer);

    // Auto-orient
    thumb = thumb.rotate();

    // Resize
    thumb = thumb.resize({
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover',
      position: options.position || 'center'
    });

    // Format
    if (options.format) {
      thumb = this.applyFormat(thumb, options.format, options.quality || 80);
    }

    const thumbBuffer = await thumb.toBuffer();

    return {
      buffer: thumbBuffer,
      suffix: options.suffix || '_thumb',
      width: options.width,
      height: options.height
    };
  }

  /**
   * Optimize image
   */
  async optimize(buffer, options = {}) {
    const sharp = await this.getSharp();
    const metadata = await sharp(buffer).metadata();

    let image = sharp(buffer);

    // Auto-orient
    image = image.rotate();

    // Progressive/interlaced
    const progressive = options.progressive !== false;

    switch (metadata.format) {
      case 'jpeg':
        image = image.jpeg({
          quality: options.quality || 80,
          progressive,
          mozjpeg: true
        });
        break;

      case 'png':
        image = image.png({
          compressionLevel: options.compressionLevel || 9,
          progressive,
          quality: options.quality || 80
        });
        break;

      case 'webp':
        image = image.webp({
          quality: options.quality || 80,
          lossless: options.lossless || false
        });
        break;
    }

    return await image.toBuffer();
  }

  /**
   * Convert to WebP
   */
  async toWebP(buffer, quality = 80) {
    const sharp = await this.getSharp();
    return await sharp(buffer)
      .rotate()
      .webp({ quality })
      .toBuffer();
  }

  /**
   * Get image info
   */
  async getInfo(buffer) {
    const sharp = await this.getSharp();
    const metadata = await sharp(buffer).metadata();

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
      size: buffer.length
    };
  }
}

export default ImageProcessor;
