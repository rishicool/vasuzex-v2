/**
 * PaginationHelper - Pagination utilities
 * 
 * Provides utilities for pagination calculations and metadata.
 */

/**
 * Calculate pagination metadata
 * 
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {object} Pagination metadata
 */
export function calculatePagination(total, page = 1, perPage = 10) {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const limit = Math.max(1, parseInt(perPage) || 10);
  const totalPages = Math.ceil(total / limit);
  const offset = (currentPage - 1) * limit;

  return {
    total,
    page: currentPage,
    perPage: limit,
    totalPages,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    firstItemIndex: total > 0 ? offset + 1 : 0,
    lastItemIndex: Math.min(offset + limit, total),
  };
}

/**
 * Get pagination offset
 * 
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {number} Offset
 */
export function getOffset(page = 1, perPage = 10) {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const limit = Math.max(1, parseInt(perPage) || 10);
  return (currentPage - 1) * limit;
}

/**
 * Get pagination limit
 * 
 * @param {number} perPage - Items per page
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {number} Limit
 */
export function getLimit(perPage = 10, maxLimit = 100) {
  const limit = Math.max(1, parseInt(perPage) || 10);
  return Math.min(limit, maxLimit);
}

/**
 * Create pagination response
 * 
 * @param {Array} items - Items array
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {object} options - Additional options
 * @returns {object} Pagination response
 */
export function createPaginationResponse(items, total, page, perPage, options = {}) {
  const pagination = calculatePagination(total, page, perPage);
  const { path = null, query = {} } = options;

  const response = {
    data: items,
    pagination: {
      total: pagination.total,
      count: items.length,
      perPage: pagination.perPage,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    },
  };

  // Add links if path provided
  if (path) {
    response.pagination.links = {
      first: buildUrl(path, { ...query, page: 1 }),
      last: buildUrl(path, { ...query, page: pagination.totalPages }),
      prev: pagination.hasPrevPage 
        ? buildUrl(path, { ...query, page: pagination.prevPage })
        : null,
      next: pagination.hasNextPage 
        ? buildUrl(path, { ...query, page: pagination.nextPage })
        : null,
    };
  }

  return response;
}

/**
 * Create cursor pagination response
 * 
 * @param {Array} items - Items array
 * @param {number} perPage - Items per page
 * @param {string} cursor - Current cursor
 * @param {string} cursorField - Cursor field name
 * @returns {object} Cursor pagination response
 */
export function createCursorPaginationResponse(items, perPage, cursor = null, cursorField = 'id') {
  const limit = Math.max(1, parseInt(perPage) || 10);
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  
  const nextCursor = hasMore && data.length > 0
    ? data[data.length - 1][cursorField]
    : null;

  return {
    data,
    pagination: {
      perPage: limit,
      hasMore,
      nextCursor,
      prevCursor: cursor,
    },
  };
}

/**
 * Get page range for pagination UI
 * 
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {number} delta - Pages to show on each side
 * @returns {Array} Page numbers to display
 */
