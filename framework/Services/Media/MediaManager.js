/**
 * Media Manager
 * Centralized media serving with dynamic thumbnail generation
 *
 * Enhancements (April 2026):
 * - WebP/AVIF format negotiation (serve best format the client accepts)
 * - Format-aware disk cache key — WebP and JPEG cached separately
 * - LRU in-memory cache for hot images (no filesystem hit for repeated requests)
 * - Direct cache lookup by format (no extension loop)
 * - Immutable 1-year cache headers via controller
 * - ETag support (content MD5) for conditional requests
 */

import sharp from 'sharp';
import { createHash } from 'crypto';
import { mkdir, readFile, writeFile, stat, unlink, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/** Max entries in the in-memory LRU cache */
const MEMORY_CACHE_MAX_ENTRIES = 200;

/**
 * Simple LRU Map — evicts least-recently-used entry when capacity is exceeded.
 * Keys are strings (cacheKey + format), values are Buffers.
 */
class LRUCache {
  constructor(maxEntries) {
    this.maxEntries = maxEntries;
    this._map = new Map();
  }

  get(key) {
    if (!this._map.has(key)) return null;
    // Refresh: delete → re-insert so it becomes most-recently-used  
    const value = this._map.get(key);
    this._map.delete(key);
    this._map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this._map.has(key)) {
      this._map.delete(key);
    } else if (this._map.size >= this.maxEntries) {
      // Evict the first (least-recently-used) entry
      this._map.delete(this._map.keys().next().value);
    }
    this._map.set(key, value);
  }

  has(key) {
    return this._map.has(key);
  }

  get size() {
    return this._map.size;
  }

  clear() {
    this._map.clear();
  }
}

export class MediaManager {
  constructor(app) {
    this.app = app;
    this.config = app.config('media');
    this.cacheDir = this.config.cache.path;
    this.cacheTTL = this.config.cache.ttl;
    this.allowedSizes = this.config.thumbnails.allowed_sizes;
    this.maxWidth = this.config.thumbnails.max_width;
    this.maxHeight = this.config.thumbnails.max_height;

    // In-memory LRU cache for hot thumbnails
    this._memCache = new LRUCache(MEMORY_CACHE_MAX_ENTRIES);
  }

  /**
   * Get image with optional thumbnail.
   * @param {string} imagePath   - Relative storage path
   * @param {number|null} width  - Target width  (null = original)
   * @param {number|null} height - Target height (null = original)
   * @param {string} format      - Output format: 'webp' | 'avif' | 'jpeg' | 'png'
   */
  async getImage(imagePath, width = null, height = null, format = 'webp') {
    // If no dimensions, serve original (no resizing, no format conversion)
    if (!width && !height) {
      return await this.getOriginalImage(imagePath);
    }

    // Validate dimensions (throws on abuse / out-of-range)
    this.validateDimensions(width, height);

    const cacheKey = this.getCacheKey(imagePath, width, height, format);

    // 1. Check in-memory LRU cache first (fastest path)
    const memHit = this._memCache.get(cacheKey);
    if (memHit) {
      return {
        buffer: memHit.buffer,
        fromCache: true,
        cacheLayer: 'memory',
        contentType: memHit.contentType,
        etag: memHit.etag,
      };
    }

    // 2. Check disk cache
    const diskHit = await this.getCachedThumbnail(cacheKey, format);
    if (diskHit) {
      const contentType = this.formatToContentType(format);
      const etag = this.buildETag(diskHit);
      // Warm the in-memory cache
      this._memCache.set(cacheKey, { buffer: diskHit, contentType, etag });
      return {
        buffer: diskHit,
        fromCache: true,
        cacheLayer: 'disk',
        contentType,
        etag,
      };
    }

    // 3. Generate thumbnail
    const result = await this.generateThumbnail(imagePath, width, height, format);
    const etag = this.buildETag(result.buffer);

    // Persist to disk cache (fire-and-forget — don't block the response)
    this.cacheThumbnail(cacheKey, result.buffer, format).catch(() => {});

    // Store in memory cache
    this._memCache.set(cacheKey, { buffer: result.buffer, contentType: result.contentType, etag });

    return {
      buffer: result.buffer,
      fromCache: false,
      cacheLayer: 'none',
      contentType: result.contentType,
      etag,
    };
  }

  /**
   * Get original image from storage (no resize, no conversion).
   */
  async getOriginalImage(imagePath) {
    const storage = this.app.make('storage');
    const buffer = await storage.get(imagePath);
    const etag = this.buildETag(buffer);

    return {
      buffer,
      fromCache: false,
      cacheLayer: 'none',
      contentType: this.getContentType(imagePath),
      etag,
    };
  }

