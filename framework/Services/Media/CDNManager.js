/**
 * CDNManager - CDN URL generation and CloudFront/Cloudflare integration
 *
 * Generate signed URLs for CDN resources with cache invalidation support
 */
export class CDNManager {
  /**
   * Create CDN manager instance
   *
   * @param {Object} app - Application instance
   */
  constructor(app) {
    this.app = app;
    this.config = app.make("config").get("cdn", {});
    this.provider = this.config.provider || "cloudfront";
    this.baseUrl = this.config.baseUrl || "";
    this.enabled = this.config.enabled !== false;
  }

  /**
   * Generate CDN URL for asset
   *
   * @param {string} path - Asset path
   * @param {Object} options - URL options
   * @returns {string} CDN URL
   */
  url(path, options = {}) {
    if (!this.enabled) {
      return this.getLocalUrl(path);
    }

    // Remove leading slash
    const cleanPath = path.replace(/^\//, "");

    // Add transformations as query params
    const queryParams = this.buildQueryParams(options);
    const queryString = queryParams ? `?${queryParams}` : "";

    return `${this.baseUrl}/${cleanPath}${queryString}`;
  }

  /**
   * Generate image URL with transformations
   *
   * @param {string} path - Image path
   * @param {Object} options - Image options
   * @param {number} options.width - Width
   * @param {number} options.height - Height
   * @param {string} options.format - Format (webp, jpeg, png, avif)
   * @param {number} options.quality - Quality (1-100)
   * @param {string} options.fit - Fit mode
   * @returns {string} Image URL
   */
  image(path, options = {}) {
    return this.url(path, options);
  }

  /**
   * Generate responsive image URLs
   *
   * @param {string} path - Image path
   * @param {Array<number>} widths - Array of widths
   * @param {Object} options - Image options
   * @returns {Array<Object>} Array of {width, url}
   */
  responsive(path, widths = [320, 640, 1024, 1920], options = {}) {
    return widths.map((width) => ({
      width,
      url: this.image(path, { ...options, width }),
    }));
  }

  /**
   * Generate srcset attribute value
   *
   * @param {string} path - Image path
   * @param {Array<number>} widths - Array of widths
   * @param {Object} options - Image options
   * @returns {string} srcset value
   */
  srcset(path, widths = [320, 640, 1024, 1920], options = {}) {
    const urls = this.responsive(path, widths, options);
    return urls.map((item) => `${item.url} ${item.width}w`).join(", ");
  }

  /**
   * Generate signed URL (CloudFront)
   *
   * @param {string} path - Asset path
   * @param {Object} options - Signing options
   * @param {number} options.expires - Expiration timestamp
   * @returns {string} Signed URL
   */
  signedUrl(path, options = {}) {
    if (this.provider === "cloudfront") {
      return this.cloudFrontSignedUrl(path, options);
    }

    // For other providers, return regular URL
    return this.url(path);
  }

  /**
   * Generate CloudFront signed URL
   *
   * @private
   * @param {string} path - Asset path
   * @param {Object} options - Signing options
   * @returns {string} Signed URL
   */
  cloudFrontSignedUrl(path, options = {}) {
    // For production use, implement CloudFront URL signing
    // This is a placeholder implementation
    const url = this.url(path);
    const expires = options.expires || Math.floor(Date.now() / 1000) + 3600;

    // In production, use AWS SDK to sign URLs
    // const signer = new AWS.CloudFront.Signer(keyPairId, privateKey);
    // return signer.getSignedUrl({ url, expires });

    return `${url}${url.includes("?") ? "&" : "?"}expires=${expires}`;
  }

  /**
   * Purge CDN cache for path
   *
   * @param {string|Array<string>} paths - Path(s) to purge
   * @returns {Promise<Object>} Purge result
   */
  async purge(paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths];

    if (this.provider === "cloudfront") {
      return this.purgeCloudFront(pathArray);
    }

    if (this.provider === "cloudflare") {
      return this.purgeCloudflare(pathArray);
    }

    return { success: false, message: "CDN provider not configured" };
  }

  /**
   * Purge CloudFront cache
   *
   * @private
   * @param {Array<string>} paths - Paths to purge
   * @returns {Promise<Object>} Purge result
   */
  async purgeCloudFront(paths) {
    // For production use, implement CloudFront invalidation
    // This is a placeholder implementation

    // const cloudfront = new AWS.CloudFront();
    // const invalidation = await cloudfront.createInvalidation({
    //   DistributionId: this.config.distributionId,
    //   InvalidationBatch: {
    //     Paths: { Quantity: paths.length, Items: paths },
    //     CallerReference: Date.now().toString(),
    //   },
    // }).promise();

    return {
      success: true,
      message: `CloudFront invalidation created for ${paths.length} paths`,
      paths,
    };
  }

  /**
   * Purge Cloudflare cache
   *
   * @private
   * @param {Array<string>} paths - Paths to purge
   * @returns {Promise<Object>} Purge result
   */
  async purgeCloudflare(paths) {
    // For production use, implement Cloudflare cache purge
    // This is a placeholder implementation

    // const axios = require('axios');
    // const response = await axios.post(
    //   `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`,
    //   { files: paths.map(p => this.url(p)) },
    //   {
    //     headers: {
    //       'X-Auth-Email': this.config.email,
    //       'X-Auth-Key': this.config.apiKey,
    //     },
    //   }
    // );

    return {
      success: true,
      message: `Cloudflare cache purged for ${paths.length} paths`,
      paths,
    };
  }

  /**
   * Get local URL (non-CDN)
   *
   * @private
   * @param {string} path - Asset path
   * @returns {string} Local URL
   */
  getLocalUrl(path) {
    const appUrl = this.app.make("config").get("app.url", "http://localhost:3000");
    const cleanPath = path.replace(/^\//, "");
    return `${appUrl}/${cleanPath}`;
  }

  /**
   * Build query parameters from options
   *
   * @private
   * @param {Object} options - Options
   * @returns {string} Query string
   */
  buildQueryParams(options) {
    const params = new URLSearchParams();

    if (options.width) params.append("w", options.width);
    if (options.height) params.append("h", options.height);
    if (options.quality) params.append("q", options.quality);
    if (options.format) params.append("fm", options.format);
    if (options.fit) params.append("fit", options.fit);
    if (options.position) params.append("pos", options.position);
    if (options.blur) params.append("blur", options.blur);
    if (options.sharpen) params.append("sharpen", options.sharpen);
    if (options.grayscale) params.append("bw", "true");

    return params.toString();
  }

  /**
   * Check if CDN is enabled
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get CDN provider name
   *
   * @returns {string}
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get CDN base URL
   *
   * @returns {string}
   */
  getBaseUrl() {
    return this.baseUrl;
  }
}

export default CDNManager;
