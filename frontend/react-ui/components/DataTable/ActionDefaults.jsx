import { Eye, Edit2, Trash2, RotateCcw, Flame } from "lucide-react";

/**
 * ActionDefaults - Production Ready
 * 
 * Default configurations for common DataTable actions
 * Provides sensible defaults for edit, view, delete, hardDelete, restore and switch actions
 * Uses lucide-react icons matching RowActionsCell design
 * 
 * @module components/DataTable/ActionDefaults
 */

export const ACTION_DEFAULTS = {
  edit: {
    type: "link",
    label: "Edit",
    icon: Edit2,
    title: "Edit",
    extraClass:
      "p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30",
  },
  view: {
    type: "button",
    label: "View Details",
    icon: Eye,
    title: "View Details",
    extraClass:
      "p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30",
  },
  delete: {
    type: "button",
    label: "Delete",
    icon: Trash2,
    title: "Delete",
    extraClass:
      "p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30",
  },
  /** Permanent / hard delete action — shown in trash-only mode */
  hardDelete: {
    type: "button",
    label: "Permanently Delete",
    icon: Flame,
    title: "Permanently Delete",
    extraClass:
      "p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-md transition-colors dark:text-rose-400 dark:hover:bg-rose-700",
  },
  /** Restore action — shown for trashed rows */
  restore: {
    type: "button",
    label: "Restore",
    icon: RotateCcw,
    title: "Restore",
    extraClass:
      "p-1.5 text-blue-500 hover:text-white hover:bg-blue-600 rounded-md transition-colors dark:text-blue-400 dark:hover:bg-blue-700",
  },
  switch: {
    type: "button",
    name: "switch",
    label: "",
    title: "Toggle Status",
  },
  custom: {
    type: "button",
    label: "Custom Action",
    title: "Custom Action",
  },
};

/**
 * Apply default configuration to an action based on its name
 */
export function applyActionDefaults(
  action,
  resourceName,
  resourceIdField = "id",
) {
  const actionName = action.name;
  const defaults = ACTION_DEFAULTS[actionName];

  // For switch action, return as-is (handled separately in TableBody)
  if (actionName === "switch") {
    return {
      ...defaults,
      ...action,
    };
  }

  // Merge defaults with user-provided config
  const mergedAction = {
    ...defaults,
    ...action,
  };

  // For custom actions, use the user's label as tooltip title when no explicit title given
  if (actionName === 'custom' && !action.title && action.label) {
    mergedAction.title = action.label;
  }

  // Auto-generate getHref for edit action if resourceName is provided
  if (actionName === "edit" && !mergedAction.getHref && resourceName) {
    mergedAction.getHref = (row) => `/${resourceName}/${row[resourceIdField]}/edit`;
  }

  // Auto-generate apiUrl for view action if resourceName is provided
  if (actionName === "view" && !mergedAction.apiUrl && !mergedAction.onClick && resourceName) {
    mergedAction.apiUrl = `/${resourceName}/:id`;
    // Generate modalEvent name if not provided
    if (!mergedAction.modalEvent) {
      const capitalizedResource = resourceName.charAt(0).toUpperCase() + resourceName.slice(0, -1);
      mergedAction.modalEvent = `show${capitalizedResource}DetailsModal`;
    }
  }

  return mergedAction;
}

/**
 * Create a default view action onClick handler
 */
export function createViewClickHandler(
  api,
  apiUrl,
  modalEvent,
  resourceIdField = "id",
) {
  if (!api) {
    throw new Error('createViewClickHandler requires "api" parameter');
  }

  return async (row) => {
    try {
      const url = apiUrl.replace(":id", row[resourceIdField]);
      const { data } = await api.get(url);
      window.dispatchEvent(new CustomEvent(modalEvent, { detail: data }));
    } catch (error) {
      const toast = (await import("react-toastify")).toast;
      toast.error(error.message || "Failed to load details");
    }
  };
}

/**
 * Create a default delete action onClick handler with confirmation
 */
