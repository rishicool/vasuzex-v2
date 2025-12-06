/**
 * DataTable Component
 * 
 * A powerful, customizable data table with sorting, filtering, pagination,
 * and row selection capabilities.
 * 
 * @module components/DataTable
 */

import { useState, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { TableHeader } from './TableHeader.jsx';
import { TableBody } from './TableBody.jsx';
import { Pagination } from './Pagination.jsx';
import { Filters } from './Filters.jsx';
import { TableActions } from './TableActions.jsx';

/**
 * DataTable component with full CRUD and filtering capabilities
 * 
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of data objects to display
 * @param {Array<Object>} props.columns - Column definitions
 * @param {Function} [props.onEdit] - Callback when edit is clicked
 * @param {Function} [props.onDelete] - Callback when delete is clicked
 * @param {Function} [props.onView] - Callback when view is clicked
 * @param {boolean} [props.loading=false] - Show loading state
 * @param {boolean} [props.selectable=false] - Enable row selection
 * @param {Function} [props.onSelectionChange] - Callback when selection changes
 * @param {number} [props.pageSize=10] - Items per page
 * @param {boolean} [props.serverSide=false] - Enable server-side pagination/sorting
 * @param {number} [props.totalItems] - Total items for server-side pagination
 * @param {Function} [props.onPageChange] - Server-side page change callback
 * @param {Function} [props.onSortChange] - Server-side sort change callback
 * @param {Function} [props.onFilterChange] - Server-side filter change callback
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.emptyState] - Custom empty state component
 * 
 * @example
 * const columns = [
 *   { key: 'id', label: 'ID', sortable: true },
 *   { key: 'name', label: 'Name', sortable: true, filterable: true },
 *   { key: 'email', label: 'Email' },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   onEdit={(row) => console.log('Edit', row)}
 *   onDelete={(row) => console.log('Delete', row)}
 *   selectable
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 */
export const DataTable = memo(function DataTable({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  selectable = false,
  onSelectionChange,
  pageSize: initialPageSize = 10,
  serverSide = false,
  totalItems,
  onPageChange,
  onSortChange,
  onFilterChange,
  className = '',
  emptyState,
}) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  /**
   * Handle sort change
   */
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    
    if (serverSide && onSortChange) {
      onSortChange(key, sortConfig.direction === 'asc' ? 'desc' : 'asc');
    }
    
    setCurrentPage(1);
  }, [serverSide, onSortChange, sortConfig.direction]);
  
  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    
    if (serverSide && onFilterChange) {
      onFilterChange({ ...filters, [key]: value });
    }
    
    setCurrentPage(1);
  }, [serverSide, onFilterChange, filters]);
  
  /**
   * Handle row selection
   */
  const handleRowSelect = useCallback((rowId, isSelected) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSet));
      }
      
      return newSet;
    });
  }, [onSelectionChange]);
  
  /**
   * Handle select all
   */
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      const allIds = new Set(paginatedData.map(row => row.id));
      setSelectedRows(allIds);
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIds));
      }
    } else {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  }, [onSelectionChange]);
  
  /**
   * Filter data (client-side only)
   */
  const filteredData = useMemo(() => {
    if (serverSide) return data;
    
    return data.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key].toString().toLowerCase();
        const rowValue = (row[key] || '').toString().toLowerCase();
        return rowValue.includes(filterValue);
      });
    });
  }, [data, filters, serverSide]);
  
  /**
   * Sort data (client-side only)
   */
  const sortedData = useMemo(() => {
    if (serverSide || !sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, serverSide]);
  
  /**
   * Paginate data (client-side only)
   */
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, serverSide, data]);
  
  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    const total = serverSide ? totalItems : sortedData.length;
    return Math.ceil(total / pageSize);
  }, [serverSide, totalItems, sortedData.length, pageSize]);
  
  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    if (serverSide && onPageChange) {
      onPageChange(page);
    }
  }, [serverSide, onPageChange]);
  
  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1);
    
    if (serverSide && onPageChange) {
      onPageChange(1);
    }
  }, [serverSide, onPageChange]);
  
  // Filterable columns
  const filterableColumns = useMemo(() => {
    return columns.filter(col => col.filterable);
  }, [columns]);
  
  return (
    <div className={`vasuzex-datatable ${className}`}>
      {/* Filters */}
      {filterableColumns.length > 0 && (
        <Filters
          columns={filterableColumns}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
      
      {/* Table Actions */}
      {selectable && selectedRows.size > 0 && (
        <TableActions
          selectedCount={selectedRows.size}
          onClearSelection={() => {
            setSelectedRows(new Set());
            if (onSelectionChange) onSelectionChange([]);
          }}
        />
      )}
      
      {/* Table */}
      <div className="vasuzex-datatable-wrapper">
        <table className="vasuzex-datatable-table">
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            allSelected={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
            onSelectAll={handleSelectAll}
          />
          <TableBody
            data={paginatedData}
            columns={columns}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            selectable={selectable}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            emptyState={emptyState}
          />
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={serverSide ? totalItems : sortedData.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
});

DataTable.propTypes = {
  /** Array of data objects to display in the table */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Column configuration array */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  /** Callback when edit button is clicked */
  onEdit: PropTypes.func,
  /** Callback when delete button is clicked */
  onDelete: PropTypes.func,
  /** Callback when view button is clicked */
  onView: PropTypes.func,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Enable row selection checkboxes */
  selectable: PropTypes.bool,
  /** Callback when row selection changes */
  onSelectionChange: PropTypes.func,
  /** Number of rows per page */
  pageSize: PropTypes.number,
  /** Enable server-side pagination/sorting/filtering */
  serverSide: PropTypes.bool,
  /** Total number of items (for server-side pagination) */
  totalItems: PropTypes.number,
  /** Callback when page changes (server-side) */
  onPageChange: PropTypes.func,
  /** Callback when sort changes (server-side) */
  onSortChange: PropTypes.func,
  /** Callback when filter changes (server-side) */
  onFilterChange: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Custom empty state component */
  emptyState: PropTypes.node,
  /** Show action buttons (edit, delete, view) */
  actions: PropTypes.shape({
    edit: PropTypes.bool,
    delete: PropTypes.bool,
    view: PropTypes.bool,
  }),
};

DataTable.defaultProps = {
  loading: false,
  selectable: false,
  pageSize: 10,
  serverSide: false,
  className: '',
  actions: {
    edit: false,
    delete: false,
    view: false,
  },
};

export default DataTable;
