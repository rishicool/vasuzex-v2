import React from "react";
import { Link } from "react-router-dom";
import { Switch } from "../Switch";
import {
  applyActionDefaults,
  createViewClickHandler,
  createDeleteClickHandler,
  createHardDeleteClickHandler,
  createRestoreClickHandler,
  ACTION_DEFAULTS,
} from "./ActionDefaults.jsx";

/**
 * TableBody Component - Production Ready
 *
 * Table body with data rows, column rendering, and action buttons.
 * Handles Switch component for status toggle.
 * Trash-aware: when trashMode='only', delete becomes hardDelete with warning;
 * restore button shown automatically for trashed rows.
 *
 * @module components/DataTable/TableBody
 */
export function TableBody({
  api,
  data,
  columns,
  actions,
  loading,
  emptyText,
  onStatusToggle,
  resourceName,
  resourceIdField = "id",
  onRefresh,
  // Trash support: 'without' | 'with' | 'only'
  trashMode,
  // URL for the restore endpoint (e.g. "/products/:id/restore")
  restoreUrl,
}) {
  if (loading) {
    const skeletonRows = Array.from({ length: 5 });
    const colCount = columns.length + (actions ? 1 : 0);
    return (
      <>
        {skeletonRows.map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-gray-200 dark:border-gray-700 animate-pulse">
            {Array.from({ length: colCount }).map((_, colIdx) => (
              <td key={colIdx} className="px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }
  
  if (data.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
          {emptyText || "No data found"}
        </td>
      </tr>
    );
  }
  
  return (
    <>
      {data.map((row, idx) => (
        <tr
          key={row[resourceIdField] ?? row.id ?? row._id ?? idx}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          {/* Render Columns */}
          {columns.map((col) => (
            <td key={col.field} className={col.className || "px-6 py-4"}>
              {col.render ? (
                col.render(row)
              ) : col.field === "status" && onStatusToggle ? (
                <Switch
                  checked={row.is_active ?? row.isActive ?? row.status === "active"}
                  onChange={() => onStatusToggle(row)}
                  className="react-switch-status"
                  id={`switch-status-${row[resourceIdField] ?? row.id ?? row._id ?? idx}`}
                />
              ) : (
                row[col.field]
              )}
            </td>
          ))}
          
          {/* Render Actions */}
          {actions && (
            <td className="px-2 py-2 text-right">
              <div className="flex items-center justify-end gap-2">
                {actions.map((userAction, actionIdx) => {
                  // Check visibility first
                  if (userAction.isVisible && !userAction.isVisible(row)) {
                    return null;
                  }

                  // In trash-only mode: skip edit/switch/status-toggle actions
                  if (trashMode === 'only' && ['edit', 'switch'].includes(userAction.name)) {
                    return null;
                  }

                  // Apply defaults based on action name
                  const action = applyActionDefaults(userAction, resourceName, resourceIdField);

                  // Handle switch action
                  if (action.type === "button" && action.name === "switch") {
                    const isActive = row.is_active ?? row.isActive ?? row.status === "active";
                    return (
                      <div key={actionIdx} className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onChange={() => onStatusToggle && onStatusToggle(row)}
                          className="react-switch-status"
                          id={`switch-action-${row[resourceIdField] ?? row.id ?? row._id ?? idx}`}
                        />
                      </div>
                    );
                  }

                  // Handle view action with automatic modal dispatch
                  if (action.type === "button" && action.name === "view") {
                    const viewAction = action;
                    if (viewAction.apiUrl && !userAction.onClick) {
                      viewAction.onClick = createViewClickHandler(
                        api,
                        viewAction.apiUrl,
                        viewAction.modalEvent,
                        resourceIdField,
                      );
                    }
                  }

                  // Handle delete action:
                  // — in trash-only mode, OR when row is already soft-deleted (has deleted_at) → hard-delete with permanent-delete confirmation
                  // — normal mode → soft-delete with standard confirmation
                  if (action.type === "button" && action.name === "delete") {
                    const deleteAction = action;
                    if (deleteAction.deleteUrl && !userAction.onClick) {
                      const isAlreadyTrashed = !!row.deleted_at;
                      if (trashMode === 'only' || isAlreadyTrashed) {
                        // Override to hardDelete
                        deleteAction.onClick = createHardDeleteClickHandler(
                          api,
                          deleteAction.deleteUrl,
                          deleteAction.confirmMessage || "This will permanently remove the record from the database. This action cannot be undone.",
                          resourceIdField,
                          {
                            confirmTitle: "Permanently Delete?",
                            confirmButtonText: "Yes, permanently delete!",
                            successMessage: deleteAction.successMessage || "Permanently deleted",
                            onRefresh,
                          },
                        );
                        // Apply hardDelete styling
                        if (!userAction.className) {
                          deleteAction.className = ACTION_DEFAULTS.hardDelete.extraClass;
                        }
                        deleteAction.title = "Permanently Delete";
                      } else {
                        deleteAction.onClick = createDeleteClickHandler(
                          api,
                          deleteAction.deleteUrl,
                          deleteAction.confirmMessage || "Are you sure you want to delete this item?",
                          resourceIdField,
                          {
                            confirmTitle: deleteAction.confirmTitle,
                            confirmButtonText: deleteAction.confirmButtonText,
                            successMessage: deleteAction.successMessage,
                            onRefresh,
                          },
                        );
                      }
                    }
                  }

                  // Get icon, class, title, and content
                  const Icon = action.icon;
                  const className =
                    typeof action.className === "function"
                      ? action.className(row)
                      : action.className || action.extraClass || "";
                  const title =
                    typeof action.title === "function"
                      ? action.title(row)
                      : action.title || action.label || "";
                  const content = action.renderContent ? (
                    action.renderContent(row)
                  ) : Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    action.label
                  );

                  // Render link
                  if (action.type === "link") {
                    const linkAction = action;
                    return (
                      <Link
                        key={actionIdx}
                        to={linkAction.getHref ? linkAction.getHref(row) : "#"}
                        className={className}
                        title={title}
                      >
                        {content}
                      </Link>
                    );
                  }

                  // Render button
                  if (action.type === "button") {
                    const buttonAction = action;
                    return (
                      <button
                        key={actionIdx}
                        onClick={() => buttonAction.onClick && buttonAction.onClick(row)}
                        className={className}
                        title={title}
                      >
                        {content}
                      </button>
                    );
                  }

                  return null;
                })}

                {/* Auto-inject Restore button when trashMode is active and row is trashed */}
                {restoreUrl && (trashMode === 'only' || (trashMode === 'with' && row.deleted_at)) && (() => {
                  const handler = createRestoreClickHandler(api, restoreUrl, resourceIdField, { onRefresh });
                  const Icon = ACTION_DEFAULTS.restore.icon;
                  return (
                    <button
                      key="auto-restore"
                      onClick={() => handler(row)}
                      className={ACTION_DEFAULTS.restore.extraClass}
                      title="Restore"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })()}
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
