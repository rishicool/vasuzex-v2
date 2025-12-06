/**
 * TableHeader Component
 * 
 * Renders the table header with sortable columns and optional selection checkbox.
 * 
 * @module components/DataTable/TableHeader
 */

import PropTypes from 'prop-types';

/**
 * Table header with sorting and selection
 * 
 * @param {Object} props
 * @param {Array<Object>} props.columns - Column definitions
 * @param {Object} props.sortConfig - Current sort configuration
 * @param {Function} props.onSort - Sort callback
 * @param {boolean} props.selectable - Enable selection checkbox
 * @param {boolean} props.allSelected - All rows selected state
 * @param {Function} props.onSelectAll - Select all callback
 */
export function TableHeader({ 
  columns, 
  sortConfig, 
  onSort, 
  selectable, 
  allSelected, 
  onSelectAll 
}) {
  return (
    <thead className="vasuzex-datatable-header">
      <tr>
        {selectable && (
          <th className="vasuzex-datatable-checkbox-cell">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label="Select all rows"
            />
          </th>
        )}
        
        {columns.map((column) => (
          <th
            key={column.key}
            className={`vasuzex-datatable-header-cell ${
              column.sortable ? 'sortable' : ''
            } ${sortConfig.key === column.key ? 'sorted' : ''}`}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(column.key)}
            role={column.sortable ? 'button' : undefined}
            tabIndex={column.sortable ? 0 : undefined}
            onKeyPress={(e) => {
              if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSort(column.key);
              }
            }}
            aria-sort={
              sortConfig.key === column.key
                ? sortConfig.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            }
          >
            <div className="vasuzex-datatable-header-content">
              <span>{column.label}</span>
              {column.sortable && (
                <span className="vasuzex-datatable-sort-icon">
                  {sortConfig.key === column.key ? (
                    sortConfig.direction === 'asc' ? '▲' : '▼'
                  ) : (
                    '⇅'
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
        
        <th className="vasuzex-datatable-actions-cell">Actions</th>
      </tr>
    </thead>
  );
}

TableHeader.propTypes = {
  /** Column configuration */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
    })
  ).isRequired,
  /** Current sort configuration */
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }).isRequired,
  /** Callback when column header is clicked for sorting */
  onSort: PropTypes.func.isRequired,
  /** Show selection checkboxes */
  selectable: PropTypes.bool,
  /** Whether all rows are selected */
  allSelected: PropTypes.bool,
  /** Callback when select all checkbox is clicked */
  onSelectAll: PropTypes.func,
};

TableHeader.defaultProps = {
  selectable: false,
  allSelected: false,
};
