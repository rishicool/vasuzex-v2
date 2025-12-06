/**
 * PaginationHelper Tests
 */

import {
  calculatePagination,
  getOffset,
  getLimit,
  createPaginationResponse,
  createCursorPaginationResponse,
  getPageRange,
  validatePaginationParams,
  pageFromOffset,
  getPageItems,
  createSimplePagination,
  mergePaginationQuery,
  extractPaginationParams,
  PaginationHelper,
} from '../../../../framework/Support/Helpers/PaginationHelper.js';

describe('PaginationHelper - Functional API', () => {
  describe('calculatePagination', () => {
    test('calculates pagination metadata correctly', () => {
      const result = calculatePagination(100, 2, 10);
      
      expect(result).toEqual({
        total: 100,
        page: 2,
        perPage: 10,
        totalPages: 10,
        offset: 10,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 3,
        prevPage: 1,
        firstItemIndex: 11,
        lastItemIndex: 20,
      });
    });

    test('handles first page correctly', () => {
      const result = calculatePagination(100, 1, 10);
      
      expect(result.page).toBe(1);
      expect(result.hasPrevPage).toBe(false);
      expect(result.prevPage).toBe(null);
      expect(result.hasNextPage).toBe(true);
      expect(result.firstItemIndex).toBe(1);
    });

    test('handles last page correctly', () => {
      const result = calculatePagination(100, 10, 10);
      
      expect(result.page).toBe(10);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextPage).toBe(null);
      expect(result.hasPrevPage).toBe(true);
      expect(result.lastItemIndex).toBe(100);
    });

    test('handles partial last page', () => {
      const result = calculatePagination(95, 10, 10);
      
      expect(result.totalPages).toBe(10);
      expect(result.lastItemIndex).toBe(95);
    });

    test('handles empty result set', () => {
      const result = calculatePagination(0, 1, 10);
      
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.firstItemIndex).toBe(0);
      expect(result.lastItemIndex).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });

    test('uses default values when not provided', () => {
      const result = calculatePagination(100);
      
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });

    test('handles invalid page numbers', () => {
      const result = calculatePagination(100, -5, 10);
      
      expect(result.page).toBe(1);
    });

    test('handles invalid perPage values', () => {
      const result = calculatePagination(100, 1, -10);
      
      expect(result.perPage).toBe(1);
    });

    test('handles string inputs', () => {
      const result = calculatePagination(100, '3', '20');
      
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(20);
    });

    test('handles non-numeric inputs gracefully', () => {
      const result = calculatePagination(100, 'invalid', 'bad');
      
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });
  });

  describe('getOffset', () => {
    test('calculates offset for page 1', () => {
      expect(getOffset(1, 10)).toBe(0);
    });

    test('calculates offset for page 2', () => {
      expect(getOffset(2, 10)).toBe(10);
    });

    test('calculates offset for page 5 with 20 per page', () => {
      expect(getOffset(5, 20)).toBe(80);
    });

    test('handles invalid page', () => {
      expect(getOffset(-1, 10)).toBe(0);
    });

    test('uses default values', () => {
      expect(getOffset()).toBe(0);
    });

    test('handles string inputs', () => {
      expect(getOffset('3', '10')).toBe(20);
    });
  });

  describe('getLimit', () => {
    test('returns requested limit', () => {
      expect(getLimit(25, 100)).toBe(25);
    });

    test('enforces maximum limit', () => {
      expect(getLimit(150, 100)).toBe(100);
    });

    test('handles invalid limit', () => {
      expect(getLimit(-10, 100)).toBe(1);
    });

    test('uses default values', () => {
      expect(getLimit()).toBe(10);
    });

    test('uses default maxLimit when not provided', () => {
      expect(getLimit(150)).toBe(100);
    });

    test('handles string inputs', () => {
      expect(getLimit('25', '50')).toBe(25);
    });
  });

  describe('createPaginationResponse', () => {
    test('creates basic pagination response', () => {
      const items = [1, 2, 3, 4, 5];
      const result = createPaginationResponse(items, 50, 1, 5);
      
      expect(result.data).toEqual(items);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.count).toBe(5);
      expect(result.pagination.perPage).toBe(5);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(10);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(false);
    });

    test('includes links when path provided', () => {
      const items = [1, 2, 3];
      const result = createPaginationResponse(items, 30, 2, 3, {
        path: '/api/items',
        query: { filter: 'active' },
      });
      
      expect(result.pagination.links).toBeDefined();
      expect(result.pagination.links.first).toContain('page=1');
      expect(result.pagination.links.last).toContain('page=10');
      expect(result.pagination.links.prev).toContain('page=1');
      expect(result.pagination.links.next).toContain('page=3');
      expect(result.pagination.links.first).toContain('filter=active');
    });

    test('sets prev link to null on first page', () => {
      const items = [1, 2, 3];
      const result = createPaginationResponse(items, 30, 1, 3, {
        path: '/api/items',
      });
      
      expect(result.pagination.links.prev).toBe(null);
    });

    test('sets next link to null on last page', () => {
      const items = [1, 2, 3];
      const result = createPaginationResponse(items, 30, 10, 3, {
        path: '/api/items',
      });
      
      expect(result.pagination.links.next).toBe(null);
    });

    test('handles empty items array', () => {
      const result = createPaginationResponse([], 0, 1, 10);
      
      expect(result.data).toEqual([]);
      expect(result.pagination.count).toBe(0);
    });
  });

  describe('createCursorPaginationResponse', () => {
    test('creates cursor pagination response', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      
      const result = createCursorPaginationResponse(items, 2);
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.perPage).toBe(2);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.nextCursor).toBe(2);
    });

    test('sets hasMore to false when no more items', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      
      const result = createCursorPaginationResponse(items, 5);
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.nextCursor).toBe(null);
    });

    test('uses custom cursor field', () => {
      const items = [
        { uuid: 'abc', name: 'Item 1' },
        { uuid: 'def', name: 'Item 2' },
        { uuid: 'ghi', name: 'Item 3' },
      ];
      
      const result = createCursorPaginationResponse(items, 2, null, 'uuid');
      
      expect(result.pagination.nextCursor).toBe('def');
    });

    test('includes previous cursor', () => {
      const items = [
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
      ];
      
      const result = createCursorPaginationResponse(items, 2, 3);
      
      expect(result.pagination.prevCursor).toBe(3);
    });

    test('handles empty items array', () => {
      const result = createCursorPaginationResponse([], 10);
      
      expect(result.data).toEqual([]);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.nextCursor).toBe(null);
    });

    test('handles invalid perPage', () => {
      const items = [{ id: 1 }];
      const result = createCursorPaginationResponse(items, -5);
      
      expect(result.pagination.perPage).toBe(1);
    });
  });

  describe('getPageRange', () => {
    test('generates page range with delta 2', () => {
      const range = getPageRange(5, 10, 2);
      
      expect(range).toEqual([1, '...', 3, 4, 5, 6, 7, '...', 10]);
    });

    test('generates range for first page', () => {
      const range = getPageRange(1, 10, 2);
      
      expect(range).toEqual([1, 2, 3, '...', 10]);
    });

    test('generates range for last page', () => {
      const range = getPageRange(10, 10, 2);
      
      expect(range).toEqual([1, '...', 8, 9, 10]);
    });

    test('handles small total pages without ellipsis', () => {
      const range = getPageRange(3, 5, 2);
      
      expect(range).not.toContain('...');
    });

    test('handles single page', () => {
      const range = getPageRange(1, 1, 2);
      
      expect(range).toEqual([1]);
    });

    test('handles two pages', () => {
      const range = getPageRange(1, 2, 2);
      
      expect(range).toEqual([1, 2]);
    });

    test('uses custom delta', () => {
      const range = getPageRange(5, 20, 1);
      
      expect(range).toEqual([1, '...', 4, 5, 6, '...', 20]);
    });

    test('handles delta of 0', () => {
      const range = getPageRange(5, 10, 0);
      
      expect(range).toContain(5);
    });
  });

  describe('validatePaginationParams', () => {
    test('validates correct parameters', () => {
      const result = validatePaginationParams(2, 20);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(20);
    });

    test('rejects page less than 1', () => {
      const result = validatePaginationParams(-5, 10); // Use -5 which parseInt converts to -5, not 0
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Page must be at least 1');
      expect(result.page).toBe(1);
    });

    test('rejects perPage less than minPerPage', () => {
      const result = validatePaginationParams(1, -5, { minPerPage: 1 }); // Use -5 which becomes -5
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.perPage).toBe(10);
    });

    test('rejects perPage greater than maxPerPage', () => {
      const result = validatePaginationParams(1, 200, { maxPerPage: 100 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.perPage).toBe(100); // maxPerPage, not defaultPerPage
    });

    test('uses default values for invalid inputs', () => {
      const result = validatePaginationParams('invalid', 'bad');
      
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });

    test('uses custom defaults', () => {
      const result = validatePaginationParams(null, null, {
        defaultPage: 3,
        defaultPerPage: 25,
      });
      
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(25);
    });

    test('handles string inputs', () => {
      const result = validatePaginationParams('2', '20');
      
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(20);
    });
  });

  describe('pageFromOffset', () => {
    test('calculates page from offset', () => {
      expect(pageFromOffset(0, 10)).toBe(1);
      expect(pageFromOffset(10, 10)).toBe(2);
      expect(pageFromOffset(50, 10)).toBe(6);
    });

    test('handles offset 0', () => {
      expect(pageFromOffset(0, 20)).toBe(1);
    });

    test('rounds up for partial pages', () => {
      expect(pageFromOffset(15, 10)).toBe(2);
    });
  });

  describe('getPageItems', () => {
    test('returns items for specified page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = getPageItems(items, 2, 3);
      
      expect(result).toEqual([4, 5, 6]);
    });

    test('returns first page items', () => {
      const items = [1, 2, 3, 4, 5];
      const result = getPageItems(items, 1, 2);
      
      expect(result).toEqual([1, 2]);
    });

    test('returns remaining items on last page', () => {
      const items = [1, 2, 3, 4, 5];
      const result = getPageItems(items, 3, 2);
      
      expect(result).toEqual([5]);
    });

    test('returns empty array for out of range page', () => {
      const items = [1, 2, 3];
      const result = getPageItems(items, 10, 10);
      
      expect(result).toEqual([]);
    });

    test('handles empty array', () => {
      const result = getPageItems([], 1, 10);
      
      expect(result).toEqual([]);
    });
  });

  describe('createSimplePagination', () => {
    test('creates simple pagination with items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = createSimplePagination(items, 2, 3);
      
      expect(result.data).toEqual(items); // Returns all items, not sliced
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.perPage).toBe(3);
      expect(result.pagination.count).toBe(10);
    });

    test('handles first page', () => {
      const items = [1, 2, 3, 4, 5];
      const result = createSimplePagination(items, 1, 2);
      
      expect(result.data).toEqual(items); // Returns all items
    });

    test('handles empty array', () => {
      const result = createSimplePagination([], 1, 10);
      
      expect(result.data).toEqual([]);
      expect(result.pagination.count).toBe(0);
    });
  });

  describe('mergePaginationQuery', () => {
    test('merges pagination params with existing query', () => {
      const query = { filter: 'active', sort: 'name' };
      const result = mergePaginationQuery(query, 2, 20);
      
      expect(result).toEqual({
        filter: 'active',
        sort: 'name',
        page: 2,
        perPage: 20,
      });
    });

    test('overwrites existing page and perPage', () => {
      const query = { page: 1, perPage: 10 };
      const result = mergePaginationQuery(query, 3, 25);
      
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(25);
    });

    test('handles empty query', () => {
      const result = mergePaginationQuery({}, 2, 15);
      
      expect(result).toEqual({ page: 2, perPage: 15 });
    });

    test('preserves other query parameters', () => {
      const query = { search: 'test', category: 'books' };
      const result = mergePaginationQuery(query, 1, 10);
      
      expect(result.search).toBe('test');
      expect(result.category).toBe('books');
    });
  });

  describe('extractPaginationParams', () => {
    test('extracts pagination params from query', () => {
      const query = { page: '3', perPage: '25', filter: 'active' };
      const result = extractPaginationParams(query);
      
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(25);
    });

    test('uses default values when not present', () => {
      const query = { filter: 'active' };
      const result = extractPaginationParams(query);
      
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });

    test('uses custom defaults', () => {
      const query = {};
      const result = extractPaginationParams(query, {
        defaultPage: 2,
        defaultPerPage: 50,
      });
      
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(50);
    });

    test('enforces maximum limit', () => {
      const query = { perPage: '1000' };
      const result = extractPaginationParams(query, { maxPerPage: 100 });
      
      expect(result.perPage).toBe(100);
    });

    test('handles invalid values', () => {
      const query = { page: 'invalid', perPage: 'bad' };
      const result = extractPaginationParams(query);
      
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });
  });
});

