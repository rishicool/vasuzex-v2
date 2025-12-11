import React from "react";

/**
 * Pagination Component - Production Ready
 * 
 * Pagination controls with page numbers, previous/next buttons
 * 
 * @module components/DataTable/Pagination
 */
export const Pagination = ({ page, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="text-sm text-gray-700 dark:text-gray-400">
      Page {page} of {totalPages}
    </div>
    <div className="flex gap-2 items-center">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Previous
      </button>
      {page > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`rounded-lg border px-3 py-1 text-sm font-medium mx-0.5 ${page === 1 ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}
          >
            1
          </button>
          <span className="text-gray-400">...</span>
        </>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(
          (p) =>
            p === page ||
            p === page - 1 ||
            p === page + 1 ||
            (page <= 3 && p <= 4) ||
            (page >= totalPages - 2 && p >= totalPages - 3),
        )
        .map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg border px-3 py-1 text-sm font-medium mx-0.5 ${p === page ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}
          >
            {p}
          </button>
        ))}
      {page < totalPages - 2 && (
        <>
          <span className="text-gray-400">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className={`rounded-lg border px-3 py-1 text-sm font-medium mx-0.5 ${page === totalPages ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  </div>
);
