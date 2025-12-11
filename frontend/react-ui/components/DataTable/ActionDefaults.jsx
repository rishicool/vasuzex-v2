import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

/**
 * ActionDefaults - Production Ready
 * 
 * Default configurations for common DataTable actions
 * Provides sensible defaults for edit, view, delete, and switch actions
 * 
 * @module components/DataTable/ActionDefaults
 */

export const ACTION_DEFAULTS = {
  edit: {
    type: "link",
    label: "Edit",
    icon: FiEdit,
    title: "Edit",
    extraClass:
      "rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-gray-700",
  },
  view: {
    type: "button",
    label: "View Details",
    icon: FiEye,
    title: "View Details",
    extraClass:
      "rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700",
  },
  delete: {
    type: "button",
    label: "Delete",
    icon: FiTrash2,
    title: "Delete",
    extraClass:
      "rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700",
  },
  switch: {
    type: "button",
    name: "switch",
    label: "",
    title: "Toggle Status",
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
      const url = deleteUrl.replace(":id", row[resourceIdField]);
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
