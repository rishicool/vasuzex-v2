/**
 * S3 Storage Provider
 * Stores files on AWS S3
 */

import { BaseStorageProvider } from './BaseStorageProvider.js';

export class S3StorageProvider extends BaseStorageProvider {
  constructor(config = {}) {
    super();
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.endpoint = config.endpoint;
    this.key = config.key;
    this.secret = config.secret;
    this.baseUrl = config.url;
    this.s3Client = null;
  }

  /**
   * Initialize S3 client (lazy loading)
   * @private
   */
  async getClient() {
    if (this.s3Client) return this.s3Client;

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      this.s3Client = new S3Client({
        region: this.region,
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: this.key,
          secretAccessKey: this.secret,
        },
      });

      return this.s3Client;
    } catch (error) {
      throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
    }
  }

  /**
   * Put file contents
   */
  async put(path, contents, options = {}) {
    const client = await this.getClient();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: contents,
      ...options,
    };

    await client.send(new PutObjectCommand(params));
    return path;
  }

  /**
   * Get file contents
   */
  async get(path) {
    const client = await this.getClient();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const params = {
      Bucket: this.bucket,
      Key: path,
    };

    const response = await client.send(new GetObjectCommand(params));
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  /**
   * Check if file exists
   */
  async exists(path) {
    try {
      const client = await this.getClient();
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

      const params = {
        Bucket: this.bucket,
        Key: path,
      };

      await client.send(new HeadObjectCommand(params));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete file
   */
  async delete(path) {
    try {
      const client = await this.getClient();
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

      const params = {
        Bucket: this.bucket,
        Key: path,
      };

      await client.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file URL
   */
  async url(path) {
    if (this.baseUrl) {
      return `${this.baseUrl}/${path}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }

  /**
   * Get file size
   */
  async size(path) {
    const client = await this.getClient();
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

    const params = {
      Bucket: this.bucket,
      Key: path,
    };

    const response = await client.send(new HeadObjectCommand(params));
    return response.ContentLength;
  }

  /**
   * List files in directory
   */
  async files(directory = '') {
    const client = await this.getClient();
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const params = {
      Bucket: this.bucket,
      Prefix: directory,
    };

    const response = await client.send(new ListObjectsV2Command(params));
    return (response.Contents || []).map(item => item.Key);
  }

  /**
   * Copy file
   */
  async copy(from, to) {
    const client = await this.getClient();
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');

    const params = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${from}`,
      Key: to,
    };

    await client.send(new CopyObjectCommand(params));
    return true;
  }

  /**
   * Move file
   */
  async move(from, to) {
    await this.copy(from, to);
    await this.delete(from);
    return true;
  }
}

export default S3StorageProvider;