  /**
   * Generate thumbnail with format conversion.
   * Always converts to the requested format for optimal delivery.
   */
  async generateThumbnail(imagePath, width, height, format = 'webp') {
    const storage = this.app.make('storage');
    const imageBuffer = await storage.get(imagePath);

    // Detect alpha channel (needed to decide whether transparent PNG should be kept)
    const metadata = await sharp(imageBuffer).metadata();
    const hasAlpha = metadata.hasAlpha;

    let pipeline = sharp(imageBuffer).resize(width, height, {
      fit: this.config.thumbnails.fit,
      position: this.config.thumbnails.position,
      withoutEnlargement: true,
    });

    let contentType;

    if (format === 'avif') {
      // AVIF via libheif (av1 compression) — best compression, modern browsers
      pipeline = pipeline.heif({ compression: 'av1', quality: this.config.thumbnails.quality });
      contentType = 'image/avif';
    } else if (format === 'webp') {
      // WebP — excellent compression, near-universal support
      pipeline = pipeline.webp({ quality: this.config.thumbnails.quality });
      contentType = 'image/webp';
    } else if (format === 'png' || hasAlpha) {
      // PNG for transparency fallback
      pipeline = pipeline.png({ compressionLevel: 9 });
      contentType = 'image/png';
    } else {
      // JPEG for everything else
      pipeline = pipeline.jpeg({
        quality: this.config.thumbnails.quality,
        progressive: true,
        mozjpeg: true,
      });
      contentType = 'image/jpeg';
    }

    const thumbnail = await pipeline.toBuffer();
    return { buffer: thumbnail, contentType };
  }

  /**
   * Validate thumbnail dimensions.
   * Prevents abuse (e.g. requesting 5000×5000 to spike CPU).
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

    // Strict mode: only predefined sizes
    if (this.config.thumbnails.strict_sizes) {
      const sizeKey = `${width}x${height}`;
      const isAllowed = this.allowedSizes.some(
        (size) => `${size.width}x${size.height}` === sizeKey
      );

      if (!isAllowed) {
        throw new Error(
          `Size ${sizeKey} is not in allowed sizes. Use: ${this.allowedSizes
            .map((s) => `${s.width}x${s.height}`)
            .join(', ')}`
        );
      }
    }
  }

  /**
   * Build a deterministic cache key that includes the output format.
   * Using MD5 is fine here — it's for cache key derivation, not security.
   */
  getCacheKey(imagePath, width, height, format) {
    return createHash('md5')
      .update(`${imagePath}:${width}:${height}:${format}`)
      .digest('hex');
  }

  /**
   * Build a strong ETag from buffer content (MD5 hex).
   */
  buildETag(buffer) {
    return `"${createHash('md5').update(buffer).digest('hex')}"`;
  }

  /**
   * Get cached thumbnail from disk.
   * Looks only for the exact format file — no extension loop.
   */
  async getCachedThumbnail(cacheKey, format) {
    try {
      const ext = this.formatToExtension(format);
      const cachePath = join(this.cacheDir, `${cacheKey}${ext}`);

      if (!existsSync(cachePath)) return null;

      const stats = await stat(cachePath);
      const age = Date.now() - stats.mtimeMs;

      if (age > this.cacheTTL) {
        await unlink(cachePath).catch(() => {});
        return null;
      }

      return await readFile(cachePath);
    } catch {
      return null;
    }
  }

  /**
   * Write thumbnail buffer to disk cache.
   */
  async cacheThumbnail(cacheKey, buffer, format) {
    try {
      const ext = this.formatToExtension(format);
      const cachePath = join(this.cacheDir, `${cacheKey}${ext}`);
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, buffer);
    } catch (error) {
      console.error('Failed to cache thumbnail:', error.message);
    }
  }

  /**
   * Map output format string → file extension.
   */
  formatToExtension(format) {
    const map = { webp: '.webp', avif: '.avif', jpeg: '.jpg', png: '.png' };
    return map[format] || '.jpg';
  }

  /**
   * Map output format string → MIME type.
   */
  formatToContentType(format) {
    const map = {
      webp: 'image/webp',
      avif: 'image/avif',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    return map[format] || 'image/jpeg';
  }

  /**
   * Get cache statistics.
   */
  async getCacheStats() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter((f) =>
        ['.jpg', '.png', '.webp', '.avif'].some((ext) => f.endsWith(ext))
      );

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
        memoryCache: {
          entries: this._memCache.size,
          maxEntries: MEMORY_CACHE_MAX_ENTRIES,
        },
      };
    } catch (error) {
      return {
        total: 0,
        size: 0,
        sizeFormatted: '0 B',
        expired: 0,
        ttl: this.cacheTTL,
        path: this.cacheDir,
        memoryCache: {
          entries: this._memCache.size,
          maxEntries: MEMORY_CACHE_MAX_ENTRIES,
        },
        error: error.message,
      };
    }
  }

  /**
   * Clear expired disk cache entries.
   */
  async clearExpiredCache() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter((f) =>
        ['.jpg', '.png', '.webp', '.avif'].some((ext) => f.endsWith(ext))
      );

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
   * Clear ALL disk cache + flush in-memory cache.
   */
  async clearAllCache() {
    try {
      const files = await readdir(this.cacheDir);
      const imageFiles = files.filter((f) =>
        ['.jpg', '.png', '.webp', '.avif'].some((ext) => f.endsWith(ext))
      );

      for (const file of imageFiles) {
        const filePath = join(this.cacheDir, file);
        await unlink(filePath);
      }

      // Also flush the in-memory cache
      this._memCache.clear();

      return imageFiles.length;
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
      return 0;
    }
  }

  /**
   * Get allowed sizes list.
   */
  getAllowedSizes() {
    return this.allowedSizes.map((size) => ({
      name: size.name,
      width: size.width,
      height: size.height,
      url: `?w=${size.width}&h=${size.height}`,
    }));
  }

  /**
   * Get MIME type from file extension (for original serving).
   */
  getContentType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Format bytes to human-readable string.
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