export function getPageRange(currentPage, totalPages, delta = 2) {
  const range = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  // Always show first page
  range.push(1);

  // Add left ellipsis
  if (left > 2) {
    range.push('...');
  }

  // Add middle pages
  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  // Add right ellipsis
  if (right < totalPages - 1) {
    range.push('...');
  }

  // Always show last page if there is more than 1 page
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

/**
 * Validate pagination parameters
 * 
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export function validatePaginationParams(page, perPage, options = {}) {
  const {
    minPerPage = 1,
    maxPerPage = 100,
    defaultPage = 1,
    defaultPerPage = 10,
  } = options;

  const errors = [];
  let validPage = parseInt(page) || defaultPage;
  let validPerPage = parseInt(perPage) || defaultPerPage;

  // Validate page
  if (validPage < 1) {
    errors.push('Page must be at least 1');
    validPage = defaultPage;
  }

  // Validate perPage
  if (validPerPage < minPerPage) {
    errors.push(`Items per page must be at least ${minPerPage}`);
    validPerPage = defaultPerPage;
  }

  if (validPerPage > maxPerPage) {
    errors.push(`Items per page cannot exceed ${maxPerPage}`);
    validPerPage = maxPerPage;
  }

  return {
    isValid: errors.length === 0,
    errors,
    page: validPage,
    perPage: validPerPage,
  };
}

/**
 * Build URL with query parameters
 * 
 * @param {string} path - Base path
 * @param {object} query - Query parameters
 * @returns {string} Complete URL
 */
function buildUrl(path, query = {}) {
  const queryString = Object.entries(query)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Calculate page from offset
 * 
 * @param {number} offset - Offset value
 * @param {number} perPage - Items per page
 * @returns {number} Page number
 */
export function pageFromOffset(offset, perPage) {
  const limit = Math.max(1, parseInt(perPage) || 10);
  return Math.floor((offset || 0) / limit) + 1;
}

/**
 * Get items for current page (array slicing)
 * 
 * @param {Array} items - All items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {Array} Items for page
 */
export function getPageItems(items, page = 1, perPage = 10) {
  const offset = getOffset(page, perPage);
  const limit = getLimit(perPage);
  return items.slice(offset, offset + limit);
}

/**
 * Create simple pagination (without total count)
 * 
 * @param {Array} items - Items array
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {object} Simple pagination response
 */
export function createSimplePagination(items, page, perPage) {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const limit = Math.max(1, parseInt(perPage) || 10);
  const offset = (currentPage - 1) * limit;

  return {
    data: items,
    pagination: {
      count: items.length,
      perPage: limit,
      currentPage,
      hasMore: items.length === limit,
    },
  };
}

/**
 * Merge pagination with existing query
 * 
 * @param {object} existingQuery - Existing query params
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {object} Merged query
 */
export function mergePaginationQuery(existingQuery = {}, page, perPage) {
  return {
    ...existingQuery,
    page: parseInt(page) || 1,
    perPage: parseInt(perPage) || 10,
  };
}

/**
 * Extract pagination params from request
 * 
 * @param {object} query - Request query object
 * @param {object} options - Default options
 * @returns {object} Pagination params
 */
export function extractPaginationParams(query = {}, options = {}) {
  const {
    pageParam = 'page',
    perPageParam = 'perPage',
    defaultPage = 1,
    defaultPerPage = 10,
    maxPerPage = 100,
  } = options;

  const page = Math.max(1, parseInt(query[pageParam]) || defaultPage);
  const perPage = Math.min(
    Math.max(1, parseInt(query[perPageParam]) || defaultPerPage),
    maxPerPage
  );

  return { page, perPage };
}

/**
 * PaginationHelper class for OOP approach
 */
export class PaginationHelper {
  constructor(options = {}) {
    this.options = {
      defaultPage: 1,
      defaultPerPage: 10,
      maxPerPage: 100,
      ...options,
    };
  }

  calculate(total, page, perPage) {
    return calculatePagination(
      total,
      page || this.options.defaultPage,
      perPage || this.options.defaultPerPage
    );
  }

  createResponse(items, total, page, perPage, options = {}) {
    return createPaginationResponse(
      items,
      total,
      page || this.options.defaultPage,
      perPage || this.options.defaultPerPage,
      options
    );
  }

  createCursorResponse(items, perPage, cursor, cursorField) {
    return createCursorPaginationResponse(
      items,
      perPage || this.options.defaultPerPage,
      cursor,
      cursorField
    );
  }

  validate(page, perPage) {
    return validatePaginationParams(page, perPage, this.options);
  }

  extract(query, options = {}) {
    return extractPaginationParams(query, { ...this.options, ...options });
  }

  static getOffset = getOffset;
  static getLimit = getLimit;
  static getPageRange = getPageRange;
  static pageFromOffset = pageFromOffset;
  static getPageItems = getPageItems;
  static mergePaginationQuery = mergePaginationQuery;
}

export default PaginationHelper;
