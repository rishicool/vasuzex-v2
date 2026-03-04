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
 * - URL-based state persistence (page, sort, filters in query params)
 * 
 * @module components/DataTable
 */

import React from "react";
import { TableBody } from "./TableBody.jsx";
import { Filters } from "./Filters.jsx";
import { TableHeader } from "./TableHeader.jsx";
import { TableState } from "./TableState.jsx";
import { Pagination } from "./Pagination.jsx";

// Conditional import for React Router (optional dependency)
let useSearchParamsHook = null;
let useLocationHook = null;

try {
  const routerModule = require('react-router-dom');
  useSearchParamsHook = routerModule.useSearchParams;
  useLocationHook = routerModule.useLocation;
} catch (e) {
  // React Router not available - will use plain window.history
}

/**
 * Production-ready DataTable with complete server-side functionality
 * 
 * State is persisted in URL query parameters, ensuring:
 * - Each page has unique, isolated state
 * - Browser back/forward buttons work correctly
 * - Users can bookmark specific table states
 * - No state bleeding between different DataTables
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
 * @param {string} props.initialSortBy - Initial sort field (fallback if no URL param)
 * @param {string} props.initialSortOrder - Initial sort order (asc/desc)
 * @param {string} props.initialStatusFilter - Initial status filter (all/true/false)
 * @param {number} props.initialLimit - Initial rows per page
 * @param {string} props.emptyText - Text to show when no data
 * @param {boolean} props.persistState - Enable URL state persistence (default: true)
 * @param {Object} props.stickyParams - Extra params always preserved in the URL (e.g. { trashed: 'only' })
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
    persistState = true, // Enable URL-based state persistence by default
    stickyParams = {}, // Extra URL params always preserved (e.g. trashed filter)
  } = props;

  // Validate that api client is provided
  if (!api) {
    throw new Error('DataTable requires "api" prop - pass your API client instance');
  }

  // React Router hooks must be called unconditionally
  // Call them if available, but handle errors gracefully
  let searchParams = null;
  let setSearchParams = null;
  let location = null;
  
  try {
    if (useSearchParamsHook) {
      [searchParams, setSearchParams] = useSearchParamsHook();
    }
    if (useLocationHook) {
      location = useLocationHook();
    }
  } catch (e) {
    
    // Hooks not available or failed - will use window.history
    searchParams = null;
    setSearchParams = null;
    location = null;
  }
  
  const hasReactRouter = !!(searchParams && setSearchParams);
  
  

  /**
   * Load state from URL query parameters
   * This provides natural isolation between different pages/DataTables
   */
  const loadStateFromURL = React.useCallback(() => {
    if (!persistState || typeof window === 'undefined') {
      return {
        page: initialPage,
        sortBy: initialSortBy || (columns.find((c) => c.sortable)?.field) || "",
        sortOrder: initialSortOrder,
        search: initialSearch || "",
        statusFilter: initialStatusFilter || "all",
        limit: initialLimit || 10,
        columnSearch: {},
      };
    }

    // Use React Router searchParams or fallback to URLSearchParams
    const params = hasReactRouter && searchParams
      ? searchParams
      : new URLSearchParams(window.location.search);
    
    // Parse column search from URL params (columnSearch[fieldName]=value format)
    const columnSearch = {};
    for (const [key, value] of params.entries()) {
      const match = key.match(/^columnSearch\[(.+)\]$/);
      if (match && value) {
        columnSearch[match[1]] = value;
      }
    }
    
    return {
      page: parseInt(params.get('page')) || initialPage,
      sortBy: params.get('sortBy') || initialSortBy || (columns.find((c) => c.sortable)?.field) || "",
      sortOrder: params.get('sortOrder') || initialSortOrder,
      search: params.get('search') || initialSearch || "",
      statusFilter: params.get('statusFilter') || initialStatusFilter || "all",
      limit: parseInt(params.get('limit')) || initialLimit || 10,
      columnSearch,
    };
  }, [persistState, initialPage, initialSortBy, initialSortOrder, initialSearch, initialStatusFilter, initialLimit, columns, hasReactRouter, searchParams]);

  // Initialize state from URL
  const urlState = loadStateFromURL();
  
  const [page, setPage] = React.useState(urlState.page);
  const [sortBy, setSortBy] = React.useState(urlState.sortBy);
  const [sortOrder, setSortOrder] = React.useState(urlState.sortOrder);
  const [search, setSearch] = React.useState(urlState.search);
  const [statusFilter, setStatusFilter] = React.useState(urlState.statusFilter);
  const [limit, setLimit] = React.useState(urlState.limit);
  const [columnSearch, setColumnSearch] = React.useState(urlState.columnSearch);
  
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  /**
   * Update URL with current state
   * Uses replaceState to avoid polluting browser history with every filter change
   * Only includes non-default values to keep URL clean
   */
  const updateURL = React.useCallback((state) => {
    if (!persistState || typeof window === 'undefined') return;

    

    const params = new URLSearchParams();
    
    // Only add non-default values to keep URL clean
    if (state.page !== 1) params.set('page', state.page);
    if (state.sortBy) params.set('sortBy', state.sortBy);
    if (state.sortOrder !== initialSortOrder) params.set('sortOrder', state.sortOrder);
    if (state.search) params.set('search', state.search);
    if (state.statusFilter !== 'all') params.set('statusFilter', state.statusFilter);
    if (state.limit !== (initialLimit || 10)) params.set('limit', state.limit);
    
    // Add column search params
    Object.entries(state.columnSearch || {}).forEach(([field, value]) => {
      if (value) params.set(`columnSearch[${field}]`, value);
    });

    // Preserve sticky params (e.g. trashed filter managed by parent)
    Object.entries(stickyParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    });

    // Use React Router if available, otherwise window.history
    if (hasReactRouter && setSearchParams) {
      
      setSearchParams(params, { replace: true });
    } else if (typeof window !== 'undefined') {
      const newURL = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      
      
      window.history.replaceState({}, '', newURL);
    }
  }, [persistState, hasReactRouter, setSearchParams, stickyParams]);

  /**
   * Sync URL whenever state changes (stickyParams change also triggers this via updateURL dep)
   */
  React.useEffect(() => {
    updateURL({
      page,
      sortBy,
      sortOrder,
      search,
      statusFilter,
      limit,
      columnSearch,
    });
  }, [page, sortBy, sortOrder, search, statusFilter, limit, columnSearch, updateURL]);

  /**
   * Handle browser back/forward buttons
   * Reload state from URL when user navigates
   */
  React.useEffect(() => {
    if (!persistState || typeof window === 'undefined') return;
    if (hasReactRouter) return; // React Router handles this automatically

    const handlePopState = () => {
      const newState = loadStateFromURL();
      setPage(newState.page);
      setSortBy(newState.sortBy);
      setSortOrder(newState.sortOrder);
      setSearch(newState.search);
      setStatusFilter(newState.statusFilter);
      setLimit(newState.limit);
      setColumnSearch(newState.columnSearch);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [persistState, loadStateFromURL, hasReactRouter]);

  // For React Router: reload state when location.search changes
  // Only when React Router and manual browser navigation (not programmatic updates)
  React.useEffect(() => {
    if (!hasReactRouter || !location) return;
    
    // Avoid reacting to our own updates by checking if state already matches URL    const urlState = loadStateFromURL();
    const stateChanged = (
      urlState.page !== page ||
      urlState.sortBy !== sortBy ||
      urlState.sortOrder !== sortOrder ||
      urlState.search !== search ||
      urlState.statusFilter !== statusFilter ||
      urlState.limit !== limit ||
      JSON.stringify(urlState.columnSearch) !== JSON.stringify(columnSearch)
    );
    
    if (stateChanged) {
      setPage(urlState.page);
      setSortBy(urlState.sortBy);
      setSortOrder(urlState.sortOrder);
      setSearch(urlState.search);
      setStatusFilter(urlState.statusFilter);
      setLimit(urlState.limit);
      setColumnSearch(urlState.columnSearch);
    }
  }, [location?.search, hasReactRouter, loadStateFromURL]);

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

      // Properly append params to apiUrl (check if apiUrl already has query params)
      const separator = apiUrl.includes('?') ? '&' : '?';
      const result = await api.get(`${apiUrl}${separator}${params}`);

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
      <div className="mb-6 overflow-x-scroll rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
