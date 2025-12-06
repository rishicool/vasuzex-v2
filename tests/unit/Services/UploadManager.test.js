/**
 * UploadManager Tests
 * Comprehensive tests for file upload management
 */

import { UploadManager } from '../../../framework/Services/Upload/UploadManager.js';

describe('UploadManager', () => {
  let uploadManager;
  let mockApp;
  let mockDisk;

  beforeEach(() => {
    // Mock disk
    mockDisk = {
      upload: async (buffer, path, options = {}) => ({
        path,
        url: `http://example.com/${path}`,
        size: buffer.length,
        mimetype: options.mimetype || 'application/octet-stream'
      }),
      delete: async (path) => true,
      exists: async (path) => true,
      url: (path) => `http://example.com/${path}`,
      getMetadata: async (path) => ({ size: 1024, modified: new Date() }),
      download: async (path) => Buffer.from('file content')
    };

    // Mock app
    mockApp = {
      config: (key, defaultValue) => {
        const configs = {
          'upload.default': 'local',
          'upload.disks': {
            local: { driver: 'local', root: '/tmp/uploads' },
            s3: { driver: 's3', bucket: 'test-bucket' }
          },
          'upload.security.scan': false
        };
        return configs[key] ?? defaultValue;
      }
    };

    uploadManager = new UploadManager(mockApp);
    uploadManager.drivers = { local: mockDisk };
  });

  describe('Constructor', () => {
    test('initializes with app instance', () => {
      expect(uploadManager.app).toBe(mockApp);
      expect(uploadManager.drivers).toBeDefined();
      expect(uploadManager.customCreators).toBeDefined();
    });
  });

  describe('Disk Management', () => {
    test('disk() returns default disk when no name provided', () => {
      const disk = uploadManager.disk();
      expect(disk).toBe(mockDisk);
    });

    test('disk() returns specific disk by name', () => {
      const disk = uploadManager.disk('local');
      expect(disk).toBe(mockDisk);
    });

    test('disk() caches disk instances', () => {
      const disk1 = uploadManager.disk('local');
      const disk2 = uploadManager.disk('local');
      expect(disk1).toBe(disk2);
    });

    test('getDefaultDisk() returns configured default', () => {
      const defaultDisk = uploadManager.getDefaultDisk();
      expect(defaultDisk).toBe('local');
    });

    test('availableDisks() returns list of configured disks', () => {
      const disks = uploadManager.availableDisks();
      expect(disks).toContain('local');
      expect(disks).toContain('s3');
    });
  });

  describe('File Parsing', () => {
    test('parseFile() handles Buffer input', async () => {
      const buffer = Buffer.from('test content');
      const result = await uploadManager.parseFile(buffer);
      
      expect(result.buffer).toBe(buffer);
      expect(result.size).toBe(buffer.length);
      expect(result.mimetype).toBe('application/octet-stream');
    });

    test('parseFile() handles base64 string', async () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = await uploadManager.parseFile(base64);
      
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
      expect(result.mimetype).toBe('image/png');
    });

    test('parseFile() handles file object', async () => {
      const fileObj = {
        buffer: Buffer.from('file content'),
        size: 12,
        mimetype: 'text/plain',
        originalname: 'test.txt'
      };
      
      const result = await uploadManager.parseFile(fileObj);
      
      expect(result.buffer).toBe(fileObj.buffer);
      expect(result.size).toBe(12);
      expect(result.mimetype).toBe('text/plain');
      expect(result.originalname).toBe('test.txt');
    });

    test('parseFile() throws error for invalid input', async () => {
      await expect(uploadManager.parseFile(123)).rejects.toThrow('Invalid file input');
      await expect(uploadManager.parseFile('plain string')).rejects.toThrow('Invalid file input');
      await expect(uploadManager.parseFile({})).rejects.toThrow('Invalid file input');
    });
  });

  describe('Upload Operations', () => {
    test('upload() uploads file successfully', async () => {
      const buffer = Buffer.from('test content');
      const result = await uploadManager.upload(buffer, {
        path: 'uploads/test',
        validate: false,
        scan: false
      });
      
      expect(result.path).toBeDefined();
      expect(result.url).toContain('http://example.com/');
      expect(result.disk).toBe('local');
    });

    test('upload() with custom filename', async () => {
      const buffer = Buffer.from('test content');
      const result = await uploadManager.upload(buffer, {
        path: 'uploads',
        filename: 'custom.txt',
        validate: false,
        scan: false
      });
      
      expect(result.path).toContain('custom.txt');
    });

    test('upload() with custom disk', async () => {
      uploadManager.drivers.s3 = mockDisk;
      
      const buffer = Buffer.from('test content');
      const result = await uploadManager.upload(buffer, {
        disk: 's3',
        path: 'uploads',
        validate: false,
        scan: false
      });
      
      expect(result.disk).toBe('s3');
    });

    test('uploadMultiple() uploads multiple files', async () => {
      const files = [
        Buffer.from('file1'),
        Buffer.from('file2'),
        Buffer.from('file3')
      ];
      
      const result = await uploadManager.uploadMultiple(files, {
        path: 'uploads',
        validate: false,
        scan: false
      });
      
      expect(result.results).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    test('uploadMultiple() handles partial failures', async () => {
      uploadManager.parseFile = async (file) => {
        if (file.toString() === 'invalid') {
          throw new Error('Invalid file');
        }
        return {
          buffer: file,
          size: file.length,
          mimetype: 'application/octet-stream',
          originalname: 'file'
        };
      };

      const files = [
        Buffer.from('valid'),
        Buffer.from('invalid'),
        Buffer.from('valid2')
      ];
      
      const result = await uploadManager.uploadMultiple(files, {
        path: 'uploads',
        validate: false,
        scan: false
      });
      
      expect(result.results).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.success).toBe(false);
    });
  });

  describe('File Operations', () => {
    test('delete() removes file', async () => {
      const result = await uploadManager.delete('uploads/test.txt');
      expect(result).toBe(true);
    });

    test('delete() with custom disk', async () => {
      uploadManager.drivers.s3 = mockDisk;
      const result = await uploadManager.delete('uploads/test.txt', 's3');
      expect(result).toBe(true);
    });

    test('deleteMultiple() removes multiple files', async () => {
      const result = await uploadManager.deleteMultiple([
        'uploads/file1.txt',
        'uploads/file2.txt'
      ]);
      
      expect(result.deleted).toBe(2);
      expect(result.failed).toBe(0);
    });

    test('exists() checks file existence', async () => {
      const result = await uploadManager.exists('uploads/test.txt');
      expect(result).toBe(true);
    });

    test('url() returns file URL', () => {
      const url = uploadManager.url('uploads/test.txt');
      expect(url).toBe('http://example.com/uploads/test.txt');
    });

    test('getMetadata() returns file metadata', async () => {
      const metadata = await uploadManager.getMetadata('uploads/test.txt');
      expect(metadata.size).toBeDefined();
      expect(metadata.modified).toBeDefined();
    });

    test('download() retrieves file', async () => {
      const file = await uploadManager.download('uploads/test.txt');
      expect(Buffer.isBuffer(file)).toBe(true);
    });
  });

  describe('File Manipulation', () => {
    test('copy() duplicates file', async () => {
      const result = await uploadManager.copy('source.txt', 'target.txt');
      expect(result.path).toBe('target.txt');
    });

    test('move() relocates file', async () => {
      let deleteCalled = false;
      mockDisk.delete = async (path) => {
        deleteCalled = true;
        return true;
      };
      
      const result = await uploadManager.move('source.txt', 'target.txt');
      expect(result).toBe(true);
      expect(deleteCalled).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    test('isImage() returns true for image MIME types', () => {
      expect(uploadManager.isImage('image/jpeg')).toBe(true);
      expect(uploadManager.isImage('image/png')).toBe(true);
      expect(uploadManager.isImage('image/gif')).toBe(true);
    });

    test('isImage() returns false for non-image MIME types', () => {
      expect(uploadManager.isImage('application/pdf')).toBe(false);
      expect(uploadManager.isImage('text/plain')).toBe(false);
      expect(uploadManager.isImage(null)).toBeFalsy();
    });

    test('generateFilename() creates unique filename', () => {
      const fileData = { originalname: 'test.jpg' };
      const filename1 = uploadManager.generateFilename(fileData);
      const filename2 = uploadManager.generateFilename(fileData);
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('.jpg');
    });

    test('getExtension() extracts file extension', () => {
      expect(uploadManager.getExtension('file.txt')).toBe('.txt');
      expect(uploadManager.getExtension('image.jpg')).toBe('.jpg');
      expect(uploadManager.getExtension('noextension')).toBe('');
    });

    test('generateThumbnailPath() creates thumbnail path', () => {
      const path = uploadManager.generateThumbnailPath('uploads/image.jpg', '_thumb');
      expect(path).toBe('uploads/image_thumb.jpg');
    });

    test('generateThumbnailPath() handles files without extension', () => {
      const path = uploadManager.generateThumbnailPath('uploads/image', '_thumb');
      expect(path).toBe('uploads/image_thumb');
    });

    test('capitalize() capitalizes first letter', () => {
      expect(uploadManager.capitalize('local')).toBe('Local');
      expect(uploadManager.capitalize('s3')).toBe('S3');
    });
  });

  describe('Custom Drivers', () => {
    test('extend() registers custom driver creator', () => {
      const creator = () => ({ custom: true });
      uploadManager.extend('custom', creator);
      
      expect(uploadManager.customCreators.custom).toBe(creator);
    });

    test('extend() returns manager for chaining', () => {
      const result = uploadManager.extend('custom', () => ({}));
      expect(result).toBe(uploadManager);
    });
  });

  describe('Configuration', () => {
    test('getConfig() returns disk configuration', () => {
      const config = uploadManager.getConfig('local');
      expect(config.driver).toBe('local');
      expect(config.root).toBe('/tmp/uploads');
    });

    test('getConfig() returns undefined for non-existing disk', () => {
      const config = uploadManager.getConfig('nonexistent');
      expect(config).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty buffer upload', async () => {
      const buffer = Buffer.from('');
      const result = await uploadManager.upload(buffer, {
        validate: false,
        scan: false
      });
      
      expect(result.size).toBe(0);
    });

    test('handles file without path option', async () => {
      const buffer = Buffer.from('test');
      const result = await uploadManager.upload(buffer, {
        validate: false,
        scan: false
      });
      
      expect(result.path).toBeDefined();
    });

    test('deleteMultiple() handles empty array', async () => {
      const result = await uploadManager.deleteMultiple([]);
      expect(result.deleted).toBe(0);
      expect(result.failed).toBe(0);
    });

    test('uploadMultiple() handles empty array', async () => {
      const result = await uploadManager.uploadMultiple([], {});
      expect(result.results).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.success).toBe(true);
    });
  });
});
