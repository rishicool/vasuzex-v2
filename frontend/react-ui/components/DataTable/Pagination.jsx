/**
 * Pagination Component
 * 
 * Handles table pagination with page size selection.
 * 
 * @module components/DataTable/Pagination
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination controls
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalItems - Total number of items
 * @param {Function} props.onPageChange - Page change callback
 * @param {Function} props.onPageSizeChange - Page size change callback
 */
export function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize,
  totalItems,
  onPageChange, 
  onPageSizeChange 
}) {
  const pageSizeOptions = [5, 10, 20, 50, 100];
  
  /**
   * Generate page numbers to display
   */
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  }, [currentPage, totalPages]);
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className="vasuzex-datatable-pagination">
      <div className="vasuzex-datatable-pagination-info">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="vasuzex-datatable-pagination-controls">
        {/* Page size selector */}
        <div className="vasuzex-datatable-page-size">
          <label htmlFor="pageSize">Show:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="vasuzex-datatable-page-size-select"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        
        {/* Page numbers */}
        <div className="vasuzex-datatable-page-numbers">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="vasuzex-datatable-page-btn"
            aria-label="Previous page"
          >
            ‹
          </button>
          
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`vasuzex-datatable-page-btn ${
                page === currentPage ? 'active' : ''
              } ${page === '...' ? 'dots' : ''}`}
              aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="vasuzex-datatable-page-btn"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  /** Current page number (1-indexed) */
  currentPage: PropTypes.number.isRequired,
  /** Total number of pages */
  totalPages: PropTypes.number.isRequired,
  /** Current page size */
  pageSize: PropTypes.number.isRequired,
  /** Total number of items */
  totalItems: PropTypes.number.isRequired,
  /** Callback when page changes */
  onPageChange: PropTypes.func.isRequired,
  /** Callback when page size changes */
  onPageSizeChange: PropTypes.func.isRequired,
  /** Available page sizes */
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
};

Pagination.defaultProps = {
  pageSizeOptions: [5, 10, 20, 50, 100],
};
