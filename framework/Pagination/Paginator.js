/**
 * Length Aware Paginator
 * Laravel-inspired paginator with total count
 */

export class LengthAwarePaginator {
  constructor(items, total, perPage, currentPage = 1, options = {}) {
    this.items = Array.isArray(items) ? items : [];
    this.total = total;
    this.perPage = perPage;
    this.currentPage = this.setCurrentPage(currentPage);
    this.path = options.path || '/';
    this.query = options.query || {};
    this.fragment = options.fragment || null;
    this.pageName = options.pageName || 'page';
  }

  /**
   * Set current page
   */
  setCurrentPage(page) {
    const pageNumber = parseInt(page);
    return this.isValidPageNumber(pageNumber) ? pageNumber : 1;
  }

  /**
   * Check if page number is valid
   */
  isValidPageNumber(page) {
    return page >= 1 && Number.isInteger(page);
  }

  /**
   * Get current page
   */
  currentPage() {
    return this.currentPage;
  }

  /**
   * Get last page number
   */
  lastPage() {
    return Math.max(Math.ceil(this.total / this.perPage), 1);
  }

  /**
   * Get per page count
   */
  perPage() {
    return this.perPage;
  }

  /**
   * Get total items
   */
  total() {
    return this.total;
  }

  /**
   * Get items count
   */
  count() {
    return this.items.length;
  }

  /**
   * Get first item number
   */
  firstItem() {
    return this.count() > 0 ? (this.currentPage - 1) * this.perPage + 1 : null;
  }

  /**
   * Get last item number
   */
  lastItem() {
    return this.count() > 0 ? this.firstItem() + this.count() - 1 : null;
  }

  /**
   * Check if on first page
   */
  onFirstPage() {
    return this.currentPage <= 1;
  }

  /**
   * Check if has more pages
   */
  hasMorePages() {
    return this.currentPage < this.lastPage();
  }

  /**
   * Check if has pages
   */
  hasPages() {
    return this.currentPage !== 1 || this.hasMorePages();
  }

  /**
   * Get URL for page
   */
  url(page) {
    if (page <= 0) {
      page = 1;
    }

    const query = { ...this.query, [this.pageName]: page };
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    let url = this.path + (queryString ? `?${queryString}` : '');

    if (this.fragment) {
      url += `#${this.fragment}`;
    }

    return url;
  }

  /**
   * Get previous page URL
   */
  previousPageUrl() {
    if (this.currentPage > 1) {
      return this.url(this.currentPage - 1);
    }
    return null;
  }

  /**
   * Get next page URL
   */
  nextPageUrl() {
    if (this.hasMorePages()) {
      return this.url(this.currentPage + 1);
    }
    return null;
  }

  /**
   * Get items
   */
  items() {
    return this.items;
  }

  /**
   * Get page range
   */
  getUrlRange(start, end) {
    const urls = {};

    for (let page = start; page <= end; page++) {
      urls[page] = this.url(page);
    }

    return urls;
  }

  /**
   * Convert to array
   */
  toArray() {
    return {
      current_page: this.currentPage,
      data: this.items,
      first_page_url: this.url(1),
      from: this.firstItem(),
      last_page: this.lastPage(),
      last_page_url: this.url(this.lastPage()),
      next_page_url: this.nextPageUrl(),
      path: this.path,
      per_page: this.perPage,
      prev_page_url: this.previousPageUrl(),
      to: this.lastItem(),
      total: this.total
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return JSON.stringify(this.toArray());
  }
}

/**
 * Simple Paginator (without total count)
 */
export class SimplePaginator {
  constructor(items, perPage, currentPage = 1, options = {}) {
    this.perPage = perPage;
    this.currentPage = this.setCurrentPage(currentPage);
    this.path = options.path || '/';
    this.query = options.query || {};
    this.fragment = options.fragment || null;
    this.pageName = options.pageName || 'page';

    this.setItems(items);
  }

  /**
   * Set items and determine if there are more
   */
  setItems(items) {
    const itemsArray = Array.isArray(items) ? items : [];

    this.hasMore = itemsArray.length > this.perPage;
    this.items = itemsArray.slice(0, this.perPage);
  }

  /**
   * Set current page
   */
  setCurrentPage(page) {
    const pageNumber = parseInt(page);
    return this.isValidPageNumber(pageNumber) ? pageNumber : 1;
  }

  /**
   * Check if page number is valid
   */
  isValidPageNumber(page) {
    return page >= 1 && Number.isInteger(page);
  }

  /**
   * Get current page
   */
  currentPage() {
    return this.currentPage;
  }

  /**
   * Get per page count
   */
  perPage() {
    return this.perPage;
  }

  /**
   * Get items count
   */
  count() {
    return this.items.length;
  }

  /**
   * Get first item number
   */
  firstItem() {
    return this.count() > 0 ? (this.currentPage - 1) * this.perPage + 1 : null;
  }

  /**
   * Get last item number
   */
  lastItem() {
    return this.count() > 0 ? this.firstItem() + this.count() - 1 : null;
  }

  /**
   * Check if has more pages
   */
  hasMorePages() {
    return this.hasMore;
  }

  /**
   * Check if on first page
   */
  onFirstPage() {
    return this.currentPage <= 1;
  }

  /**
   * Get URL for page
   */
  url(page) {
    if (page <= 0) {
      page = 1;
    }

    const query = { ...this.query, [this.pageName]: page };
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    let url = this.path + (queryString ? `?${queryString}` : '');

    if (this.fragment) {
      url += `#${this.fragment}`;
    }

    return url;
  }

  /**
   * Get previous page URL
   */
  previousPageUrl() {
    if (this.currentPage > 1) {
      return this.url(this.currentPage - 1);
    }
    return null;
  }

  /**
   * Get next page URL
   */
  nextPageUrl() {
    if (this.hasMorePages()) {
      return this.url(this.currentPage + 1);
    }
    return null;
  }

  /**
   * Get items
   */
  items() {
    return this.items;
  }

  /**
   * Convert to array
   */
  toArray() {
    return {
      current_page: this.currentPage,
      data: this.items,
      first_page_url: this.url(1),
      from: this.firstItem(),
      next_page_url: this.nextPageUrl(),
      path: this.path,
      per_page: this.perPage,
      prev_page_url: this.previousPageUrl(),
      to: this.lastItem()
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return JSON.stringify(this.toArray());
  }
}

export default LengthAwarePaginator;
