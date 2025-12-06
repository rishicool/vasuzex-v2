/**
 * TableBody Component
 * 
 * Renders the table body with data rows, actions, and loading/empty states.
 * 
 * @module components/DataTable/TableBody
 */

import PropTypes from 'prop-types';

/**
 * Table body with rows and actions
 * 
 * @param {Object} props
 * @param {Array<Object>} props.data - Data to display
 * @param {Array<Object>} props.columns - Column definitions
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onView - View callback
 * @param {boolean} props.selectable - Enable selection
 * @param {Set} props.selectedRows - Set of selected row IDs
 * @param {Function} props.onRowSelect - Row selection callback
 * @param {React.ReactNode} props.emptyState - Custom empty state
 */
export function TableBody({ 
  data, 
  columns, 
  loading, 
  onEdit, 
  onDelete, 
  onView,
  selectable,
  selectedRows,
  onRowSelect,
  emptyState,
}) {
  const hasActions = onEdit || onDelete || onView;
  
  if (loading) {
    return (
      <tbody className="vasuzex-datatable-body">
        <tr>
          <td 
            colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
            className="vasuzex-datatable-loading"
          >
            <div className="vasuzex-datatable-loader">
              <div className="spinner"></div>
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }
  
  if (data.length === 0) {
    return (
      <tbody className="vasuzex-datatable-body">
        <tr>
          <td 
            colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
            className="vasuzex-datatable-empty"
          >
            {emptyState || (
              <div className="vasuzex-datatable-empty-state">
                <p>No data available</p>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    );
  }
  
  return (
    <tbody className="vasuzex-datatable-body">
      {data.map((row, rowIndex) => {
        const rowId = row.id || rowIndex;
        const isSelected = selectedRows.has(rowId);
        
        return (
          <tr 
            key={rowId}
            className={`vasuzex-datatable-row ${isSelected ? 'selected' : ''}`}
          >
            {selectable && (
              <td className="vasuzex-datatable-checkbox-cell">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onRowSelect(rowId, e.target.checked)}
                  aria-label={`Select row ${rowId}`}
                />
              </td>
            )}
            
            {columns.map((column) => (
              <td 
                key={column.key}
                className="vasuzex-datatable-cell"
                data-label={column.label}
              >
                {column.render
                  ? column.render(row[column.key], row, rowIndex)
                  : row[column.key]}
              </td>
            ))}
            
            {hasActions && (
              <td className="vasuzex-datatable-actions-cell">
                <div className="vasuzex-datatable-actions">
                  {onView && (
                    <button
                      onClick={() => onView(row)}
                      className="vasuzex-datatable-action-btn view"
                      aria-label={`View ${row.id || 'row'}`}
                      title="View"
                    >
                      👁
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="vasuzex-datatable-action-btn edit"
                      aria-label={`Edit ${row.id || 'row'}`}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="vasuzex-datatable-action-btn delete"
                      aria-label={`Delete ${row.id || 'row'}`}
                      title="Delete"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
}

TableBody.propTypes = {
  /** Data to display */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Column configuration */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Edit callback */
  onEdit: PropTypes.func,
  /** Delete callback */
  onDelete: PropTypes.func,
  /** View callback */
  onView: PropTypes.func,
  /** Enable row selection */
  selectable: PropTypes.bool,
  /** Set of selected row IDs */
  selectedRows: PropTypes.instanceOf(Set),
  /** Callback when row is selected */
  onRowSelect: PropTypes.func,
  /** Custom empty state */
  emptyState: PropTypes.node,
};

TableBody.defaultProps = {
  loading: false,
  selectable: false,
  selectedRows: new Set(),
  emptyState: null,
};
