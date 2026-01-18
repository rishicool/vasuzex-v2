/**
 * Media Manager
 * Centralized media serving with dynamic thumbnail generation
 */

import sharp from 'sharp';
import { createHash } from 'crypto';
import { mkdir, readFile, writeFile, stat, unlink, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

export class MediaManager {
  constructor(app) {
    this.app = app;
    this.config = app.config('media');
    this.cacheDir = this.config.cache.path;
    this.cacheTTL = this.config.cache.ttl;
    this.allowedSizes = this.config.thumbnails.allowed_sizes;
    this.maxWidth = this.config.thumbnails.max_width;
    this.maxHeight = this.config.thumbnails.max_height;
  }

  /**
   * Get image with optional thumbnail
   */
  async getImage(imagePath, width = null, height = null) {
    // If no dimensions, serve original
    if (!width && !height) {
      return await this.getOriginalImage(imagePath);
    }

    // Validate dimensions
    this.validateDimensions(width, height);

    // Check cache first
    const cacheKey = this.getCacheKey(imagePath, width, height);
    const cached = await this.getCachedThumbnail(cacheKey);
    
    if (cached) {
      // Detect content type from cached buffer
      const contentType = await this.detectContentType(cached);
      return {
        buffer: cached,
        fromCache: true,
        contentType,
      };
    }

    // Generate thumbnail
    const result = await this.generateThumbnail(imagePath, width, height);
    
    // Cache it
    await this.cacheThumbnail(cacheKey, result.buffer);

    return {
      buffer: result.buffer,
      fromCache: false,
      contentType: result.contentType,
    };
  }

  /**
   * Get original image from storage
   */
  async getOriginalImage(imagePath) {
    const storage = this.app.make('storage');
    const buffer = await storage.get(imagePath);

    return {
      buffer,
      fromCache: false,
      contentType: this.getContentType(imagePath),
    };
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(imagePath, width, height) {
    const storage = this.app.make('storage');
    const imageBuffer = await storage.get(imagePath);

    // Detect image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const hasAlpha = metadata.hasAlpha;
    const originalFormat = metadata.format;

    // Build the sharp pipeline
    let pipeline = sharp(imageBuffer)
      .resize(width, height, {
        fit: this.config.thumbnails.fit,
        position: this.config.thumbnails.position,
        withoutEnlargement: true,
      });

    // Choose output format based on input format and transparency
    let contentType = 'image/jpeg';
    
    if (originalFormat === 'webp') {
      // Preserve WebP format (supports transparency and good compression)
      pipeline = pipeline.webp({
        quality: this.config.thumbnails.quality,
      });
      contentType = 'image/webp';
    } else if (hasAlpha) {
      // For PNG or other formats with transparency, use PNG
      pipeline = pipeline.png({
        quality: this.config.thumbnails.quality,
        compressionLevel: 9,
      });
      contentType = 'image/png';
    } else {
      // For opaque images, use JPEG for best compression
      pipeline = pipeline.jpeg({
        quality: this.config.thumbnails.quality,
        progressive: true,
      });
    }

    const thumbnail = await pipeline.toBuffer();

    return { buffer: thumbnail, contentType };
  }

  /**
   * Validate thumbnail dimensions
   */
  validateDimensions(width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive numbers');
    }

    if (width > this.maxWidth || height > this.maxHeight) {
      throw new Error(
        `Dimensions exceed maximum allowed (${this.maxWidth}x${this.maxHeight})`
      );
    }

    // Check if size is in allowed list (if strict mode)
    if (this.config.thumbnails.strict_sizes) {
      const sizeKey = `${width}x${height}`;
      const isAllowed = this.allowedSizes.some(
        size => `${size.width}x${size.height}` === sizeKey
      );

      if (!isAllowed) {
        throw new Error(
          `Size ${sizeKey} is not in allowed sizes. Use: ${this.allowedSizes
            .map(s => `${s.width}x${s.height}`)
            .join(', ')}`
        );
      }
    }
  }

  /**
   * Get cache key for thumbnail
   */
  getCacheKey(imagePath, width, height) {
    const hash = createHash('md5')
      .update(`${imagePath}:${width}:${height}`)
      .digest('hex');
    return hash;
  }

  /**
   * Get cached thumbnail
   */
  async getCachedThumbnail(cacheKey) {
    try {
      // Try all supported image extensions
      for (const ext of ['.webp', '.png', '.jpg']) {
        const cachePath = join(this.cacheDir, `${cacheKey}${ext}`);
        
        if (!existsSync(cachePath)) {
          continue;
        }

        // Check if cache expired
        const stats = await stat(cachePath);
        const age = Date.now() - stats.mtimeMs;
        
        if (age > this.cacheTTL) {
          await unlink(cachePath);
          continue;
        }

        return await readFile(cachePath);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cache thumbnail
   */
  async cacheThumbnail(cacheKey, buffer) {
    try {
      // Detect format from buffer to use correct extension
      const metadata = await sharp(buffer).metadata();
      const formatMap = {
        webp: '.webp',
        png: '.png',
        jpeg: '.jpg',
      };
      const ext = formatMap[metadata.format] || '.jpg';
      const cachePath = join(this.cacheDir, `${cacheKey}${ext}`);
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, buffer);
    } catch (error) {
      // Fail silently - caching is optional
      console.error('Failed to cache thumbnail:', error.message);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));

      let totalSize = 0;
      let expiredCount = 0;

      for (const file of imageFiles) {
        const filePath = join(this.cacheDir, file);
        const stats = await stat(filePath);
        totalSize += stats.size;

        const age = Date.now() - stats.mtimeMs;
        if (age > this.cacheTTL) {
          expiredCount++;
        }
      }

      return {
        total: imageFiles.length,
        size: totalSize,
        sizeFormatted: this.formatBytes(totalSize),
        expired: expiredCount,
        ttl: this.cacheTTL,
        path: this.cacheDir,
      };
    } catch (error) {
      return {
        total: 0,
        size: 0,
        sizeFormatted: '0 B',
        expired: 0,
        ttl: this.cacheTTL,
        path: this.cacheDir,
        error: error.message,
      };
    }
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));

      let cleared = 0;

      for (const file of imageFiles) {
        const filePath = join(this.cacheDir, file);
        const stats = await stat(filePath);
        const age = Date.now() - stats.mtimeMs;

        if (age > this.cacheTTL) {
          await unlink(filePath);
          cleared++;
        }
      }

      return cleared;
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));

      for (const file of imageFiles) {
        const filePath = join(this.cacheDir, file);
        await unlink(filePath);
      }

      return imageFiles.length;
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
      return 0;
    }
  }

  /**
   * Get allowed sizes
   */
  getAllowedSizes() {
    return this.allowedSizes.map(size => ({
      name: size.name,
      width: size.width,
      height: size.height,
      url: `?w=${size.width}&h=${size.height}`,
    }));
  }

  /**
   * Get content type from file extension
   */
  getContentType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Detect content type from buffer
   */
  async detectContentType(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      const formatMap = {
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      return formatMap[metadata.format] || 'image/jpeg';
    } catch (error) {
      return 'image/jpeg';
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export default MediaManager;
