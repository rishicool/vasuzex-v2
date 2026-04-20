import React from 'react';
import { Link } from 'react-router-dom';
import {
  applyActionDefaults,
  createViewClickHandler,
  createDeleteClickHandler,
  createHardDeleteClickHandler,
  createRestoreClickHandler,
} from './ActionDefaults.jsx';

// ─── MobileCardList ──────────────────────────────────────────────────────────
//
// Column priority system:
//   primary        — shown full-width, no label prefix (first = bold title)
//   secondary      — compact label:value pairs below a divider
//   hidden-mobile  — never shown
//
// If no column has priority set:
//   first 3 columns → primary | rest → secondary

export function MobileCardList({
  api,
  data,
  columns,
  actions,
  loading,
  emptyText,
  resourceName,
  resourceIdField = 'id',
  onRefresh,
  trashMode,
  restoreUrl,
}) {
  const hasPriority = columns.some((c) => c.priority);

  // Detect column-based actions (render fn inside field:'actions' column)
  const actionsColumn = columns.find((c) => c.field === 'actions');

  let primaryColumns, secondaryColumns;
  if (hasPriority) {
    primaryColumns = columns.filter((c) => c.priority === 'primary' && c.field !== 'actions');
    secondaryColumns = columns.filter((c) => c.priority === 'secondary' && c.field !== 'actions');
  } else {
    // No priority set — treat first 3 visible columns as primary, rest as secondary
    const visible = columns.filter((c) => c.field !== 'actions');
    primaryColumns = visible.slice(0, 3);
    secondaryColumns = visible.slice(3);
  }

  const renderCell = (col, row) => {
    if (col.render) return col.render(row);
    const val = row[col.field];
    return (val === undefined || val === null) ? '—' : String(val);
  };

  // ── Skeleton loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
            <div className="flex gap-2 mt-3">
              <div className="h-7 bg-gray-100 rounded w-16" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">{emptyText || 'No data found'}</p>
      </div>
    );
  }

  // ── Card list ──────────────────────────────────────────────────────────────
  return (
    <div className="divide-y divide-gray-100">
      {data.map((row, idx) => {
        const rowId = row[resourceIdField] ?? row.id ?? row._id ?? idx;
        const isTrashed = !!row.deleted_at;
        const renderedColumnActions = actionsColumn && actionsColumn.render
          ? actionsColumn.render(row)
          : null;

        return (
          <div key={rowId} className={`p-4 ${isTrashed ? 'bg-red-50/40' : ''}`}>

            {/* ── Primary columns: title + body rows, no label prefix ── */}
            <div className="space-y-1.5 mb-3">
              {primaryColumns.map((col, colIdx) => {
                const content = renderCell(col, row);
                return (
                  <div
                    key={col.field}
                    className={colIdx === 0
                      ? 'text-sm font-semibold text-gray-900 leading-snug'
                      : 'text-sm text-gray-700 leading-snug'
                    }
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            {/* ── Secondary columns: compact label:value pairs ── */}
            {secondaryColumns.length > 0 && (
              <div className="border-t border-gray-100 pt-2 mb-3 space-y-1">
                {secondaryColumns.map((col) => (
                  <div key={col.field} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{col.label}</span>
                    <div className="text-xs text-gray-600 flex-1 min-w-0 break-words">{renderCell(col, row)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Trashed indicator ── */}
            {isTrashed && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Deleted
                </span>
              </div>
            )}

            {/* ── Actions ── */}
            {/* Column-based actions (e.g. RowActionsCellExtended) take precedence */}
            {renderedColumnActions ? (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {renderedColumnActions}
              </div>
            ) : actions && actions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {actions.map((actionDef) => {
                  const action = applyActionDefaults(actionDef, resourceName, resourceIdField);
                  const Icon = action.icon;

                  // Switch toggle — skip in mobile card
                  if (action.name === 'switch') return null;

                  // Trash-mode visibility rules
                  const isDeleteAction = action.name === 'delete';
                  const isHardDelete = action.name === 'hardDelete';
                  const isRestore = action.name === 'restore';
                  if (trashMode === 'only' && isDeleteAction) return null;
                  if (trashMode !== 'only' && (isHardDelete || isRestore)) return null;

                  // Resolve onClick
                  let onClick = action.onClick ? () => action.onClick(row) : null;
                  if (!onClick) {
                    if (isHardDelete && action.deleteUrl) {
                      const handler = createHardDeleteClickHandler(api, action.deleteUrl, action.confirmMessage, resourceIdField, { onRefresh });
                      onClick = () => handler(row);
                    } else if (isRestore && restoreUrl) {
                      const handler = createRestoreClickHandler(api, restoreUrl, resourceIdField, { onRefresh });
                      onClick = () => handler(row);
                    } else if (isDeleteAction && action.deleteUrl) {
                      const handler = createDeleteClickHandler(api, action.deleteUrl, action.confirmMessage, resourceIdField, { onRefresh });
                      onClick = () => handler(row);
                    } else if (action.name === 'view' && action.apiUrl) {
                      const handler = createViewClickHandler(api, action.apiUrl, action.modalEvent, resourceIdField);
                      onClick = () => handler(row);
                    }
                  }

                  const btnBase = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors';
                  const btnColor = (isDeleteAction || isHardDelete)
                    ? 'border-red-200 bg-white text-red-600 hover:bg-red-50'
                    : isRestore
                    ? 'border-green-200 bg-white text-green-700 hover:bg-green-50'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50';

                  if (action.type === 'link' && action.getHref) {
                    return (
                      <Link
                        key={action.name || action.label}
                        to={action.getHref(row)}
                        title={action.title || action.label}
                        className={`${btnBase} ${btnColor} ${action.extraClass || ''}`}
                      >
                        {Icon && <Icon size={12} />}
                        <span>{action.label || action.title}</span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={action.name || action.label}
                      type="button"
                      title={action.title || action.label}
                      onClick={onClick}
                      className={`${btnBase} ${btnColor} ${action.extraClass || ''}`}
                    >
                      {Icon && <Icon size={12} />}
                      <span>{action.label || action.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MobileCardList;

