/**
 * TableActions Component
 * 
 * Displays bulk actions when rows are selected.
 * 
 * @module components/DataTable/TableActions
 */

import PropTypes from 'prop-types';

/**
 * Bulk actions bar
 * 
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected rows
 * @param {Function} props.onClearSelection - Clear selection callback
 */
export function TableActions({ selectedCount, onClearSelection }) {
  return (
    <div className="vasuzex-datatable-actions-bar">
      <div className="vasuzex-datatable-actions-info">
        <strong>{selectedCount}</strong> {selectedCount === 1 ? 'row' : 'rows'} selected
      </div>
      <div className="vasuzex-datatable-actions-buttons">
        <button
          onClick={onClearSelection}
          className="vasuzex-datatable-actions-clear"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}

TableActions.propTypes = {
  /** Number of selected rows */
  selectedCount: PropTypes.number.isRequired,
  /** Callback to clear selection */
  onClearSelection: PropTypes.func.isRequired,
  /** Custom actions for selected rows */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
    })
  ),
};

TableActions.defaultProps = {
  actions: [],
};
