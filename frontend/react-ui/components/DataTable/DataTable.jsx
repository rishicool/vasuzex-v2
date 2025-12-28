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
