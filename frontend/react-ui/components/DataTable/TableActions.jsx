/**
 * TableActions Component
 * 
 * Bulk actions toolbar for selected rows in DataTable
 * Shows when rows are selected and provides clear selection option
 * 
 * @module components/DataTable/TableActions
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * TableActions - Bulk actions toolbar
 * 
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected rows
 * @param {Function} props.onClearSelection - Callback to clear selection
 */
export function TableActions({ selectedCount, onClearSelection }) {
  return (
    <div className="vasuzex-datatable-actions">
      <div className="vasuzex-datatable-actions-info">
        <span className="vasuzex-datatable-actions-count">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>
      <div className="vasuzex-datatable-actions-buttons">
        <button
          type="button"
          className="vasuzex-datatable-actions-clear"
          onClick={onClearSelection}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}

TableActions.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onClearSelection: PropTypes.func.isRequired,
};
