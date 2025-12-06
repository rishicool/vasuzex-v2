import crypto from "crypto";
import { stat } from "fs/promises";

/**
 * MediaServerMiddleware - Enhanced media serving with on-demand transformations
 *
 * Features:
 * - On-demand image resizing via query parameters
 * - Automatic format conversion (WebP, JPEG, PNG, AVIF)
 * - Browser caching headers (ETag, Last-Modified, Cache-Control)
 * - Content negotiation based on Accept header
 */
export class MediaServerMiddleware {
  /**
   * Create media server middleware
   *
   * @param {Object} app - Application instance
   * @param {Object} options - Middleware options
   */
  constructor(app, options = {}) {
    this.app = app;
    this.config = app.make("config").get("media", {});
    this.options = {
      maxAge: options.maxAge || 604800, // 7 days
      enableWebP: options.enableWebP !== false,
      enableAVIF: options.enableAVIF !== false,
      enableETag: options.enableETag !== false,
      enableLastModified: options.enableLastModified !== false,
      ...options,
    };
  }

  /**
   * Handle media request with transformations
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      const { path, query } = req;

      // Get image processor
      const imageManager = this.app.make("image");
      const storage = this.app.make("storage");

      // Parse transformation parameters
      const transformations = this.parseTransformations(query);

      // Get original file path
      const filePath = this.getFilePath(path);

      // Check if file exists
      const exists = await storage.exists(filePath);
      if (!exists) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Get file stats for caching
      const stats = await this.getFileStats(storage, filePath);

      // Check ETag
      if (this.options.enableETag) {
        const etag = this.generateETag(filePath, transformations, stats);
        const clientETag = req.headers["if-none-match"];

        if (clientETag === etag) {
          return res.status(304).end();
        }

        res.setHeader("ETag", etag);
      }

      // Check Last-Modified
      if (this.options.enableLastModified) {
        const lastModified = stats.mtime.toUTCString();
        const clientModified = req.headers["if-modified-since"];

        if (clientModified === lastModified) {
          return res.status(304).end();
        }

        res.setHeader("Last-Modified", lastModified);
      }

      // Get image buffer
      const originalBuffer = await storage.get(filePath);

      // Determine output format
      const outputFormat = this.determineFormat(
        req.headers.accept,
        transformations.format,
        filePath
      );

      // Apply transformations
      let processedBuffer = originalBuffer;

      if (this.hasTransformations(transformations)) {
        processedBuffer = await this.applyTransformations(
          imageManager,
          originalBuffer,
          transformations,
          outputFormat
        );
      } else if (outputFormat !== this.getFileExtension(filePath)) {
        // Format conversion only
        processedBuffer = await this.convertFormat(
          imageManager,
          originalBuffer,
          outputFormat,
          transformations.quality || 85
        );
      }

      // Set response headers
      this.setCacheHeaders(res);
      this.setContentType(res, outputFormat);

      // Add custom headers
      res.setHeader("X-Image-Format", outputFormat);
      if (transformations.width || transformations.height) {
        res.setHeader("X-Image-Resized", "true");
      }

      // Send response
      res.send(processedBuffer);
    } catch (error) {
      console.error("Media server error:", error);
      next(error);
    }
  }

  /**
   * Parse transformation parameters from query
   *
   * @private
   * @param {Object} query - Query parameters
   * @returns {Object} Transformations
   */
  parseTransformations(query) {
    const transformations = {};

    // Dimensions
    if (query.width || query.w) {
      transformations.width = parseInt(query.width || query.w, 10);
    }

    if (query.height || query.h) {
      transformations.height = parseInt(query.height || query.h, 10);
    }

    // Quality
    if (query.quality || query.q) {
      transformations.quality = parseInt(query.quality || query.q, 10);
    }

    // Format
    if (query.format || query.fm) {
      transformations.format = (query.format || query.fm).toLowerCase();
    }

    // Fit mode
    if (query.fit) {
      transformations.fit = query.fit; // cover, contain, fill, inside, outside
    }

    // Position for cropping
    if (query.position || query.pos) {
      transformations.position = query.position || query.pos;
    }

    // Blur
    if (query.blur) {
      transformations.blur = parseFloat(query.blur);
    }

    // Sharpen
    if (query.sharpen) {
      transformations.sharpen = parseFloat(query.sharpen);
    }

    // Grayscale
    if (query.grayscale || query.bw) {
      transformations.grayscale = true;
    }

    return transformations;
  }

  /**
   * Check if transformations are requested
   *
   * @private
   * @param {Object} transformations - Transformations
   * @returns {boolean}
   */
  hasTransformations(transformations) {
    return (
      transformations.width ||
      transformations.height ||
      transformations.blur ||
      transformations.sharpen ||
      transformations.grayscale ||
      transformations.fit ||
      transformations.position
    );
  }

