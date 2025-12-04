/**
 * Unit Tests for Route Patterns
 * Tests path-to-regexp v8 compatibility
 */

const pathToRegexp = require('path-to-regexp');

describe('Route Patterns', () => {
  describe('Media Server Routes', () => {
    test('should compile wildcard route pattern', () => {
      expect(() => {
        pathToRegexp.match('/{*path}');
      }).not.toThrow();
    });

    test('should match image paths correctly', () => {
      const match = pathToRegexp.match('/{*path}');
      
      const testCases = [
        { path: '/uploads/photo.jpg', expected: true },
        { path: '/uploads/products/123/image.png', expected: true },
        { path: '/a/b/c/d/file.jpg', expected: true }
      ];

      testCases.forEach(({ path, expected }) => {
        const result = match(path);
        expect(!!result).toBe(expected);
        if (result) {
          expect(Array.isArray(result.params.path)).toBe(true);
        }
      });
    });

    test('should handle array path params correctly', () => {
      const mockParams = { path: ['uploads', 'products', '123', 'photo.jpg'] };
      const imagePath = Array.isArray(mockParams.path) 
        ? mockParams.path.join('/') 
        : mockParams.path;
      
      expect(imagePath).toBe('uploads/products/123/photo.jpg');
    });
  });

  describe('API Routes', () => {
    test('should compile standard REST routes', () => {
      const patterns = [
        '/posts',
        '/posts/:id',
        '/users/:userId/posts',
        '/api/v1/posts'
      ];

      patterns.forEach(pattern => {
        expect(() => pathToRegexp.match(pattern)).not.toThrow();
      });
    });
  });
});
