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
 */

// URL params that DataTable owns — all other params (e.g. trashed) are preserved as-is
const DT_PARAMS = ['page', 'sortBy', 'sortOrder', 'search', 'statusFilter', 'limit'];

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
    trashable = false, // Enable trash/restore UI (Live / With Trash / Trash tabs)
    restoreUrl, // URL template for restore, e.g. "/products/:id/restore"
    initialTrashed = 'without', // Initial trash mode: 'without' | 'with' | 'only'
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
  // Debounced version of columnSearch — API is only called once the user pauses typing
  const [debouncedColumnSearch, setDebouncedColumnSearch] = React.useState(urlState.columnSearch);
  const columnSearchDebounceRef = React.useRef(null);

  // Abort controller for in-flight requests — cancelled whenever new fetch params arrive
  const abortControllerRef = React.useRef(null);

  const [trashed, setTrashed] = React.useState(initialTrashed);

  const [data, setData] = React.useState([]);
  // Start as true: skeleton shows immediately on first render before the initial fetch.
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  /**
   * Update URL with current state
   * Uses replaceState to avoid polluting browser history with every filter change
   * Only includes non-default values to keep URL clean
   */
  const updateURL = React.useCallback((state) => {
    if (!persistState || typeof window === 'undefined') return;

    // Always read from window.location.search (current, live URL) not from
    // the searchParams closure — the closure can be one render behind when
    // the parent just called setSearchParams in the same batch.
    const current = new URLSearchParams(window.location.search);

    // Remove DataTable-managed params
    DT_PARAMS.forEach(k => current.delete(k));
    for (const key of [...current.keys()]) {
      if (key.startsWith('columnSearch[')) current.delete(key);
    }

    // Re-add non-default values to keep URL clean
    if (state.page !== 1) current.set('page', state.page);
    if (state.sortBy) current.set('sortBy', state.sortBy);
    if (state.sortOrder !== initialSortOrder) current.set('sortOrder', state.sortOrder);
    if (state.search) current.set('search', state.search);
    if (state.statusFilter !== 'all') current.set('statusFilter', state.statusFilter);
    if (state.limit !== (initialLimit || 10)) current.set('limit', state.limit);

    // Add column search params
    Object.entries(state.columnSearch || {}).forEach(([field, value]) => {
      if (value) current.set(`columnSearch[${field}]`, value);
    });

    // Use React Router if available, otherwise window.history
    if (hasReactRouter && setSearchParams) {
      setSearchParams(current, { replace: true });
    } else if (typeof window !== 'undefined') {
      const newURL = current.toString()
        ? `${window.location.pathname}?${current.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newURL);
    }
  }, [persistState, hasReactRouter, setSearchParams, initialSortOrder, initialLimit]);

  /**
   * Sync URL whenever DataTable state changes
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

  // Debounce columnSearch — user sees immediate input response, but API call waits 400ms
  // Also syncs back if columnSearch is set programmatically (URL restore / browser back)
  React.useEffect(() => {
    if (columnSearchDebounceRef.current) {
      clearTimeout(columnSearchDebounceRef.current);
    }
    columnSearchDebounceRef.current = setTimeout(() => {
      setDebouncedColumnSearch(columnSearch);
    }, 400);
    return () => {
      if (columnSearchDebounceRef.current) {
        clearTimeout(columnSearchDebounceRef.current);
      }
    };
  }, [columnSearch]);

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
  
  // Reset page to 1 when debouncedColumnSearch changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedColumnSearch]);

  // useLayoutEffect fires synchronously after DOM mutation, before paint.
  // This guarantees the skeleton is committed to the DOM before ANY passive
  // effect (useEffect) runs — which is where fetchData and the API call live.
  // Without this, React 18 + createRoot batches setLoading(true) with the
  // fast localhost API response into one render, so the skeleton never paints.
  //
  // Skip the very first run (initial mount) because loading already starts as
  // true, and fetchData's own useEffect handles the first fetch.
  const isFirstRender = React.useRef(true);
  React.useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLoading(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder, statusFilter, limit, search, debouncedColumnSearch, trashable, trashed, refreshKey, refreshSignal]);

  const fetchData = React.useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // loading=true is already set synchronously by useLayoutEffect before this
    // effect runs. Do not set it here — that caused React 18 batching issues.
    let wasAborted = false;
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (statusFilter !== "all") params.append("isActive", statusFilter);
      if (search) params.append("search", search);
      // Add debounced column search params
      Object.entries(debouncedColumnSearch).forEach(([field, value]) => {
        if (value) params.append(`columnSearch[${field}]`, value);
      });

      // Append trashed param when trashable mode is active
      if (trashable) params.append('trashed', trashed);

      // Properly append params to apiUrl (check if apiUrl already has query params)
      const separator = apiUrl.includes('?') ? '&' : '?';
      const result = await api.get(`${apiUrl}${separator}${params}`, { signal });

      // Handle nested data structure: result.data.data OR result.data.items
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.data || result.data?.items || []);
      const pagination = result.data?.pagination || result.pagination;

      setData(items);
      setTotalPages(pagination?.totalPages || 1);
      setTotalItems(pagination?.total || 0);
    } catch (err) {
      // Abort errors are expected when a newer request supersedes this one — do not
      // reset loading state because the new request is already in flight with loading=true.
      if (err && (err.name === 'AbortError' || err.code === 'ERR_CANCELED')) {
        wasAborted = true;
      } else {
        setData([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } finally {
      // Only clear loading when this request completed normally (not aborted).
      // An aborted request means a newer fetch is already running with loading=true.
      if (!wasAborted) {
        setLoading(false);
      }
    }
  }, [api, apiUrl, page, sortBy, sortOrder, statusFilter, limit, search, debouncedColumnSearch, trashable, trashed]);

  // Always-current ref to fetchData — lets refreshSignal and refreshKey effects
  // call the latest fetchData without including fetchData in their dep arrays.
  // This prevents double-fetches: if fetchData were in refreshSignal's deps, the
  // effect would fire on EVERY sort/search (because fetchData recreates whenever
  // its own deps change), causing two concurrent requests.
  const fetchDataRef = React.useRef(fetchData);
  fetchDataRef.current = fetchData;

  // Trigger fetchData for main params.
  //
  // Why rAF + setTimeout(0):
  // Browser frame sequence: macro-task → microtasks → rAF callbacks → layout+PAINT → next macro-task.
  // useLayoutEffect commits loading=true (skeleton) synchronously during the commit phase.
  // Passive effects (useEffect) run as a MessageChannel macro-task.
  // Inside that macro-task we schedule rAF, which fires PRE-paint of the current frame.
  // Inside rAF we schedule setTimeout(0), which queues as a MACRO-TASK — meaning it fires
  // AFTER the browser completes layout+paint for the current frame.
  // Result: skeleton is guaranteed to be painted to screen before fetchData() opens the XHR.
  React.useEffect(() => {
    let rafId;
    let timerId;
    rafId = requestAnimationFrame(() => {
      timerId = setTimeout(() => {
        fetchDataRef.current();
      }, 0);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [fetchData]);

  // Trigger fetchData when refreshSignal changes.
  // fetchData is intentionally NOT in deps — we use fetchDataRef to avoid re-firing
  // this effect on every sort/search (which would cause a double-fetch).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (typeof refreshSignal !== 'undefined') {
      let rafId;
      let timerId;
      rafId = requestAnimationFrame(() => {
        timerId = setTimeout(() => {
          fetchDataRef.current();
        }, 0);
      });
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }
  }, [refreshSignal]);

  // Internal refresh after status toggle.
  // fetchData is intentionally NOT in deps — same reason as refreshSignal above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (refreshKey > 0) {
      let rafId;
      let timerId;
      rafId = requestAnimationFrame(() => {
        timerId = setTimeout(() => {
          fetchDataRef.current();
        }, 0);
      });
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }
  }, [refreshKey]);

  // Abort any in-flight request when the component unmounts
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
            onRefresh={() => setRefreshKey((k) => k + 1)}
            trashable={trashable}
            trashed={trashed}
            setTrashed={(val) => { setTrashed(val); setPage(1); }}
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
                trashMode={trashed}
                restoreUrl={restoreUrl}
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
