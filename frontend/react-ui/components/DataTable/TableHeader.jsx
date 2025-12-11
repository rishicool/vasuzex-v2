import React from "react";

/**
 * TableHeader Component - Production Ready
 * 
 * Table header with sortable columns and column-level search inputs
 * 
 * @module components/DataTable/TableHeader
 */
export function TableHeader({
  columns,
  actions,
  sortBy,
  sortOrder,
  handleSort,
  columnSearch,
  setColumnSearch,
}) {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
      {/* Header Row with Labels and Sort Icons */}
      <tr>
        {columns.map((col) => (
          <th
            key={col.field}
            className={col.className || "px-6 py-4"}
            style={col.sortable ? { cursor: "pointer" } : undefined}
            onClick={col.sortable ? () => handleSort(col.field) : undefined}
          >
            <div className="flex items-center">
              {col.label}
              {col.sortable && (
                <span className="ml-1">
                  {sortBy === col.field ? (
                    sortOrder === "asc" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )
                  ) : (
                    <svg
                      className="w-4 h-4 opacity-30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
        {actions && <th className="px-6 py-4 text-right">Actions</th>}
      </tr>
      
      {/* Search Row with Input Fields */}
      <tr>
        {columns.map((col) => {
          // Don't show search input for non-searchable columns
          if (col.searchable === false || col.field === "logo" || col.label === "Actions") {
            return <th key={col.field}></th>;
          }

          return (
            <th key={col.field} className={col.className || "px-6 py-2"}>
              <input
                type="text"
                value={columnSearch[col.field] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setColumnSearch({ ...columnSearch, [col.field]: value });
                }}
                placeholder={`${col.label}`}
                className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring dark:bg-gray-800 dark:border-gray-600"
              />
            </th>
          );
        })}
        {actions && <th className="px-6 py-2 text-right"></th>}
      </tr>
    </thead>
  );
}