export function createDeleteClickHandler(
  api,
  deleteUrl,
  confirmMessage,
  resourceIdField = "id",
  options = {}
) {
  if (!api) {
    throw new Error('createDeleteClickHandler requires "api" parameter');
  }

  return async (row) => {
    try {
      // Try to use SweetAlert2 if available
      const Swal = window.Swal;

      if (Swal) {
        const result = await Swal.fire({
          title: options?.confirmTitle || "Are you sure?",
          text: typeof confirmMessage === "function" ? confirmMessage(row) : confirmMessage,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: options?.confirmButtonText || "Yes, delete it!",
        });

        if (!result.isConfirmed) return;
      } else {
        const message = typeof confirmMessage === "function" ? confirmMessage(row) : confirmMessage;
        if (!window.confirm(message)) return;
      }

      // Perform delete operation
      const url = typeof deleteUrl === "function" 
        ? deleteUrl(row) 
        : deleteUrl.replace(":id", row[resourceIdField]);
      await api.delete(url);

      // Show success message
      const toast = (await import("react-toastify")).toast;
      const successMsg = options?.successMessage
        ? typeof options.successMessage === "function"
          ? options.successMessage(row)
          : options.successMessage
        : "Deleted successfully";
      toast.success(successMsg);

      // Trigger refresh
      if (options?.onRefresh) {
        options.onRefresh();
      }
    } catch (error) {
      const toast = (await import("react-toastify")).toast;
      toast.error(error.message || "Failed to delete");
    }
  };
}

/**
 * Create a hard-delete (permanent) action onClick handler.
 * Shows a severe "cannot be undone" confirmation before calling
 * DELETE url?hardDelete=true.
 */
export function createHardDeleteClickHandler(
  api,
  deleteUrl,
  confirmMessage,
  resourceIdField = "id",
  options = {}
) {
  if (!api) {
    throw new Error('createHardDeleteClickHandler requires "api" parameter');
  }

  return async (row) => {
    try {
      const Swal = window.Swal;
      const defaultMsg = typeof confirmMessage === "function"
        ? confirmMessage(row)
        : (confirmMessage || "This will permanently remove the record from the database. This action cannot be undone.");

      if (Swal) {
        const result = await Swal.fire({
          title: options?.confirmTitle || "Permanently Delete?",
          text: defaultMsg,
          icon: "error",
          showCancelButton: true,
          confirmButtonColor: "#991b1b",
          cancelButtonColor: "#6b7280",
          confirmButtonText: options?.confirmButtonText || "Yes, permanently delete!",
        });
        if (!result.isConfirmed) return;
      } else {
        if (!window.confirm(`⚠️ PERMANENT DELETE ⚠️\n\n${defaultMsg}`)) return;
      }

      // Build URL and append hardDelete=true
      const baseUrl = typeof deleteUrl === "function"
        ? deleteUrl(row)
        : deleteUrl.replace(":id", row[resourceIdField]);
      const separator = baseUrl.includes('?') ? '&' : '?';
      await api.delete(`${baseUrl}${separator}hardDelete=true`);

      const toast = (await import("react-toastify")).toast;
      const successMsg = options?.successMessage
        ? (typeof options.successMessage === "function" ? options.successMessage(row) : options.successMessage)
        : "Permanently deleted";
      toast.success(successMsg);

      if (options?.onRefresh) options.onRefresh();
    } catch (error) {
      const toast = (await import("react-toastify")).toast;
      toast.error(error.message || "Failed to permanently delete");
    }
  };
}

/**
 * Create a restore action onClick handler.
 * Calls PATCH restoreUrl to restore a soft-deleted record.
 */
export function createRestoreClickHandler(
  api,
  restoreUrl,
  resourceIdField = "id",
  options = {}
) {
  if (!api) {
    throw new Error('createRestoreClickHandler requires "api" parameter');
  }

  return async (row) => {
    try {
      const url = typeof restoreUrl === "function"
        ? restoreUrl(row)
        : restoreUrl.replace(":id", row[resourceIdField]);
      await api.patch(url);

      const toast = (await import("react-toastify")).toast;
      toast.success(options?.successMessage || "Restored successfully");

      if (options?.onRefresh) options.onRefresh();
    } catch (error) {
      const toast = (await import("react-toastify")).toast;
      toast.error(error.message || "Failed to restore");
    }
  };
}
