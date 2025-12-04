/**
 * DigitalOcean Spaces Driver
 * 
 * Stores files on DigitalOcean Spaces (S3-compatible).
 * 
 * @example
 * const driver = new DigitalOceanSpacesDriver({
 *   region: 'nyc3',
 *   bucket: 'my-space',
 *   key: 'DO_SPACES_KEY',
 *   secret: 'DO_SPACES_SECRET',
 *   endpoint: 'https://nyc3.digitaloceanspaces.com',
 *   cdn: 'https://my-space.nyc3.cdn.digitaloceanspaces.com',
 *   visibility: 'public'
 * });
 * 
 * await driver.upload(buffer, 'uploads/file.jpg');
 */

export class DigitalOceanSpacesDriver {
  constructor(config) {
    this.config = config;
    this.region = config.region;
    this.bucket = config.bucket;
    this.key = config.key;
    this.secret = config.secret;
    this.endpoint = config.endpoint || `https://${config.region}.digitaloceanspaces.com`;
    this.cdnUrl = config.cdn || `https://${config.bucket}.${config.region}.cdn.digitaloceanspaces.com`;
    this.baseUrl = config.url || `https://${config.bucket}.${config.region}.digitaloceanspaces.com`;
    this.visibility = config.visibility || 'public';
    this.useCdn = config.use_cdn !== false;
    this.client = null;
  }

  /**
   * Get S3 client (lazy loading)
   * @private
   */
  async getClient() {
    if (!this.client) {
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      this.client = new S3Client({
        endpoint: this.endpoint,
        region: this.region,
        credentials: {
          accessKeyId: this.key,
          secretAccessKey: this.secret
        }
      });
    }

    return this.client;
  }

  /**
   * Upload file
   */
  async upload(buffer, filepath, options = {}) {
    const client = await this.getClient();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const acl = this.visibility === 'public' ? 'public-read' : 'private';

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filepath,
      Body: buffer,
      ACL: acl,
      ContentType: options.mimetype || 'application/octet-stream',
      Metadata: options.metadata || {},
      CacheControl: options.cacheControl || 'max-age=31536000' // 1 year
    });

    await client.send(command);

    return {
      path: filepath,
      url: this.url(filepath),
      cdn_url: this.cdnUrl(filepath),
      size: buffer.length,
      mimetype: options.mimetype,
      driver: 'spaces'
    };
  }

  /**
   * Delete file
   */
  async delete(filepath) {
    try {
      const client = await this.getClient();
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filepath
      });

      await client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(filepath) {
    try {
      const client = await this.getClient();
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filepath
      });

      await client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file URL (uses CDN if enabled)
   */
  url(filepath) {
    if (this.useCdn) {
      return `${this.cdnUrl}/${filepath}`;
    }
    return `${this.baseUrl}/${filepath}`;
  }

  /**
   * Get CDN URL
   */
  cdnUrl(filepath) {
    return `${this.cdnUrl}/${filepath}`;
  }

  /**
   * Get direct URL (non-CDN)
   */
  directUrl(filepath) {
    return `${this.baseUrl}/${filepath}`;
  }

  /**
   * Get file metadata
   */
  async getMetadata(filepath) {
    const client = await this.getClient();
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: filepath
    });

    const response = await client.send(command);

    return {
      path: filepath,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
      etag: response.ETag,
      cacheControl: response.CacheControl,
      metadata: response.Metadata
    };
  }

  /**
   * Download file (get buffer)
   */
  async download(filepath) {
    const client = await this.getClient();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filepath
    });

    const response = await client.send(command);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  /**
   * List files in directory
   */
  async listFiles(prefix = '') {
    const client = await this.getClient();
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix
    });

    const response = await client.send(command);

    return (response.Contents || []).map(obj => ({
      name: obj.Key.split('/').pop(),
      path: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      etag: obj.ETag
    }));
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(filepath, expiresIn = 3600) {
    const client = await this.getClient();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filepath
    });

    return await getSignedUrl(client, command, { expiresIn });
  }

  /**
   * Set file visibility
   */
  async setVisibility(filepath, visibility) {
    const client = await this.getClient();
    const { PutObjectAclCommand } = await import('@aws-sdk/client-s3');

    const acl = visibility === 'public' ? 'public-read' : 'private';

    const command = new PutObjectAclCommand({
      Bucket: this.bucket,
      Key: filepath,
      ACL: acl
    });

    await client.send(command);
    return true;
  }

  /**
   * Purge CDN cache for a file
   */
  async purgeCdn(filepath) {
    // DigitalOcean Spaces doesn't have automatic CDN purge via API
    // This would require using DigitalOcean API separately
    // Return the CDN URL that needs manual purging
    return {
      success: false,
      message: 'CDN purging requires manual action via DigitalOcean control panel',
      cdn_url: this.cdnUrl(filepath)
    };
  }
}

export default DigitalOceanSpacesDriver;
