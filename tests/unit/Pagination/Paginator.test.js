/**
 * Paginator Tests
 * 
 * Comprehensive test suite for pagination classes covering:
 * - LengthAwarePaginator (with total count)
 * - SimplePaginator (without total count)
 * - Page calculations and URLs
 * - Navigation helpers
 * - JSON/Array serialization
 * 
 * Test Coverage:
 * LengthAwarePaginator:
 * - Constructor, setCurrentPage(), total(), count()
 * - firstItem(), lastItem(), lastPage()
 * - onFirstPage(), hasMorePages(), hasPages()
 * - url(), previousPageUrl(), nextPageUrl()
 * - toArray(), toJSON()
 * 
 * SimplePaginator:
 * - Constructor with automatic hasMore detection
 * - setItems(), hasMorePages()
 * - URL generation and navigation
 * 
 * @total-tests: 50
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { LengthAwarePaginator, SimplePaginator } from '../../../framework/Pagination/Paginator.js';

describe('Paginator', () => {
  describe('LengthAwarePaginator', () => {
    let items, total, perPage;

    beforeEach(() => {
      items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      total = 10;
      perPage = 3;
    });

    describe('Constructor', () => {
      test('should create paginator with items and total', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        
        expect(paginator.items).toEqual(items);
        expect(paginator.total).toBe(total);
        expect(paginator.perPage).toBe(perPage);
      });

      test('should set default current page to 1', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.currentPage).toBe(1);
      });

      test('should accept custom current page', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 2);
        expect(paginator.currentPage).toBe(2);
      });

      test('should set default path', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.path).toBe('/');
      });

      test('should accept custom options', () => {
        const options = {
          path: '/users',
          query: { search: 'test' },
          fragment: 'results',
          pageName: 'p'
        };
        const paginator = new LengthAwarePaginator(items, total, perPage, 1, options);
        
        expect(paginator.path).toBe('/users');
        expect(paginator.query).toEqual({ search: 'test' });
        expect(paginator.fragment).toBe('results');
        expect(paginator.pageName).toBe('p');
      });

      test('should handle non-array items', () => {
        const paginator = new LengthAwarePaginator(null, total, perPage);
        expect(paginator.items).toEqual([]);
      });
    });

    describe('setCurrentPage()', () => {
      test('should set valid page number', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.setCurrentPage(2)).toBe(2);
      });

      test('should return 1 for invalid page number', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.setCurrentPage(0)).toBe(1);
        expect(paginator.setCurrentPage(-1)).toBe(1);
      });

      test('should handle string page numbers', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.setCurrentPage('3')).toBe(3);
      });
    });

    describe('Page Information', () => {
      test('should return correct lastPage', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3);
        expect(paginator.lastPage()).toBe(4); // 10 items, 3 per page = 4 pages
      });

      test('should return 1 for lastPage when total is 0', () => {
        const paginator = new LengthAwarePaginator([], 0, 3);
        expect(paginator.lastPage()).toBe(1);
      });

      test('should return correct count', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.count()).toBe(3);
      });

      test('should return correct firstItem', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 2);
        expect(paginator.firstItem()).toBe(4); // Page 2, items 4-6
      });

      test('should return null for firstItem when no items', () => {
        const paginator = new LengthAwarePaginator([], 0, perPage);
        expect(paginator.firstItem()).toBeNull();
      });

      test('should return correct lastItem', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 2);
        expect(paginator.lastItem()).toBe(6); // Page 2, items 4-6
      });

      test('should return null for lastItem when no items', () => {
        const paginator = new LengthAwarePaginator([], 0, perPage);
        expect(paginator.lastItem()).toBeNull();
      });
    });

    describe('Navigation Checks', () => {
      test('should be on first page when currentPage is 1', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 1);
        expect(paginator.onFirstPage()).toBe(true);
      });

      test('should not be on first page when currentPage > 1', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 2);
        expect(paginator.onFirstPage()).toBe(false);
      });

      test('should have more pages when not on last page', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 1);
        expect(paginator.hasMorePages()).toBe(true);
      });

      test('should not have more pages when on last page', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 4);
        expect(paginator.hasMorePages()).toBe(false);
      });

      test('should have pages when not on page 1 or has more pages', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 2);
        expect(paginator.hasPages()).toBe(true);
      });

      test('should not have pages for single page', () => {
        const paginator = new LengthAwarePaginator(items, 3, 3, 1);
        expect(paginator.hasPages()).toBe(false);
      });
    });

    describe('URL Generation', () => {
      test('should generate URL for page', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.url(2)).toBe('/?page=2');
      });

      test('should include existing query parameters', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 1, {
          query: { search: 'test' }
        });
        expect(paginator.url(2)).toBe('/?search=test&page=2');
      });

      test('should include fragment', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 1, {
          fragment: 'results'
        });
        expect(paginator.url(2)).toBe('/?page=2#results');
      });

      test('should use custom pageName', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 1, {
          pageName: 'p'
        });
        expect(paginator.url(2)).toBe('/?p=2');
      });

      test('should return page 1 URL for invalid page numbers', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage);
        expect(paginator.url(0)).toBe('/?page=1');
        expect(paginator.url(-1)).toBe('/?page=1');
      });

      test('should generate previousPageUrl', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 2);
        expect(paginator.previousPageUrl()).toBe('/?page=1');
      });

      test('should return null for previousPageUrl on first page', () => {
        const paginator = new LengthAwarePaginator(items, total, perPage, 1);
        expect(paginator.previousPageUrl()).toBeNull();
      });

      test('should generate nextPageUrl', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 1);
        expect(paginator.nextPageUrl()).toBe('/?page=2');
      });

      test('should return null for nextPageUrl on last page', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 4);
        expect(paginator.nextPageUrl()).toBeNull();
      });
    });

    describe('getUrlRange()', () => {
      test('should generate URL range', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3);
        const range = paginator.getUrlRange(1, 3);
        
        expect(range[1]).toBe('/?page=1');
        expect(range[2]).toBe('/?page=2');
        expect(range[3]).toBe('/?page=3');
      });
    });

    describe('Serialization', () => {
      test('should convert to array', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 2);
        const array = paginator.toArray();
        
        expect(array.current_page).toBe(2);
        expect(array.data).toEqual(items);
        expect(array.total).toBe(10);
        expect(array.per_page).toBe(3);
        expect(array.last_page).toBe(4);
        expect(array.from).toBe(4);
        expect(array.to).toBe(6);
      });

      test('should convert to JSON', () => {
        const paginator = new LengthAwarePaginator(items, 10, 3, 1);
        const json = paginator.toJSON();
        const parsed = JSON.parse(json);
        
        expect(parsed.current_page).toBe(1);
        expect(parsed.total).toBe(10);
        expect(parsed.data).toEqual(items);
      });
    });
  });

  describe('SimplePaginator', () => {
    let items, perPage;

    beforeEach(() => {
      items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]; // 4 items
      perPage = 3;
    });

    describe('Constructor', () => {
      test('should create simple paginator', () => {
        const paginator = new SimplePaginator(items, perPage);
        
        expect(paginator.perPage).toBe(perPage);
        expect(paginator.currentPage).toBe(1);
      });

      test('should detect hasMore when items exceed perPage', () => {
        const paginator = new SimplePaginator(items, perPage); // 4 items, 3 per page
        expect(paginator.hasMore).toBe(true);
      });

      test('should not have more when items equal perPage', () => {
        const paginator = new SimplePaginator([{ id: 1 }, { id: 2 }, { id: 3 }], 3);
        expect(paginator.hasMore).toBe(false);
      });

      test('should slice items to perPage', () => {
        const paginator = new SimplePaginator(items, perPage);
        expect(paginator.items.length).toBe(3); // Should only keep 3 items
      });

      test('should accept custom current page', () => {
        const paginator = new SimplePaginator(items, perPage, 2);
        expect(paginator.currentPage).toBe(2);
      });

      test('should handle non-array items', () => {
        const paginator = new SimplePaginator(null, perPage);
        expect(paginator.items).toEqual([]);
        expect(paginator.hasMore).toBe(false);
      });
    });

    describe('Page Information', () => {
      test('should return correct count', () => {
        const paginator = new SimplePaginator(items, perPage);
        expect(paginator.count()).toBe(3); // Sliced to 3
      });

      test('should return correct firstItem', () => {
        const paginator = new SimplePaginator(items, perPage, 2);
        expect(paginator.firstItem()).toBe(4); // Page 2, starting at item 4
      });

      test('should return correct lastItem', () => {
        const paginator = new SimplePaginator(items, perPage, 2);
        expect(paginator.lastItem()).toBe(6); // Page 2, ending at item 6
      });

      test('should return null for firstItem when no items', () => {
        const paginator = new SimplePaginator([], perPage);
        expect(paginator.firstItem()).toBeNull();
      });
    });

    describe('Navigation', () => {
      test('should have more pages when hasMore is true', () => {
        const paginator = new SimplePaginator(items, perPage);
        expect(paginator.hasMorePages()).toBe(true);
      });

      test('should not have more pages when hasMore is false', () => {
        const paginator = new SimplePaginator([{ id: 1 }], perPage);
        expect(paginator.hasMorePages()).toBe(false);
      });

      test('should be on first page when currentPage is 1', () => {
        const paginator = new SimplePaginator(items, perPage);
        expect(paginator.onFirstPage()).toBe(true);
      });

      test('should generate previousPageUrl', () => {
        const paginator = new SimplePaginator(items, perPage, 2);
        expect(paginator.previousPageUrl()).toBe('/?page=1');
      });

      test('should return null for previousPageUrl on first page', () => {
        const paginator = new SimplePaginator(items, perPage, 1);
        expect(paginator.previousPageUrl()).toBeNull();
      });

      test('should generate nextPageUrl when hasMore', () => {
        const paginator = new SimplePaginator(items, perPage, 1);
        expect(paginator.nextPageUrl()).toBe('/?page=2');
      });

      test('should return null for nextPageUrl when no more pages', () => {
        const paginator = new SimplePaginator([{ id: 1 }], perPage);
        expect(paginator.nextPageUrl()).toBeNull();
      });
    });

    describe('URL Generation', () => {
      test('should generate URL with custom path', () => {
        const paginator = new SimplePaginator(items, perPage, 1, { path: '/users' });
        expect(paginator.url(2)).toBe('/users?page=2');
      });

      test('should include query parameters', () => {
        const paginator = new SimplePaginator(items, perPage, 1, {
          query: { filter: 'active' }
        });
        expect(paginator.url(2)).toBe('/?filter=active&page=2');
      });

      test('should include fragment', () => {
        const paginator = new SimplePaginator(items, perPage, 1, {
          fragment: 'list'
        });
        expect(paginator.url(2)).toBe('/?page=2#list');
      });
    });

    describe('Serialization', () => {
      test('should convert to array', () => {
        const paginator = new SimplePaginator(items, perPage, 1);
        const array = paginator.toArray();
        
        expect(array.current_page).toBe(1);
        expect(array.data).toHaveLength(3);
        expect(array.per_page).toBe(3);
        expect(array.from).toBe(1);
        expect(array.to).toBe(3);
        expect(array.total).toBeUndefined(); // SimplePaginator doesn't track total
      });

      test('should convert to JSON', () => {
        const paginator = new SimplePaginator(items, perPage, 1);
        const json = paginator.toJSON();
        const parsed = JSON.parse(json);
        
        expect(parsed.current_page).toBe(1);
        expect(parsed.data).toHaveLength(3);
      });
    });
  });
});
