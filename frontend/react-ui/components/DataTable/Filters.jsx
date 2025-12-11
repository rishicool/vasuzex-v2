import React from "react";

/**
 * Filters Component - Production Ready
 * 
 * Status filters (All/Active/Inactive), rows per page selector, and showing info
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
}) => (
  <div className="flex items-start justify-between px-2 py-2 text-xs text-gray-600 w-full">
    {/* Left: Rows per page and Showing info */}
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1 whitespace-nowrap">
        <label className="text-xs">Rows per page:</label>
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
      <span className="whitespace-nowrap mt-1">
        Showing {totalItems === 0 ? 0 : (page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, totalItems)} of {totalItems} items
      </span>
    </div>
    {/* Right: Filter buttons */}
    <div className="flex-shrink-0 flex gap-2">
      <button
        onClick={() => {
          setStatusFilter("all");
          setPage(1);
        }}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === "all" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
      >
        All
      </button>
      <button
        onClick={() => {
          setStatusFilter("true");
          setPage(1);
        }}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === "true" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
      >
        Active
      </button>
      <button
        onClick={() => {
          setStatusFilter("false");
          setPage(1);
        }}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === "false" ? "bg-brand-600 text-white shadow-theme-xs" : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"}`}
      >
        Inactive
      </button>
    </div>
  </div>
);
