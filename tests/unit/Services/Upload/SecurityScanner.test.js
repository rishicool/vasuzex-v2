/**
 * SecurityScanner Tests
 * 
 * Comprehensive test suite for the SecurityScanner class covering:
 * - File signature validation (magic bytes)
 * - Dangerous extension detection
 * - Executable content detection
 * - Size bomb protection
 * - Custom scanner integration (ClamAV)
 * - Filename sanitization
 * - SecurityError handling
 * 
 * Test Coverage:
 * - All public methods: scan(), sanitizeFilename()
 * - All private validation methods (via scan)
 * - File type detection from magic bytes
 * - Security threat scenarios
 * - Error aggregation
 * - Integration with app config
 * 
 * @total-tests: 45
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { SecurityScanner, SecurityError } from '../../../../framework/Services/Upload/SecurityScanner.js';

describe('SecurityScanner', () => {
  let scanner;
  let mockApp;

  beforeEach(() => {
    mockApp = {
      config: jest.fn((key, defaultValue) => {
        const configs = {
          'upload.security.max_size': 100 * 1024 * 1024, // 100MB
          'upload.security.custom_scanner': null
        };
        return configs[key] !== undefined ? configs[key] : defaultValue;
      })
    };

    scanner = new SecurityScanner(mockApp);
  });

  describe('Constructor', () => {
    test('should initialize with app instance', () => {
      expect(scanner.app).toBe(mockApp);
    });
  });

  describe('scan()', () => {
    test('should pass scan for clean JPEG file', async () => {
      const fileData = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
      };

      const result = await scanner.scan(fileData);
      expect(result).toBe(true);
    });

    test('should pass scan for clean PNG file', async () => {
      const fileData = {
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      };

      const result = await scanner.scan(fileData);
      expect(result).toBe(true);
    });

    test('should throw SecurityError for dangerous extension', async () => {
      const fileData = {
        originalname: 'malware.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
        buffer: Buffer.from([0x4D, 0x5A])
      };

      await expect(scanner.scan(fileData)).rejects.toThrow(SecurityError);
    });

    test('should throw SecurityError with multiple errors', async () => {
      const fileData = {
        originalname: 'script.php',
        mimetype: 'application/x-php',
        size: 512,
        buffer: Buffer.from('<?php echo "hack"; ?>')
      };

      await expect(scanner.scan(fileData)).rejects.toThrow(SecurityError);
      
      try {
        await scanner.scan(fileData);
      } catch (error) {
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });

    test('should throw SecurityError for file signature mismatch', async () => {
      // File claims to be PNG but is actually JPEG
      const fileData = {
        originalname: 'fake.png',
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      };

      await expect(scanner.scan(fileData)).rejects.toThrow(SecurityError);
    });

    test('should throw SecurityError for executable content', async () => {
      const fileData = {
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('<script>alert("xss")</script>')
      };

      await expect(scanner.scan(fileData)).rejects.toThrow(SecurityError);
    });

    test('should throw SecurityError for oversized file', async () => {
      const fileData = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 200 * 1024 * 1024, // 200MB
        buffer: Buffer.from([0xFF, 0xD8, 0xFF])
      };

      await expect(scanner.scan(fileData)).rejects.toThrow(SecurityError);
    });

    test('should run custom scanner if configured', async () => {
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'upload.security.custom_scanner') {
          return { type: 'clamav', host: 'localhost', port: 3310 };
        }
        if (key === 'upload.security.max_size') {
          return 100 * 1024 * 1024;
        }
        return defaultValue;
      });

      const fileData = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      };

      // Mock the runCustomScanner to avoid actual ClamAV call
      scanner.runCustomScanner = jest.fn().mockResolvedValue(undefined);

      await scanner.scan(fileData);
      expect(scanner.runCustomScanner).toHaveBeenCalled();
    });
  });

  describe('checkFileSignature()', () => {
    test('should detect JPEG signature correctly', async () => {
      const errors = [];
      const fileData = {
        originalname: 'photo.jpg',
        buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should detect PNG signature correctly', async () => {
      const errors = [];
      const fileData = {
        originalname: 'image.png',
        buffer: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should detect GIF signature correctly', async () => {
      const errors = [];
      const fileData = {
        originalname: 'animation.gif',
        buffer: Buffer.from([0x47, 0x49, 0x46, 0x38])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should detect PDF signature correctly', async () => {
      const errors = [];
      const fileData = {
        originalname: 'document.pdf',
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should add error for signature mismatch', async () => {
      const errors = [];
      const fileData = {
        originalname: 'fake.pdf',
        buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]) // JPEG signature
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('File signature mismatch');
    });

    test('should skip validation if no extension', async () => {
      const errors = [];
      const fileData = {
        originalname: 'noextension',
        buffer: Buffer.from([0xFF, 0xD8])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should skip validation if detection fails', async () => {
      const errors = [];
      const fileData = {
        originalname: 'unknown.dat',
        buffer: Buffer.from([0x00, 0x01, 0x02])
      };

      await scanner.checkFileSignature(fileData, errors);
      expect(errors.length).toBe(0);
    });
  });

  describe('detectFileType()', () => {
    test('should detect JPEG from magic bytes', () => {
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('image/jpeg');
    });

    test('should detect PNG from magic bytes', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('image/png');
    });

    test('should detect GIF from magic bytes', () => {
      const buffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('image/gif');
    });

    test('should detect PDF from magic bytes', () => {
      const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('application/pdf');
    });

    test('should detect ZIP from magic bytes', () => {
      const buffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('application/zip');
    });

    test('should detect MP3 from magic bytes (ID3)', () => {
      const buffer = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe('audio/mpeg');
    });

    test('should return null for unknown file type', () => {
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe(null);
    });

    test('should return null for buffer too small', () => {
      const buffer = Buffer.from([0xFF]);
      const type = scanner.detectFileType(buffer);
      expect(type).toBe(null);
    });
  });

  describe('checkDangerousExtensions()', () => {
    test('should detect .exe extension', () => {
      const errors = [];
      const fileData = { originalname: 'malware.exe' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Dangerous file extension');
    });

    test('should detect .php extension', () => {
      const errors = [];
      const fileData = { originalname: 'shell.php' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should detect .sh extension', () => {
      const errors = [];
      const fileData = { originalname: 'script.sh' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should detect .js extension', () => {
      const errors = [];
      const fileData = { originalname: 'malicious.js' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should detect .svg extension', () => {
      const errors = [];
      const fileData = { originalname: 'xss.svg' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should allow safe extensions', () => {
      const errors = [];
      const fileData = { originalname: 'photo.jpg' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should be case-insensitive', () => {
      const errors = [];
      const fileData = { originalname: 'malware.EXE' };

      scanner.checkDangerousExtensions(fileData, errors);
      expect(errors.length).toBe(1);
    });
  });

  describe('checkExecutableContent()', () => {
    test('should detect script tags', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from('<script>alert("xss")</script>')
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('malicious script content');
    });

    test('should detect javascript: protocol', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from('javascript:alert(1)')
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should detect onerror attribute', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from('<img onerror="alert(1)">')
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
    });

    test('should detect PHP code', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from('<?php echo "hack"; ?>')
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('PHP code detected');
    });

    test('should detect Windows executable (MZ header)', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from([0x4D, 0x5A, 0x90, 0x00])
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Windows executable');
    });

    test('should detect Linux executable (ELF header)', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from([0x7F, 0x45, 0x4C, 0x46])
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Linux executable');
    });

    test('should allow clean content', async () => {
      const errors = [];
      const fileData = {
        buffer: Buffer.from('Just plain text content')
      };

      await scanner.checkExecutableContent(fileData, errors);
      expect(errors.length).toBe(0);
    });
  });

  describe('checkSizeBomb()', () => {
    test('should reject files exceeding max size', () => {
      const errors = [];
      const fileData = {
        size: 200 * 1024 * 1024, // 200MB
        mimetype: 'image/jpeg'
      };

      scanner.checkSizeBomb(fileData, errors);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('exceeds security limit');
    });

    test('should allow files within size limit', () => {
      const errors = [];
      const fileData = {
        size: 50 * 1024 * 1024, // 50MB
        mimetype: 'image/jpeg'
      };

      scanner.checkSizeBomb(fileData, errors);
      expect(errors.length).toBe(0);
    });

    test('should use default max size if not configured', () => {
      mockApp.config.mockImplementation((key, defaultValue) => {
        return defaultValue;
      });
      
      const errors = [];
      const fileData = {
        size: 200 * 1024 * 1024, // 200MB
        mimetype: 'image/jpeg'
      };

      scanner.checkSizeBomb(fileData, errors);
      expect(errors.length).toBe(1);
    });
  });

  describe('isArchive()', () => {
    test('should identify ZIP as archive', () => {
      expect(scanner.isArchive('application/zip')).toBe(true);
    });

    test('should identify RAR as archive', () => {
      expect(scanner.isArchive('application/x-rar-compressed')).toBe(true);
    });

    test('should identify 7z as archive', () => {
      expect(scanner.isArchive('application/x-7z-compressed')).toBe(true);
    });

    test('should identify GZIP as archive', () => {
      expect(scanner.isArchive('application/gzip')).toBe(true);
    });

    test('should identify TAR as archive', () => {
      expect(scanner.isArchive('application/x-tar')).toBe(true);
    });

    test('should not identify image as archive', () => {
      expect(scanner.isArchive('image/jpeg')).toBe(false);
    });
  });

  describe('getExtension()', () => {
    test('should extract .jpg extension', () => {
      expect(scanner.getExtension('photo.jpg')).toBe('.jpg');
    });

    test('should extract .png extension', () => {
      expect(scanner.getExtension('image.png')).toBe('.png');
    });

    test('should return lowercase extension', () => {
      expect(scanner.getExtension('FILE.PDF')).toBe('.pdf');
    });

    test('should handle multiple dots', () => {
      expect(scanner.getExtension('archive.tar.gz')).toBe('.gz');
    });

    test('should return empty string for no extension', () => {
      expect(scanner.getExtension('noextension')).toBe('');
    });

    test('should return empty string for null filename', () => {
      expect(scanner.getExtension(null)).toBe('');
    });
  });

  describe('sanitizeFilename()', () => {
    test('should remove path traversal attempts', () => {
      const result = scanner.sanitizeFilename('../../../etc/passwd');
      expect(result).not.toContain('..');
    });

    test('should remove forward slashes', () => {
      const result = scanner.sanitizeFilename('path/to/file.txt');
      expect(result).not.toContain('/');
    });

    test('should remove backslashes', () => {
      const result = scanner.sanitizeFilename('path\\to\\file.txt');
      expect(result).not.toContain('\\');
    });

    test('should remove null bytes', () => {
      const result = scanner.sanitizeFilename('file\0name.txt');
      expect(result).not.toContain('\0');
    });

    test('should remove control characters', () => {
      const result = scanner.sanitizeFilename('file\x01\x02name.txt');
      expect(result).toBe('filename.txt');
    });

    test('should limit filename length to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = scanner.sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    test('should preserve extension when truncating', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = scanner.sanitizeFilename(longName);
      expect(result.endsWith('.txt')).toBe(true);
    });

    test('should allow safe filenames unchanged', () => {
      const filename = 'my-photo_2024.jpg';
      const result = scanner.sanitizeFilename(filename);
      expect(result).toBe(filename);
    });
  });

  describe('SecurityError', () => {
    test('should create error with message', () => {
      const error = new SecurityError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('SecurityError');
    });

    test('should create error with errors array', () => {
      const errors = ['Error 1', 'Error 2'];
      const error = new SecurityError('Multiple errors', errors);
      expect(error.errors).toEqual(errors);
    });

    test('should default errors to empty array', () => {
      const error = new SecurityError('Test');
      expect(error.errors).toEqual([]);
    });

    test('should be instance of Error', () => {
      const error = new SecurityError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });
});
