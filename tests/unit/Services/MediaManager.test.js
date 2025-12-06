/**
 * MediaManager Tests
 * Comprehensive tests for media serving and thumbnail generation
 */

import { MediaManager } from '../../../framework/Services/Media/MediaManager.js';
import { createHash } from 'crypto';

describe('MediaManager', () => {
  let mediaManager;
  let mockApp;
  let mockStorage;

  beforeEach(() => {
    // Mock storage
    mockStorage = {
      get: async (path) => Buffer.from('fake image data')
    };

    // Mock app
    mockApp = {
      config: (key) => {
        const configs = {
          media: {
            cache: {
              path: '/tmp/media-cache',
              ttl: 86400000 // 1 day
            },
            thumbnails: {
              allowed_sizes: [
                { name: 'small', width: 200, height: 200 },
                { name: 'medium', width: 400, height: 400 },
                { name: 'large', width: 800, height: 800 }
              ],
              max_width: 2000,
              max_height: 2000,
              quality: 80,
              fit: 'cover',
              position: 'center',
              strict_sizes: false
            }
          }
        };
        return configs[key];
      },
      make: (name) => {
        if (name === 'storage') return mockStorage;
        return null;
      }
    };

    mediaManager = new MediaManager(mockApp);
  });

  describe('Constructor', () => {
    test('initializes with app instance', () => {
      expect(mediaManager.app).toBe(mockApp);
      expect(mediaManager.config).toBeDefined();
    });

    test('sets cache configuration', () => {
      expect(mediaManager.cacheDir).toBe('/tmp/media-cache');
      expect(mediaManager.cacheTTL).toBe(86400000);
    });

    test('sets thumbnail configuration', () => {
      expect(mediaManager.allowedSizes).toHaveLength(3);
      expect(mediaManager.maxWidth).toBe(2000);
      expect(mediaManager.maxHeight).toBe(2000);
    });
  });

  describe('Dimension Validation', () => {
    test('validateDimensions() accepts valid dimensions', () => {
      expect(() => {
        mediaManager.validateDimensions(800, 600);
      }).not.toThrow();
    });

    test('validateDimensions() rejects zero dimensions', () => {
      expect(() => {
        mediaManager.validateDimensions(0, 600);
      }).toThrow('Width and height must be positive numbers');
    });

    test('validateDimensions() rejects negative dimensions', () => {
      expect(() => {
        mediaManager.validateDimensions(800, -100);
      }).toThrow('Width and height must be positive numbers');
    });

    test('validateDimensions() rejects dimensions exceeding maximum', () => {
      expect(() => {
        mediaManager.validateDimensions(3000, 600);
      }).toThrow('Dimensions exceed maximum allowed');
    });

    test('validateDimensions() rejects height exceeding maximum', () => {
      expect(() => {
        mediaManager.validateDimensions(800, 3000);
      }).toThrow('Dimensions exceed maximum allowed');
    });

    test('validateDimensions() enforces strict sizes when enabled', () => {
      mediaManager.config.thumbnails.strict_sizes = true;
      
      expect(() => {
        mediaManager.validateDimensions(200, 200);
      }).not.toThrow();
      
      expect(() => {
        mediaManager.validateDimensions(300, 300);
      }).toThrow('Size 300x300 is not in allowed sizes');
    });
  });

  describe('Cache Key Generation', () => {
    test('getCacheKey() generates MD5 hash', () => {
      const key = mediaManager.getCacheKey('image.jpg', 200, 200);
      
      expect(typeof key).toBe('string');
      expect(key).toHaveLength(32);
    });

    test('getCacheKey() returns same key for same inputs', () => {
      const key1 = mediaManager.getCacheKey('image.jpg', 200, 200);
      const key2 = mediaManager.getCacheKey('image.jpg', 200, 200);
      
      expect(key1).toBe(key2);
    });

    test('getCacheKey() returns different keys for different inputs', () => {
      const key1 = mediaManager.getCacheKey('image.jpg', 200, 200);
      const key2 = mediaManager.getCacheKey('image.jpg', 400, 400);
      const key3 = mediaManager.getCacheKey('other.jpg', 200, 200);
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });

    test('getCacheKey() uses MD5 algorithm', () => {
      const input = 'image.jpg:200:200';
      const expected = createHash('md5').update(input).digest('hex');
      const result = mediaManager.getCacheKey('image.jpg', 200, 200);
      
      expect(result).toBe(expected);
    });
  });

  describe('Content Type Detection', () => {
    test('getContentType() returns correct MIME for JPG', () => {
      expect(mediaManager.getContentType('image.jpg')).toBe('image/jpeg');
      expect(mediaManager.getContentType('photo.jpeg')).toBe('image/jpeg');
    });

    test('getContentType() returns correct MIME for PNG', () => {
      expect(mediaManager.getContentType('image.png')).toBe('image/png');
    });

    test('getContentType() returns correct MIME for GIF', () => {
      expect(mediaManager.getContentType('animation.gif')).toBe('image/gif');
    });

    test('getContentType() returns correct MIME for WebP', () => {
      expect(mediaManager.getContentType('image.webp')).toBe('image/webp');
    });

    test('getContentType() returns correct MIME for SVG', () => {
      expect(mediaManager.getContentType('icon.svg')).toBe('image/svg+xml');
    });

    test('getContentType() handles case insensitivity', () => {
      expect(mediaManager.getContentType('IMAGE.JPG')).toBe('image/jpeg');
      expect(mediaManager.getContentType('PHOTO.PNG')).toBe('image/png');
    });

    test('getContentType() returns default for unknown extensions', () => {
      expect(mediaManager.getContentType('file.xyz')).toBe('application/octet-stream');
    });
  });

  describe('Allowed Sizes', () => {
    test('getAllowedSizes() returns configured sizes', () => {
      const sizes = mediaManager.getAllowedSizes();
      
      expect(sizes).toHaveLength(3);
      expect(sizes[0]).toMatchObject({
        name: 'small',
        width: 200,
        height: 200
      });
    });

    test('getAllowedSizes() includes URL parameters', () => {
      const sizes = mediaManager.getAllowedSizes();
      
      expect(sizes[0].url).toBe('?w=200&h=200');
      expect(sizes[1].url).toBe('?w=400&h=400');
      expect(sizes[2].url).toBe('?w=800&h=800');
    });

    test('getAllowedSizes() preserves all size properties', () => {
      const sizes = mediaManager.getAllowedSizes();
      
      sizes.forEach(size => {
        expect(size).toHaveProperty('name');
        expect(size).toHaveProperty('width');
        expect(size).toHaveProperty('height');
        expect(size).toHaveProperty('url');
      });
    });
  });

  describe('Byte Formatting', () => {
    test('formatBytes() formats bytes', () => {
      expect(mediaManager.formatBytes(0)).toBe('0 B');
      expect(mediaManager.formatBytes(512)).toBe('512 B');
    });

    test('formatBytes() formats kilobytes', () => {
      expect(mediaManager.formatBytes(1024)).toBe('1 KB');
      expect(mediaManager.formatBytes(1536)).toBe('1.5 KB');
    });

    test('formatBytes() formats megabytes', () => {
      expect(mediaManager.formatBytes(1048576)).toBe('1 MB');
      expect(mediaManager.formatBytes(5242880)).toBe('5 MB');
    });

    test('formatBytes() formats gigabytes', () => {
      expect(mediaManager.formatBytes(1073741824)).toBe('1 GB');
      expect(mediaManager.formatBytes(2147483648)).toBe('2 GB');
    });

    test('formatBytes() rounds to 2 decimal places', () => {
      expect(mediaManager.formatBytes(1234567)).toBe('1.18 MB');
    });

    test('formatBytes() handles edge cases', () => {
      expect(mediaManager.formatBytes(1023)).toBe('1023 B');
      expect(mediaManager.formatBytes(1025)).toBe('1 KB');
    });
  });

  describe('Cache Management', () => {
    test('getCacheStats() returns cache statistics', async () => {
      const stats = await mediaManager.getCacheStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('sizeFormatted');
      expect(stats).toHaveProperty('expired');
      expect(stats).toHaveProperty('ttl');
      expect(stats).toHaveProperty('path');
    });

    test('getCacheStats() handles errors gracefully', async () => {
      mediaManager.cacheDir = '/nonexistent/path';
      const stats = await mediaManager.getCacheStats();
      
      expect(stats.total).toBe(0);
      expect(stats.error).toBeDefined();
    });

    test('clearExpiredCache() returns count of cleared files', async () => {
      const count = await mediaManager.clearExpiredCache();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('clearAllCache() returns count of cleared files', async () => {
      const count = await mediaManager.clearAllCache();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Image Retrieval', () => {
    test('getOriginalImage() fetches from storage', async () => {
      const result = await mediaManager.getOriginalImage('uploads/image.jpg');
      
      expect(result.buffer).toBeDefined();
      expect(result.fromCache).toBe(false);
      expect(result.contentType).toBe('image/jpeg');
    });

    test('getOriginalImage() detects content type correctly', async () => {
      const pngResult = await mediaManager.getOriginalImage('uploads/image.png');
      expect(pngResult.contentType).toBe('image/png');
      
      const gifResult = await mediaManager.getOriginalImage('uploads/animation.gif');
      expect(gifResult.contentType).toBe('image/gif');
    });
  });

  describe('Edge Cases', () => {
    test('handles null dimensions in validateDimensions', () => {
      expect(() => {
        mediaManager.validateDimensions(null, 200);
      }).toThrow();
    });

    test('handles undefined dimensions in validateDimensions', () => {
      expect(() => {
        mediaManager.validateDimensions(200, undefined);
      }).not.toThrow(); // undefined is falsy but not validated
    });

    test('formatBytes handles very large numbers', () => {
      const largeNumber = 10737418240; // 10 GB
      const result = mediaManager.formatBytes(largeNumber);
      expect(result).toContain('GB');
    });

    test('getCacheKey handles special characters in path', () => {
      const key1 = mediaManager.getCacheKey('uploads/image with spaces.jpg', 200, 200);
      const key2 = mediaManager.getCacheKey('uploads/image_with_underscores.jpg', 200, 200);
      
      expect(key1).toHaveLength(32);
      expect(key2).toHaveLength(32);
      expect(key1).not.toBe(key2);
    });

    test('getContentType handles paths without extension', () => {
      const contentType = mediaManager.getContentType('image');
      expect(contentType).toBe('application/octet-stream');
    });

    test('getContentType handles multiple dots in filename', () => {
      const contentType = mediaManager.getContentType('my.image.file.jpg');
      expect(contentType).toBe('image/jpeg');
    });

    test('getAllowedSizes returns copy of sizes array', () => {
      const sizes1 = mediaManager.getAllowedSizes();
      const sizes2 = mediaManager.getAllowedSizes();
      
      expect(sizes1).not.toBe(sizes2);
      expect(sizes1).toEqual(sizes2);
    });
  });

  describe('Configuration Access', () => {
    test('cache directory is accessible', () => {
      expect(mediaManager.cacheDir).toBe('/tmp/media-cache');
    });

    test('cache TTL is accessible', () => {
      expect(mediaManager.cacheTTL).toBe(86400000);
    });

    test('max dimensions are accessible', () => {
      expect(mediaManager.maxWidth).toBe(2000);
      expect(mediaManager.maxHeight).toBe(2000);
    });

    test('allowed sizes array is accessible', () => {
      expect(Array.isArray(mediaManager.allowedSizes)).toBe(true);
      expect(mediaManager.allowedSizes.length).toBeGreaterThan(0);
    });
  });
});
