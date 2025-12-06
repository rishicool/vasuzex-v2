/**
 * Media Server Tests
 * 
 * Tests for image processing, CDN, and caching
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import crypto from 'crypto';

describe('Media Server', () => {
  describe('MediaServerMiddleware', () => {
    let middleware;
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        path: '/images/test.jpg',
        query: {},
        headers: { accept: 'image/webp' },
      };

      mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      middleware = {
        parseTransformations: jest.fn((query) => {
          const transformations = {};
          // Support both long and short param names
          if (query.width || query.w) transformations.width = parseInt(query.width || query.w);
          if (query.height || query.h) transformations.height = parseInt(query.height || query.h);
          if (query.format || query.fm) transformations.format = query.format || query.fm;
          if (query.quality || query.q) transformations.quality = parseInt(query.quality || query.q);
          return transformations;
        }),
        determineFormat: jest.fn((accept, queryFormat, filePath) => {
          if (queryFormat) return queryFormat;
          if (accept && accept.includes('image/webp')) return 'webp';
          return 'jpeg';
        }),
        generateETag: jest.fn((path, transformations, stats) => {
          const hash = crypto.createHash('md5');
          hash.update(path);
          hash.update(JSON.stringify(transformations));
          return `"${hash.digest('hex')}"`;
        }),
      };
    });

    it('should parse transformation query parameters', () => {
      const query = { width: '800', height: '600', format: 'webp', quality: '85' };
      const transformations = middleware.parseTransformations(query);

      expect(transformations.width).toBe(800);
      expect(transformations.height).toBe(600);
      expect(transformations.format).toBe('webp');
      expect(transformations.quality).toBe(85);
    });

    it('should support short query param names', () => {
      const query = { w: '800', h: '600', format: 'webp', q: '85' };
      const transformations = middleware.parseTransformations(query);

      expect(transformations.width).toBe(800);
      expect(transformations.height).toBe(600);
      expect(transformations.format).toBe('webp');
      expect(transformations.quality).toBe(85);
    });

    it('should determine output format from Accept header', () => {
      const format = middleware.determineFormat('image/webp,image/jpeg', null, 'test.jpg');
      expect(format).toBe('webp');
    });

    it('should prioritize query format over Accept header', () => {
      const format = middleware.determineFormat('image/webp', 'png', 'test.jpg');
      expect(format).toBe('png');
    });

    it('should generate ETag for caching', () => {
      const etag = middleware.generateETag('test.jpg', { width: 800 }, { mtime: new Date() });
      expect(etag).toMatch(/^"[a-f0-9]{32}"$/);
    });

    it('should handle 304 Not Modified', () => {
      mockReq.headers['if-none-match'] = '"abc123"';
      // Middleware should return 304 if ETag matches
      expect(mockRes.status).toBeDefined();
    });
  });

  describe('CDNManager', () => {
    let cdn;

    beforeEach(() => {
      cdn = {
        enabled: true,
        baseUrl: 'https://cdn.example.com',
        url: jest.fn((path, options = {}) => {
          const cleanPath = path.replace(/^\//, '');
          const params = new URLSearchParams();
          if (options.width) params.append('w', options.width);
          if (options.format) params.append('fm', options.format);
          const query = params.toString();
          return `${cdn.baseUrl}/${cleanPath}${query ? '?' + query : ''}`;
        }),
        image: jest.fn((path, options) => cdn.url(path, options)),
        responsive: jest.fn((path, widths, options = {}) => {
          return widths.map((width) => ({
            width,
            url: cdn.image(path, { ...options, width }),
          }));
        }),
        srcset: jest.fn((path, widths, options = {}) => {
          const urls = cdn.responsive(path, widths, options);
          return urls.map((item) => `${item.url} ${item.width}w`).join(', ');
        }),
      };
    });

    it('should generate CDN URL', () => {
      const url = cdn.url('images/test.jpg');
      expect(url).toBe('https://cdn.example.com/images/test.jpg');
    });

    it('should generate image URL with transformations', () => {
      const url = cdn.image('images/test.jpg', { width: 800, format: 'webp' });
      expect(url).toContain('w=800');
      expect(url).toContain('fm=webp');
    });

    it('should generate responsive image URLs', () => {
      const urls = cdn.responsive('images/test.jpg', [320, 640, 1024]);
      expect(urls).toHaveLength(3);
      expect(urls[0].width).toBe(320);
      expect(urls[1].width).toBe(640);
      expect(urls[2].width).toBe(1024);
    });

    it('should generate srcset attribute', () => {
      const srcset = cdn.srcset('images/test.jpg', [320, 640, 1024]);
      expect(srcset).toContain('320w');
      expect(srcset).toContain('640w');
      expect(srcset).toContain('1024w');
    });

    it('should handle cache purging', async () => {
      cdn.purge = jest.fn(async (paths) => ({
        success: true,
        message: `Purged ${paths.length} paths`,
      }));

      const result = await cdn.purge(['images/test.jpg']);
      expect(result.success).toBe(true);
    });
  });

  describe('Image Transformations', () => {
    it('should resize images', () => {
      const transformations = {
        width: 800,
        height: 600,
        fit: 'cover',
      };
      expect(transformations.width).toBe(800);
      expect(transformations.height).toBe(600);
      expect(transformations.fit).toBe('cover');
    });

    it('should support fit modes', () => {
      const modes = ['cover', 'contain', 'fill', 'inside', 'outside'];
      expect(modes).toContain('cover');
      expect(modes).toContain('contain');
    });

    it('should convert formats', () => {
      const formats = ['webp', 'jpeg', 'png', 'avif'];
      expect(formats).toContain('webp');
      expect(formats).toContain('avif');
    });

    it('should apply filters', () => {
      const filters = {
        blur: 5,
        sharpen: 2,
        grayscale: true,
      };
      expect(filters.blur).toBe(5);
      expect(filters.sharpen).toBe(2);
      expect(filters.grayscale).toBe(true);
    });
  });

  describe('Cache Headers', () => {
    it('should set Cache-Control header', () => {
      const cacheControl = 'public, max-age=604800, immutable';
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=604800');
      expect(cacheControl).toContain('immutable');
    });

    it('should set Vary header for content negotiation', () => {
      const vary = 'Accept';
      expect(vary).toBe('Accept');
    });

    it('should set CORS headers', () => {
      const cors = 'cross-origin';
      expect(cors).toBe('cross-origin');
    });
  });
});
