/**
 * Filters Component
 * 
 * Renders filter inputs for filterable columns.
 * 
 * @module components/DataTable/Filters
 */

import PropTypes from 'prop-types';

/**
 * Filter controls for table columns
 * 
 * @param {Object} props
 * @param {Array<Object>} props.columns - Filterable columns
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change callback
 */
export function Filters({ columns, filters, onFilterChange }) {
  if (columns.length === 0) return null;
  
  return (
    <div className="vasuzex-datatable-filters">
      <div className="vasuzex-datatable-filters-title">
        <span>🔍 Filters</span>
      </div>
      <div className="vasuzex-datatable-filters-inputs">
        {columns.map((column) => (
          <div key={column.key} className="vasuzex-datatable-filter-input">
            <label htmlFor={`filter-${column.key}`}>
              {column.label}
            </label>
            <input
              id={`filter-${column.key}`}
              type="text"
              placeholder={`Filter by ${column.label}...`}
              value={filters[column.key] || ''}
              onChange={(e) => onFilterChange(column.key, e.target.value)}
              className="vasuzex-datatable-filter-field"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

Filters.propTypes = {
  /** Filterable columns */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      filterable: PropTypes.bool,
    })
  ).isRequired,
  /** Current filter values */
  filters: PropTypes.object.isRequired,
  /** Callback when filter value changes */
  onFilterChange: PropTypes.func.isRequired,
};

Filters.defaultProps = {};
