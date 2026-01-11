import React from "react";
import { Link } from "react-router-dom";
import { Switch } from "../Switch";
import {
  applyActionDefaults,
  createViewClickHandler,
  createDeleteClickHandler,
} from "./ActionDefaults.jsx";

/**
 * TableBody Component - Production Ready
 * 
 * Table body with data rows, column rendering, and action buttons
 * Handles Switch component for status toggle
 * Auto-configures edit/view/delete actions
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
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
          Loading data...
        </td>
      </tr>
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
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {actions.map((userAction, actionIdx) => {
                  // Check visibility first
                  if (userAction.isVisible && !userAction.isVisible(row)) {
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

                  // Handle delete action with automatic confirmation
                  if (action.type === "button" && action.name === "delete") {
                    const deleteAction = action;
                    if (deleteAction.deleteUrl && !userAction.onClick) {
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

                  // Get icon, class, title, and content
                  const Icon = action.icon;
                  const className =
                    typeof action.className === "function"
                      ? action.className(row)
                      : action.className || "";
                  const title =
                    typeof action.title === "function"
                      ? action.title(row)
                      : action.title || action.label || "";
                  const content = action.renderContent ? (
                    action.renderContent(row)
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
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
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