describe('PaginationHelper - Class API', () => {
  describe('constructor', () => {
    test('creates instance with default options', () => {
      const helper = new PaginationHelper();
      
      expect(helper.options.defaultPage).toBe(1);
      expect(helper.options.defaultPerPage).toBe(10);
      expect(helper.options.maxPerPage).toBe(100);
    });

    test('creates instance with custom options', () => {
      const helper = new PaginationHelper({ defaultPage: 3, defaultPerPage: 25 });
      
      expect(helper.options.defaultPage).toBe(3);
      expect(helper.options.defaultPerPage).toBe(25);
    });

    test('merges custom options with defaults', () => {
      const helper = new PaginationHelper({ maxPerPage: 200 });
      
      expect(helper.options.defaultPage).toBe(1);
      expect(helper.options.defaultPerPage).toBe(10);
      expect(helper.options.maxPerPage).toBe(200);
    });
  });

  describe('calculate method', () => {
    test('calculates pagination metadata', () => {
      const helper = new PaginationHelper();
      const result = helper.calculate(100, 2, 10);
      
      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(10);
      expect(result.totalPages).toBe(10);
    });

    test('uses default page when not provided', () => {
      const helper = new PaginationHelper({ defaultPage: 2 });
      const result = helper.calculate(100);
      
      expect(result.page).toBe(2);
    });

    test('uses default perPage when not provided', () => {
      const helper = new PaginationHelper({ defaultPerPage: 25 });
      const result = helper.calculate(100);
      
      expect(result.perPage).toBe(25);
    });
  });

  describe('createResponse method', () => {
    test('creates pagination response', () => {
      const helper = new PaginationHelper();
      const items = [1, 2, 3, 4, 5];
      const result = helper.createResponse(items, 50, 1, 5);
      
      expect(result.data).toEqual(items);
      expect(result.pagination.total).toBe(50);
    });

    test('uses default values when not provided', () => {
      const helper = new PaginationHelper();
      const items = [1, 2, 3];
      const result = helper.createResponse(items, 30);
      
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.perPage).toBe(10);
    });

    test('accepts options for links', () => {
      const helper = new PaginationHelper();
      const items = [1, 2, 3];
      const result = helper.createResponse(items, 30, 2, 3, {
        path: '/api/items',
      });
      
      expect(result.pagination.links).toBeDefined();
    });
  });

  describe('createCursorResponse method', () => {
    test('creates cursor pagination response', () => {
      const helper = new PaginationHelper();
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      
      const result = helper.createCursorResponse(items, 2);
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.hasMore).toBe(true);
    });

    test('uses default perPage when not provided', () => {
      const helper = new PaginationHelper({ defaultPerPage: 5 });
      const items = Array(6).fill(null).map((_, i) => ({ id: i + 1 }));
      
      const result = helper.createCursorResponse(items);
      
      expect(result.pagination.perPage).toBe(5);
    });
  });

  describe('validate method', () => {
    test('validates pagination parameters', () => {
      const helper = new PaginationHelper();
      const result = helper.validate(2, 20);
      
      expect(result.isValid).toBe(true);
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(20);
    });

    test('uses helper options for validation', () => {
      const helper = new PaginationHelper({ maxPerPage: 50 });
      const result = helper.validate(1, 100);
      
      expect(result.isValid).toBe(false);
      expect(result.perPage).toBe(50);
    });
  });

  describe('extract method', () => {
    test('extracts pagination params from query', () => {
      const helper = new PaginationHelper();
      const result = helper.extract({ page: '3', perPage: '25' });
      
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(25);
    });

    test('uses helper defaults', () => {
      const helper = new PaginationHelper({ defaultPage: 2, defaultPerPage: 15 });
      const result = helper.extract({});
      
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(15);
    });

    test('merges extract options with helper options', () => {
      const helper = new PaginationHelper({ maxPerPage: 100 });
      const result = helper.extract({ perPage: '200' });
      
      expect(result.perPage).toBe(100);
    });
  });

  describe('static methods', () => {
    test('provides static getOffset', () => {
      expect(PaginationHelper.getOffset(2, 10)).toBe(10);
    });

    test('provides static getLimit', () => {
      expect(PaginationHelper.getLimit(25, 100)).toBe(25);
    });

    test('provides static getPageRange', () => {
      const range = PaginationHelper.getPageRange(5, 10, 2);
      expect(range).toBeInstanceOf(Array);
    });

    test('provides static pageFromOffset', () => {
      expect(PaginationHelper.pageFromOffset(20, 10)).toBe(3);
    });

    test('provides static getPageItems', () => {
      const items = [1, 2, 3, 4, 5];
      const result = PaginationHelper.getPageItems(items, 2, 2);
      expect(result).toEqual([3, 4]);
    });

    test('provides static mergePaginationQuery', () => {
      const result = PaginationHelper.mergePaginationQuery({ filter: 'active' }, 2, 20);
      expect(result.filter).toBe('active');
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(20);
    });
  });
});
