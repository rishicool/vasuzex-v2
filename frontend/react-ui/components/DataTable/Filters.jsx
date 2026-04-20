import React from "react";
import { RefreshCw, Trash2 } from "lucide-react";

/**
 * Filters Component - Production Ready
 *
 * Status filters (All/Active/Inactive), rows per page selector, trash tabs,
 * and a refresh button.
 *
 * @module components/DataTable/Filters
 */
export const Filters = ({
  statusFilter,
  setStatusFilter,
  setPage,
  page,
  limit,
  setLimit,
  dataLength,
  totalItems,
  onRefresh,
  // Trash support
  trashable,
  trashed,
  setTrashed,
}) => (
  <div className="flex flex-col gap-2 px-2 py-2 text-xs text-gray-600 w-full">
    {/* Row 1: Rows-per-page selector + showing info + refresh (always fits on one line) */}
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-gray-500">Rows:</label>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-xs outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      <span className="text-xs text-gray-500 shrink-0">
        {totalItems === 0 ? "0 items" : `${(page - 1) * limit + 1}–${Math.min(page * limit, totalItems)} of ${totalItems}`}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          title="Refresh"
          className="ml-auto p-1.5 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>

    {/* Row 2: Status filter + Trash tabs (wraps cleanly on small screens) */}
    {((!trashable || trashed !== 'only') || trashable) && (
      <div className="flex items-center flex-wrap gap-2">
        {/* Status filter buttons — hidden when viewing only-trash */}
        {(!trashable || trashed !== 'only') && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${statusFilter === "all" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => { setStatusFilter("true"); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${statusFilter === "true" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
            >
              Active
            </button>
            <button
              onClick={() => { setStatusFilter("false"); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${statusFilter === "false" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
            >
              Inactive
            </button>
          </div>
        )}

        {/* Trash tabs (only shown when trashable=true) */}
        {trashable && (
          <div className="flex items-center gap-1">
            <Trash2 className="h-3 w-3 text-gray-400 mr-0.5" />
            <button
              onClick={() => { setTrashed('without'); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${trashed === 'without' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              Live
            </button>
            <button
              onClick={() => { setTrashed('with'); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${trashed === 'with' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              With Trash
            </button>
            <button
              onClick={() => { setTrashed('only'); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${trashed === 'only' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              Trash
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);
