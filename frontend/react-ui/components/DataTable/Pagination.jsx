import React, { useState } from "react";

/**
 * Pagination Component - Production Ready
 * 
 * Pagination controls with page numbers, previous/next buttons
 * Mobile: compact Prev / Page X of Y (jump input) / Next layout
 * Desktop: full numbered page buttons
 * 
 * @module components/DataTable/Pagination
 */
export const Pagination = ({ page, totalPages, onPageChange }) => {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const val = parseInt(jumpValue, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        onPageChange(val);
      }
      setJumpValue('');
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">

      {/* ── Mobile: compact layout (hidden on sm+) ── */}
      <div className="sm:hidden px-3 py-3 space-y-2">
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </div>

        <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJump}
            onBlur={handleJump}
            placeholder="page"
            className="w-16 rounded border border-gray-300 px-2 py-0.5 text-xs text-center outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      {/* ── Desktop: full numbered layout (hidden below sm) ── */}
      <div className="hidden sm:flex items-center justify-between px-6 py-4">
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

    </div>
  );
};


