/**
 * Amazon S3 Driver
 * 
 * Stores files on Amazon S3.
 * 
 * @example
 * const driver = new S3Driver({
 *   region: 'us-east-1',
 *   bucket: 'my-bucket',
 *   key: 'AWS_ACCESS_KEY',
 *   secret: 'AWS_SECRET_KEY',
 *   url: 'https://my-bucket.s3.amazonaws.com',
 *   visibility: 'public'
 * });
 * 
 * await driver.upload(buffer, 'uploads/file.jpg');
 */

export class S3Driver {
  constructor(config) {
    this.config = config;
    this.region = config.region;
    this.bucket = config.bucket;
    this.key = config.key;
    this.secret = config.secret;
    this.baseUrl = config.url || `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
    this.visibility = config.visibility || 'public';
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
      Metadata: options.metadata || {}
    });

    await client.send(command);

    return {
      path: filepath,
      url: this.url(filepath),
      size: buffer.length,
      mimetype: options.mimetype,
      driver: 's3'
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
   * Get file URL
   */
  url(filepath) {
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
}

export default S3Driver;
