/**
 * DataTable Component - Production Ready
 * 
 * Complete server-side data table with:
 * - API integration (fetch, sort, filter, paginate)
 * - Status filters (All/Active/Inactive)
 * - Column-level search
 * - Sorting with visual indicators
 * - Pagination
 * - Rows per page selector
 * - Action buttons (edit/view/delete/switch)
 * - Loading and empty states
 * 
 * @module components/DataTable
 */

import React from "react";
import { TableBody } from "./TableBody.jsx";
import { Filters } from "./Filters.jsx";
import { TableHeader } from "./TableHeader.jsx";
import { TableState } from "./TableState.jsx";
import { Pagination } from "./Pagination.jsx";

/**
 * Production-ready DataTable with complete server-side functionality
 * 
 * @param {Object} props
 * @param {Object} props.api - API client instance (required)
 * @param {string} props.apiUrl - API endpoint for data fetching
 * @param {Array} props.columns - Column definitions with field, label, sortable, render
 * @param {Array} props.actions - Action buttons configuration
 * @param {Function} props.toggleLink - Function to generate toggle status URL
 * @param {string} props.resourceName - Resource name for route generation
 * @param {string} props.resourceIdField - ID field name (default: "id")
 * @param {number} props.refreshSignal - External refresh trigger
 * @param {string} props.initialSortBy - Initial sort field
 * @param {string} props.initialSortOrder - Initial sort order (asc/desc)
 * @param {string} props.initialStatusFilter - Initial status filter (all/true/false)
 * @param {number} props.initialLimit - Initial rows per page
 * @param {string} props.emptyText - Text to show when no data
 */
export function DataTable(props) {
  // Internal refresh key for self-refresh
  const [refreshKey, setRefreshKey] = React.useState(0);
  const {
    columns = [],
    apiUrl,
    emptyText = "No data found.",
    initialPage = 1,
    initialSortBy,
    initialSortOrder = "asc",
    initialSearch,
    initialStatusFilter,
    initialLimit,
    actions,
    toggleLink,
    refreshSignal,
    resourceName,
    resourceIdField = "id",
    onDelete,
    onToggle,
    api, // API client instance passed as prop
  } = props;

  // Validate that api client is provided
  if (!api) {
    throw new Error('DataTable requires "api" prop - pass your API client instance');
  }

  const handleStatusToggle = async (row) => {
    if (!toggleLink) return;
    try {
      const toast = (await import("react-toastify")).toast;
      await api.patch(toggleLink(row));
      // Use status field for message
      const status = row.status || (row.is_active || row.isActive ? "active" : "inactive");
      toast.success(`Status ${status === "active" ? "deactivated" : "activated"} successfully`);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      const toast = (await import("react-toastify")).toast;
      toast.error(error.message || "Failed to update status");
    }
  };

  const [page, setPage] = React.useState(initialPage);
  const [sortBy, setSortBy] = React.useState(
    initialSortBy || (columns.find((c) => c.sortable)?.field) || "",
  );
  const [sortOrder, setSortOrder] = React.useState(initialSortOrder);
  const [search, setSearch] = React.useState(initialSearch || "");
  const [statusFilter, setStatusFilter] = React.useState(initialStatusFilter || "all");
  const [limit, setLimit] = React.useState(initialLimit || 10);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  // Column search state
  const [columnSearch, setColumnSearch] = React.useState({});
  
  // Reset page to 1 when columnSearch changes
  React.useEffect(() => {
    setPage(1);
  }, [columnSearch]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (statusFilter !== "all") params.append("isActive", statusFilter);
      if (search) params.append("search", search);
      // Add column search params
      Object.entries(columnSearch).forEach(([field, value]) => {
        if (value) params.append(`columnSearch[${field}]`, value);
      });

      const result = await api.get(`${apiUrl}?${params}`);

      // Handle nested data structure: result.data.data OR result.data.items
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.data || result.data?.items || []);
      const pagination = result.data?.pagination || result.pagination;

      setData(items);
      setTotalPages(pagination?.totalPages || 1);
      setTotalItems(pagination?.total || 0);
    } catch (err) {
      setData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [api, apiUrl, page, sortBy, sortOrder, statusFilter, limit, search, columnSearch]);

  // Trigger fetchData for main params
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger fetchData when refreshSignal changes
  React.useEffect(() => {
    if (typeof refreshSignal !== 'undefined') {
      fetchData();
    }
  }, [refreshSignal, fetchData]);

  // Internal refresh after status toggle
  React.useEffect(() => {
    if (refreshKey > 0) {
      fetchData();
    }
  }, [refreshKey, fetchData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  return (
    <div className="overflow-x-auto w-full">
      {/* Filters and Controls */}
      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 p-3 dark:border-white/[0.05]">
          <Filters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setPage={setPage}
            page={page}
            limit={limit}
            setLimit={setLimit}
            dataLength={data.length}
            totalItems={totalItems}
          />
        </div>
        <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader
            columns={columns}
            actions={actions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
            columnSearch={columnSearch}
            setColumnSearch={setColumnSearch}
          />
          <tbody>
            <TableState
              loading={loading}
              empty={data.length === 0}
              colSpan={columns.length + (actions ? 1 : 0)}
              emptyText={emptyText}
            />
            {!loading && data.length > 0 && (
              <TableBody
                api={api}
                columns={columns}
                data={data}
                actions={actions}
                loading={loading}
                emptyText={emptyText}
                onStatusToggle={handleStatusToggle}
                resourceName={resourceName}
                resourceIdField={resourceIdField}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default DataTable;
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