  /**
   * Apply transformations to image
   *
   * @private
   * @param {Object} imageManager - Image manager instance
   * @param {Buffer} buffer - Image buffer
   * @param {Object} transformations - Transformations
   * @param {string} outputFormat - Output format
   * @returns {Promise<Buffer>}
   */
  async applyTransformations(imageManager, buffer, transformations, outputFormat) {
    const sharp = await imageManager.getSharp();
    let image = sharp(buffer);

    // Auto-orient
    image = image.rotate();

    // Resize
    if (transformations.width || transformations.height) {
      const maxWidth = this.config.thumbnails?.max_width || 2048;
      const maxHeight = this.config.thumbnails?.max_height || 2048;

      const width = Math.min(transformations.width || maxWidth, maxWidth);
      const height = Math.min(transformations.height || maxHeight, maxHeight);

      image = image.resize({
        width,
        height,
        fit: transformations.fit || this.config.thumbnails?.fit || "cover",
        position:
          transformations.position || this.config.thumbnails?.position || "center",
        withoutEnlargement: true,
      });
    }

    // Filters
    if (transformations.blur) {
      image = image.blur(Math.min(transformations.blur, 100));
    }

    if (transformations.sharpen) {
      image = image.sharpen(Math.min(transformations.sharpen, 10));
    }

    if (transformations.grayscale) {
      image = image.grayscale();
    }

    // Apply format and quality
    const quality = transformations.quality || this.config.thumbnails?.quality || 85;

    switch (outputFormat) {
      case "webp":
        image = image.webp({ quality });
        break;
      case "jpeg":
      case "jpg":
        image = image.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case "png":
        image = image.png({ quality, progressive: true });
        break;
      case "avif":
        image = image.avif({ quality });
        break;
      default:
        image = image.jpeg({ quality, progressive: true });
    }

    return await image.toBuffer();
  }

  /**
   * Convert image format
   *
   * @private
   * @param {Object} imageManager - Image manager instance
   * @param {Buffer} buffer - Image buffer
   * @param {string} format - Output format
   * @param {number} quality - Quality
   * @returns {Promise<Buffer>}
   */
  async convertFormat(imageManager, buffer, format, quality = 85) {
    const sharp = await imageManager.getSharp();
    let image = sharp(buffer).rotate();

    switch (format) {
      case "webp":
        image = image.webp({ quality });
        break;
      case "jpeg":
      case "jpg":
        image = image.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case "png":
        image = image.png({ quality, progressive: true });
        break;
      case "avif":
        image = image.avif({ quality });
        break;
    }

    return await image.toBuffer();
  }

  /**
   * Determine output format based on Accept header and query params
   *
   * @private
   * @param {string} acceptHeader - Accept header
   * @param {string} queryFormat - Format from query params
   * @param {string} filePath - Original file path
   * @returns {string} Output format
   */
  determineFormat(acceptHeader, queryFormat, filePath) {
    // Query param takes precedence
    if (queryFormat) {
      return queryFormat;
    }

    // Check Accept header for modern formats
    if (acceptHeader) {
      if (this.options.enableAVIF && acceptHeader.includes("image/avif")) {
        return "avif";
      }
      if (this.options.enableWebP && acceptHeader.includes("image/webp")) {
        return "webp";
      }
    }

    // Use original format
    return this.getFileExtension(filePath);
  }

  /**
   * Get file extension
   *
   * @private
   * @param {string} filePath - File path
   * @returns {string} Extension
   */
  getFileExtension(filePath) {
    return filePath.split(".").pop().toLowerCase();
  }

  /**
   * Get file path from request path
   *
   * @private
   * @param {string} requestPath - Request path
   * @returns {string} File path
   */
  getFilePath(requestPath) {
    // Remove leading slash and /media prefix if present
    return requestPath.replace(/^\//, "").replace(/^media\//, "");
  }

  /**
   * Get file stats
   *
   * @private
   * @param {Object} storage - Storage instance
   * @param {string} filePath - File path
   * @returns {Promise<Object>} File stats
   */
  async getFileStats(storage, filePath) {
    try {
      const fullPath = storage.path(filePath);
      return await stat(fullPath);
    } catch (error) {
      return { mtime: new Date() };
    }
  }

  /**
   * Generate ETag for caching
   *
   * @private
   * @param {string} filePath - File path
   * @param {Object} transformations - Transformations
   * @param {Object} stats - File stats
   * @returns {string} ETag
   */
  generateETag(filePath, transformations, stats) {
    const hash = crypto.createHash("md5");
    hash.update(filePath);
    hash.update(JSON.stringify(transformations));
    hash.update(stats.mtime.toISOString());
    return `"${hash.digest("hex")}"`;
  }

  /**
   * Set cache headers
   *
   * @private
   * @param {Object} res - Express response
   */
  setCacheHeaders(res) {
    const cacheControl =
      this.config.headers?.["Cache-Control"] ||
      `public, max-age=${this.options.maxAge}, immutable`;

    res.setHeader("Cache-Control", cacheControl);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Vary", "Accept");
  }

  /**
   * Set content type header
   *
   * @private
   * @param {Object} res - Express response
   * @param {string} format - Image format
   */
  setContentType(res, format) {
    const contentTypes = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
      gif: "image/gif",
    };

    res.setHeader("Content-Type", contentTypes[format] || "image/jpeg");
  }
}

/**
 * Create media server middleware
 *
 * @param {Object} app - Application instance
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
export function mediaServer(app, options = {}) {
  const middleware = new MediaServerMiddleware(app, options);

  return (req, res, next) => {
    middleware.handle(req, res, next);
  };
}
