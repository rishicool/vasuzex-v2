import React from "react";

/**
 * Skeleton pulse block – light-grey bar that animates.
 * Width can be "full", "3/4", "1/2", "1/3" or a fixed px value.
 */
const SkeletonCell = ({ width = "3/4", height = "h-4" }) => {
  const widthClass =
    width === "full" ? "w-full" :
    width === "3/4"  ? "w-3/4"  :
    width === "1/2"  ? "w-1/2"  :
    width === "1/3"  ? "w-1/3"  :
    width === "1/4"  ? "w-1/4"  : width;

  return (
    <div
      className={`${height} ${widthClass} rounded bg-gray-200 dark:bg-gray-700 animate-pulse`}
    />
  );
};

/**
 * A single skeleton row matching the number of visible columns + optional action column.
 * Alternates bar widths so the shimmer does not look monotonous.
 */
const WIDTHS = ["3/4", "1/2", "full", "1/3", "3/4", "1/2"];

const SkeletonRow = ({ colSpan }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    {Array.from({ length: colSpan }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <SkeletonCell width={WIDTHS[i % WIDTHS.length]} />
      </td>
    ))}
  </tr>
);

/**
 * TableState Component
 * Handles loading (skeleton rows) and empty states for DataTable
 */
export const TableState = ({ loading, empty, colSpan, emptyText, skeletonRows = 6 }) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <SkeletonRow key={i} colSpan={colSpan} />
        ))}
      </>
    );
  }
  if (empty) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-8 text-gray-500">
          {emptyText || "No data found"}
        </td>
      </tr>
    );
  }
  return null;
};
